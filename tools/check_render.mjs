#!/usr/bin/env node
/*
 * tools/check_render.mjs —— 渲染不变量校验（跑真实 renderTex + KaTeX 管线）
 *
 * 原理：用 headless Chrome（CDP 协议，Node 原生 WebSocket/fetch，零 npm 依赖）打开
 *       index.html?selftest=1，触发 app.js 里的自检钩子，把全部学科、全部卡片的
 *       title/front/back、例题 q/a/a2、陷阱 PITFALL、助记 MNEM 都交给真实 renderTex 渲染，
 *       再统计：katex 渲染错误、字面 `**`、残留的 \textbf/\underline/... 命令、字面 \n。
 * 这些是「通用不变量」——不管内容未来出现什么新写法，只要破坏渲染就报错。
 *
 * 用法：  node tools/check_render.mjs
 * 退出码：0 = 全绿；1 = 有问题；2 = 环境错误（找不到 Chrome 等）
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (p && fs.existsSync(p)) return p;
  return null;
}

// —— 极简静态服务器（只读，serve 项目根） ——
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
};
function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const file = path.normalize(path.join(ROOT, rel));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

// —— 极简 CDP 客户端（原生 WebSocket） ——
class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
      }
    };
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evalExpr(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return r.result.value;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const chrome = findChrome();
  if (!chrome) { console.error('❌ 找不到 Chrome/Edge，无法运行渲染校验'); process.exit(2); }

  const srv = await startServer();
  const port = srv.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'athena-selftest-'));

  // 远程调试端口随机取一个高位端口
  const dbgPort = 9300 + Math.floor(Math.random() * 400);
  const chromeProc = spawn(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--disable-extensions', '--disable-background-networking',
    `--remote-debugging-port=${dbgPort}`, `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let target = null;
  try {
    // 等 DevTools 端点就绪
    let versions = null;
    for (let i = 0; i < 60; i++) {
      try {
        const r = await fetch(`http://127.0.0.1:${dbgPort}/json/list`);
        const list = await r.json();
        const page = list.find((t) => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) { target = page.webSocketDebuggerUrl; break; }
      } catch (e) { /* not ready */ }
      await sleep(250);
    }
    if (!target) { console.error('❌ 无法连接 Chrome DevTools 端点'); process.exit(2); }

    const cdp = new CDP(target);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?selftest=1` });

    // 等自检完成（最长 30s；KaTeX 本地加载很快）
    let result = null;
    for (let i = 0; i < 120; i++) {
      const ready = await cdp.evalExpr('!!(window.__selftestReady && window.__selftestResult)');
      if (ready) {
        result = await cdp.evalExpr('window.__selftestResult');
        break;
      }
      await sleep(250);
    }

    if (!result) { console.error('❌ 自检超时（30s 内未出结果）'); process.exit(2); }

    console.log('=== 渲染不变量校验（真实 renderTex + KaTeX） ===\n');
    console.log(`KaTeX 就绪: ${result.katexOk ? '是' : '否（降级为纯文本，结果不可信）'}`);
    console.log(`卡片数: ${result.cards} | 渲染字段数: ${result.fields} | 问题数: ${result.problems.length}\n`);

    if (result.problems.length === 0) {
      console.log('✅ 全绿：无 katex-error、无字面 `**`、无残留 LaTeX 命令、无字面 \\n');
      process.exit(0);
    }
    for (const p of result.problems) {
      console.error(`  [ERR] ${p.sid}/${p.id}.${p.field}  katexErr=${p.kerr} lit**=${p.litStar} litCmd=${p.litCmd} lit\\n=${p.litN}`);
      console.error(`        → ${p.snippet}`);
    }
    console.error(`\n❌ 发现 ${result.problems.length} 处渲染问题`);
    process.exit(1);
  } finally {
    try { chromeProc.kill(); } catch (e) {}
    try { srv.close(); } catch (e) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
}

main().catch((e) => { console.error('❌ 异常:', e); process.exit(2); });
