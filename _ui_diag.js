const { spawn } = require('child_process');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = 'file:///D:/deepseek%20harness/%E8%80%83%E7%A0%94/%E8%AE%B0%E5%BF%86app/_mt.html';
const port = 9342;
const profile = 'D:/deepseek harness/考研/记忆app/_cp7';
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
  await sleep(2500);

  const expr = `(function(){
    var out = [];
    out.push('errs=' + (window._errs.length ? window._errs.join(' | ') : 'none'));
    out.push('bodySubj=' + document.body.getAttribute('data-subject'));
    var hdr = document.querySelector('header');
    out.push('hdrIcon=' + (hdr ? hdr.getAttribute('data-subject-icon') : 'none'));
    if (hdr) {
      var bg = getComputedStyle(hdr).backgroundImage;
      out.push('hdrBgImage=' + (bg && bg !== 'none' ? bg.slice(0,80) : 'none'));
      var after = getComputedStyle(hdr, '::after');
      out.push('afterContent=' + after.content);
    }
    // switch to econ and stats to confirm attribute updates
    var sel = document.getElementById('subjectSelect');
    sel.value = 'econ'; sel.dispatchEvent(new Event('change', {bubbles:true}));
    return out.join('\\n');
  })()`;
  const r1 = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(r1.result && r1.result.value);
  await sleep(900);
  const expr2 = `(function(){
    return 'afterSwitch subj=' + document.body.getAttribute('data-subject') + ' icon=' + (document.querySelector('header')||{}).getAttribute?.('data-subject-icon');
  })()`;
  const r2 = await send('Runtime.evaluate', { expression: expr2, returnByValue: true });
  console.log(r2.result && r2.result.value);
  ws.close();
  proc.kill();
  setTimeout(() => process.exit(0), 200);
})();
