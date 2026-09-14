#!/usr/bin/env node
/*
 * athena-cli.mjs —— 终端数据库编辑 CLI（阶段 A：Git 即数据库）
 *
 * 应用云同步把每科学习数据库存在 GitHub 私仓的 athena-sync/data/<sid>.json（base64 编码 JSON）。
 * 本工具把这条通道开放给终端：拉取为可编辑的本地 JSON → 用任何编辑器/脚本修改 → 校验后推回。
 * 推回的内容走应用同一条同步通道，各端下次同步自动合并生效。
 *
 * 用法：
 *   node tools/athena-cli.mjs init   <token> <owner/repo>   # 写入本地配置（.athena-cli.json，已 gitignore）
 *   node tools/athena-cli.mjs list                           # 列出云端各科数据库
 *   node tools/athena-cli.mjs pull <sid|all>                 # 拉取到 data-db/<sid>.json（可编辑副本）
 *   node tools/athena-cli.mjs push <sid>                     # 校验并推回云端
 *   node tools/athena-cli.mjs status [<sid>]                 # 比对本地副本与云端版本
 *
 * 环境变量 ATHENA_TOKEN / GITHUB_TOKEN 可替代 init 配置中的 token。
 * 编辑须知：
 *   - 卡片调度字段（due/lastR/stab/diff…）必须为有限数字；state 仅限 new/learning/relearning/review。
 *   - push 前会跑与加载时同一套校验，非法字段会被点名拒绝——改坏的数据进不了云端。
 *   - 推回后应用端无需操作：下次打开自动拉取合并（按 lastR 逐卡取新）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CFG_FILE = path.join(ROOT, '.athena-cli.json');
const OUT_DIR = path.join(ROOT, 'data-db');
const SYNC_DIR = 'athena-sync';
const API = 'https://api.github.com';

function readCfg() {
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')); } catch (e) {}
  const token = process.env.ATHENA_TOKEN || process.env.GITHUB_TOKEN || cfg.token;
  const repo = cfg.repo;
  if (!token || !repo) {
    console.error('缺少配置：先执行 init <token> <owner/repo>，或设置 ATHENA_TOKEN 环境变量。');
    process.exit(1);
  }
  return { token, repo };
}

async function gh(pathname, opts) {
  const { token, repo } = readCfg();
  const init = Object.assign({
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'athena-cli',
      'Content-Type': 'application/json'
    }
  }, opts || {});
  const resp = await fetch(API + '/repos/' + repo + '/contents/' + pathname, init);
  return resp;
}

async function ghJson(pathname, opts) {
  const resp = await gh(pathname, opts);
  const j = await resp.json().catch(function () { return null; });
  if (!resp.ok) {
    const msg = (j && j.message) || ('HTTP ' + resp.status);
    throw new Error(pathname + ' → ' + msg);
  }
  return j;
}

function b64decode(content) {
  return Buffer.from(String(content).replace(/\s/g, ''), 'base64').toString('utf8');
}
function b64encode(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

// —— 校验：与 store.mjs normalizeDB/sanitizeCard 同口径的最低限度不变量 ——
function validateDb(db, sid) {
  const errs = [];
  if (!db || typeof db !== 'object') return [sid + ': 根节点不是对象'];
  const STATES = ['new', 'learning', 'relearning', 'review'];
  const fin = function (v) { return typeof v === 'number' && isFinite(v); };
  ['cards', 'wrongs'].forEach(function (key) {
    const bag = db[key];
    if (bag != null && typeof bag !== 'object') { errs.push(sid + ': ' + key + ' 不是对象'); return; }
    Object.keys(bag || {}).forEach(function (id) {
      const c = bag[id];
      if (!c || typeof c !== 'object') { errs.push(sid + '/' + key + '/' + id + ': 非对象'); return; }
      if (c.state != null && STATES.indexOf(c.state) === -1) errs.push(sid + '/' + id + ': state 非法 ' + JSON.stringify(c.state));
      if (c.state === 'learning' || c.state === 'relearning' || c.state === 'review') {
        if (!fin(c.due)) errs.push(sid + '/' + id + ': ' + c.state + ' 态 due 必须为有限数字');
      }
      ['due', 'lastR', 'stab', 'diff', 'ivl', 'reps', 'lapses', 'grad', 'step'].forEach(function (f) {
        if (c[f] != null && !fin(c[f])) errs.push(sid + '/' + id + ': ' + f + ' 非有限数字（NaN/Infinity 不允许）');
      });
    });
  });
  return errs;
}

function outPath(sid) { return path.join(OUT_DIR, sid + '.json'); }

async function listCloud() {
  const j = await ghJson(SYNC_DIR + '/data');
  return (j || []).filter(function (x) { return x.name.endsWith('.json'); })
    .map(function (x) { return { sid: x.name.replace(/\.json$/, ''), sha: x.sha, size: x.size }; });
}

async function pull(sid) {
  const j = await ghJson(SYNC_DIR + '/data/' + sid + '.json');
  const db = JSON.parse(b64decode(j.content));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const meta = { sid: sid, sha: j.sha, pulledAt: new Date().toISOString(), updatedAt: db.updatedAt || 0 };
  fs.writeFileSync(outPath(sid), JSON.stringify(db, null, 2), 'utf8');
  fs.writeFileSync(outPath(sid) + '.meta', JSON.stringify(meta, null, 2), 'utf8');
  console.log('已拉取 ' + sid + '（updatedAt ' + new Date(db.updatedAt || 0).toISOString() + '）→ data-db/' + sid + '.json');
}

async function push(sid) {
  const file = outPath(sid);
  if (!fs.existsSync(file)) { console.error('本地无 data-db/' + sid + '.json，先 pull。'); process.exit(1); }
  let db;
  try { db = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error('JSON 解析失败：' + e.message); process.exit(1); }
  const errs = validateDb(db, sid);
  if (errs.length) {
    console.error('校验未通过，拒绝推回（' + errs.length + ' 处）：');
    errs.slice(0, 20).forEach(function (e) { console.error('  ✗ ' + e); });
    process.exit(1);
  }
  const cur = await ghJson(SYNC_DIR + '/data/' + sid + '.json').catch(function () { return null; });
  const body = { message: 'Athena CLI：编辑 ' + sid + '（' + new Date().toISOString() + '）', content: b64encode(JSON.stringify(db)) };
  if (cur) body.sha = cur.sha;
  const resp = await gh(SYNC_DIR + '/data/' + sid + '.json', { method: 'PUT', body: JSON.stringify(body) });
  if (!resp.ok) {
    const j = await resp.json().catch(function () { return ({}); });
    console.error('推回失败（HTTP ' + resp.status + '）：' + (j.message || '') + (resp.status === 409 || resp.status === 422 ? ' —— 云端已有更新，请先 pull 合并你的改动。' : ''));
    process.exit(1);
  }
  console.log('已推回 ' + sid + '（校验通过，' + Object.keys((db.cards) || {}).length + ' 卡）');
}

async function status(sid) {
  const cloud = await listCloud();
  const want = sid ? cloud.filter(function (x) { return x.sid === sid; }) : cloud;
  if (!want.length) { console.log('云端无数据库（尚未在应用里开过自动同步）。'); return; }
  want.forEach(function (c) {
    const local = fs.existsSync(outPath(c.sid)) ? JSON.parse(fs.readFileSync(outPath(c.sid), 'utf8')) : null;
    const metaFile = outPath(c.sid) + '.meta';
    let stale = '未拉取';
    if (local) {
      // 与云端比对 updatedAt（云端文件内容重建成本高——用 pull 时记录的 sha 快照判断落后）
      try {
        const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
        stale = meta.sha === c.sha ? '与 pull 时一致' : '云端已更新（可能应用端有新数据），建议重新 pull';
      } catch (e) { stale = '云端已更新'; }
    }
    console.log(c.sid.padEnd(12) + ' updatedAt ' + new Date((local && local.updatedAt) || 0).toISOString().slice(0, 16) + '  ' + stale);
  });
}

const [, , cmd, a1, a2] = process.argv;
(async function () {
  try {
    if (cmd === 'init') {
      if (!a1 || !a2) { console.error('用法：init <token> <owner/repo>'); process.exit(1); }
      fs.writeFileSync(CFG_FILE, JSON.stringify({ token: a1, repo: a2 }, null, 2), 'utf8');
      console.log('配置已写入 .athena-cli.json（已 gitignore，不会入库）。');
    } else if (cmd === 'list') {
      (await listCloud()).forEach(function (c) { console.log(c.sid.padEnd(12) + (c.size / 1024).toFixed(0) + ' KB'); });
    } else if (cmd === 'pull') {
      if (!a1) { console.error('用法：pull <sid|all>'); process.exit(1); }
      if (a1 === 'all') {
        for (const c of await listCloud()) await pull(c.sid);
      } else await pull(a1);
    } else if (cmd === 'push') {
      if (!a1) { console.error('用法：push <sid>'); process.exit(1); }
      await push(a1);
    } else if (cmd === 'status') {
      await status(a1);
    } else {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(4, 22).join('\n'));
    }
  } catch (e) {
    console.error('失败：' + e.message);
    process.exit(1);
  }
})();
