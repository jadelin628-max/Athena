  function renderTex(el, str) {
    el.setAttribute('data-tex', str);
    el.innerHTML = '';
    if (typeof window.katex !== 'undefined' && window.katex.render) {
      const pts = splitPoints(String(str));
      if (pts.length > 1) {
        pts.forEach(function (pt) {
          const d = document.createElement('div');
          d.className = 'ans-point';
          renderInto(d, pt);
          el.appendChild(d);
        });
      } else {
        renderInto(el, String(str));
      }
    } else {
      el.textContent = String(str).replace(/\$/g, '');
    }
  }
  // 找到从 open 位置起、与第 0 层 `{` 配对的 `}`（支持嵌套花括号，如 $\chi^{2}$ 里的 {2}）；找不到返回 -1
  function matchBrace(str, open) {
    let depth = 0;
    for (let j = open; j < str.length; j++) {
      const c = str[j];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return j; }
    }
    return -1;
  }
  // 返回从 from 起下一个特殊字符（$、\、*）的下标；无则 -1
  function nextSpecial(str, from) {
    for (let j = from; j < str.length; j++) {
      const c = str[j];
      if (c === '$' || c === '\\' || c === '*') return j;
    }
    return -1;
  }
  // 把字符串渲染进 el：字符级扫描器（非单条正则）——
  //   $$..$$/$..$ 走 KaTeX；\textbf/\underline/\textit/\textrm/\textsf/\mathbf/\mathrm/\text{...}
  //   与 markdown **...** 转 HTML（应用字体）；\cmd{...} 用括号配对读取，内部可再含 $..$ 数学与嵌套花括号（递归）。
  //   这样 \textbf{方差用 $\chi^{2}$} 或 \underline{$\chi^{2}$ 拟合} 也能整体匹配，不再被 {2} 截断。
  function renderInto(el, str) {
    let i = 0;
    const n = str.length;
    while (i < n) {
      const ch = str[i];
      // 1) 行间公式 $$...$$
      if (ch === '$' && str[i + 1] === '$') {
        const end = str.indexOf('$$', i + 2);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const body = str.slice(i + 2, end);
        const d = document.createElement('div');
        d.className = 'kx-block';
        try { window.katex.render(body, d, { displayMode: true, throwOnError: false }); }
        catch (e) { d.textContent = body; }
        el.appendChild(d);
        i = end + 2;
        continue;
      }
      // 2) 行内公式 $...$
      if (ch === '$') {
        const end = str.indexOf('$', i + 1);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const body = str.slice(i + 1, end);
        const sp = document.createElement('span');
        sp.className = 'kx-inline';
        try { window.katex.render(body, sp, { displayMode: false, throwOnError: false }); }
        catch (e) { sp.textContent = body; }
        el.appendChild(sp);
        i = end + 1;
        continue;
      }
      // 3) markdown 加粗 **...**
      if (ch === '*' && str[i + 1] === '*') {
        const end = str.indexOf('**', i + 2);
        if (end === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
        const b = document.createElement('b');
        renderInto(b, str.slice(i + 2, end));
        el.appendChild(b);
        i = end + 2;
        continue;
      }
      // 4) 文本模式命令 \cmd{...}（括号配对，支持嵌套）
      if (ch === '\\') {
        const cm = /^\\(textbf|underline|textit|textrm|textsf|mathbf|mathrm|text)\{/.exec(str.slice(i));
        if (cm) {
          const tag = cm[1];
          const openBrace = i + cm[0].length - 1;
          const closeBrace = matchBrace(str, openBrace);
          if (closeBrace === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
          const inner = str.slice(openBrace + 1, closeBrace);
          if (tag === 'textbf' || tag === 'mathbf') {
            const b = document.createElement('b'); renderInto(b, inner); el.appendChild(b);
          } else if (tag === 'underline') {
            const u = document.createElement('u'); renderInto(u, inner); el.appendChild(u);
          } else if (tag === 'textit') {
            const it = document.createElement('i'); renderInto(it, inner); el.appendChild(it);
          } else {
            // textrm/textsf/mathrm/text → 应用字体，无额外标签
            renderInto(el, inner);
          }
          i = closeBrace + 1;
          continue;
        }
        // 无法识别的 \xxx：按字面保留（不吞掉，避免破坏后续内容）
        el.appendChild(document.createTextNode(ch));
        i++;
        continue;
      }
      // 5) 普通文本：前进到下一个特殊字符
      const nx = nextSpecial(str, i);
      if (nx === -1) { el.appendChild(document.createTextNode(str.slice(i))); break; }
      el.appendChild(document.createTextNode(str.slice(i, nx)));
      i = nx;
    }
  }

  // KaTeX 加载完成后，原地把已渲染的纯文本升级为公式（不打断当前学习状态）
  function upgradeAllMath() {
    document.querySelectorAll('[data-tex]').forEach(function (n) {
      renderTex(n, n.getAttribute('data-tex'));
    });
  }

  // ---------------- 数据持久化 ----------------
