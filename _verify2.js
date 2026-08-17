const { spawn } = require('child_process');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = 'file:///D:/deepseek%20harness/%E8%80%83%E7%A0%94/%E8%AE%B0%E5%BF%86app/_mt.html';
const port = 9341;
const profile = 'D:/deepseek harness/考研/记忆app/_cp6';
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
    out.push('errs=' + (window._errs.length ? window._errs.join(' | ') : 'none'));
    var canvas = document.querySelector('.map-canvas');
    out.push('canvas=' + !!canvas);
    if (!canvas) { out.push('appHTML=' + document.getElementById('app').innerHTML.slice(0,200)); return out.join('\\n'); }
    var pills = canvas.querySelectorAll(':scope > div');
    out.push('pillCount=' + pills.length);
    out.push('edgePathCount=' + canvas.querySelectorAll('svg path').length);
    // sqrt check
    var sq = null;
    pills.forEach(function(p){ if(!sq && p.querySelector('.sqrt')) sq = p; });
    out.push('sqrtPill=' + !!sq);
    if (sq) {
      var radicand = sq.querySelector('.sqrt .mord.mathnormal:not(.mtight)');
      if (radicand) {
        var b = radicand.getBoundingClientRect();
        out.push('radicand=' + JSON.stringify({text:radicand.textContent, fs:getComputedStyle(radicand).fontSize, w:Math.round(b.width), h:Math.round(b.height), vis:getComputedStyle(radicand).visibility}));
      } else out.push('radicand=NOT_FOUND');
      var isvg = sq.querySelector('.sqrt svg');
      if (isvg) { var ib = isvg.getBoundingClientRect(); out.push('innerSvg=' + JSON.stringify({w:Math.round(ib.width), h:Math.round(ib.height)})); }
      else out.push('innerSvg=none');
      out.push('pillText=' + sq.textContent.slice(0,30));
    }
    // click last pill (a card)
    var last = pills[pills.length-1];
    last.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
    out.push('modalAfterClick=' + !!document.querySelector('.map-modal'));
    var hd = document.querySelector('.map-panel-head strong');
    out.push('modalTitle=' + (hd ? hd.textContent : 'none'));
    return out.join('\\n');
  })()`;
  const result = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(result.result && result.result.value);
  ws.close();
  proc.kill();
  setTimeout(() => process.exit(0), 200);
})();
