const { spawn } = require('child_process');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = 'file:///D:/deepseek%20harness/%E8%80%83%E7%A0%94/%E8%AE%B0%E5%BF%86app/_mt.html';
const port = 9340;
const profile = 'D:/deepseek harness/考研/记忆app/_cp5';
const proc = spawn(chrome, ['--headless=new','--disable-gpu','--remote-debugging-port='+port,'--window-size=1400,900','--no-first-run','--no-default-browser-check','--user-data-dir='+profile,url], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async function () {
  let page = null;
  for (let i = 0; i < 60; i++) {
    try { const l = await (await fetch('http://127.0.0.1:'+port+'/json/list')).json(); page = l.find(t=>t.type==='page'); if (page) break; } catch (e) {}
    await sleep(300);
  }
  if (!page) { console.log('NO_TARGET'); proc.kill(); process.exit(0); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = {};
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; } };
  const send = (method, params) => new Promise((res) => { const mid = ++id; pending[mid]=res; ws.send(JSON.stringify({id:mid,method,params})); });
  await new Promise((r) => { ws.onopen = r; });
  await sleep(3500);

  const expr = `(function(){
    var out = [];
    var found = null;
    document.querySelectorAll('foreignObject').forEach(function(fo){ if(!found && fo.querySelector('.sqrt')) found = fo; });
    if (!found) { out.push('no sqrt'); return out.join('\\n'); }
    var sqrt = found.querySelector('.sqrt');
    out.push('FULL_HTML=' + sqrt.outerHTML);
    var tags = [];
    sqrt.querySelectorAll('*').forEach(function(e){ tags.push(e.tagName.toLowerCase() + '.' + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className)); });
    out.push('DESC=' + tags.join('|'));
    // find any element with a border-top
    var borders = [];
    sqrt.querySelectorAll('*').forEach(function(e){ var bt = getComputedStyle(e).borderTopWidth; if(bt && parseFloat(bt)>0) borders.push(e.tagName+'.'+e.className+'='+bt); });
    out.push('BORDERS=' + (borders.join(',') || 'none'));
    var katex = sqrt.closest('.katex');
    if (katex) out.push('katexFont=' + getComputedStyle(katex).fontFamily + ' size=' + getComputedStyle(katex).fontSize);
    var mord = sqrt.querySelector('.mord.mathnormal');
    if (mord) out.push('mordFont=' + getComputedStyle(mord).fontFamily + ' size=' + getComputedStyle(mord).fontSize + ' color=' + getComputedStyle(mord).color + ' vis=' + getComputedStyle(mord).visibility);
    return out.join('\\n');
  })()`;
  const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(result.result && result.result.value);
  ws.close();
  proc.kill();
  setTimeout(() => process.exit(0), 200);
})();
