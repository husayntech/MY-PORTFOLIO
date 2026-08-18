const http = require('http');
const { spawn } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9352;

async function main() {
  const chrome = spawn(CHROME, ['--headless', '--disable-gpu', `--remote-debugging-port=${PORT}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2000));
  let ws;
  try {
    const targets = await new Promise((res, rej) => {
      const req = http.request(`http://127.0.0.1:${PORT}/json/new?http://localhost:3001/`, { method: 'PUT' }, r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      });
      req.on('error', rej);
      req.end();
    });
    ws = new WebSocket(targets.webSocketDebuggerUrl);
    let id = 0;
    const pending = {};
    const send = (method, params) => new Promise(res => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 6000));
    const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

    const results = [];
    const check = (name, pass, extra) => { results.push(pass); console.log((pass ? 'PASS' : 'FAIL') + ' - ' + name + (extra ? ' (' + extra + ')' : '')); };

    // 1. Editor UI injected
    const injected = await evalJs("!!document.getElementById('editor-toggle') && !!document.getElementById('style-editor')");
    check('editor UI injected', injected);

    // 2. Panel opens
    await evalJs("toggleEditor(); true");
    await new Promise(r => setTimeout(r, 400));
    const open = await evalJs("document.getElementById('style-editor').classList.contains('open')");
    check('panel opens', open);

    // 3. Styles auto-applied from DB (purple bg)
    const bg = await evalJs("getComputedStyle(document.body).backgroundColor");
    check('saved styles applied', bg === 'rgb(60, 27, 105)', bg);

    // 4. Content auto-applied (badge text from DB)
    const badge = await evalJs("document.getElementById('content-hero-badge').textContent");
    check('saved content applied', badge === 'Educator & Designer', badge);

    // 5. RGB picker opens from a swatch
    await evalJs("document.getElementById('sec-colors').previousElementSibling.click(); true");
    await new Promise(r => setTimeout(r, 300));
    await evalJs("document.getElementById('editor-gold-swatch').click(); true");
    await new Promise(r => setTimeout(r, 300));
    const rgbOpen = await evalJs("!document.getElementById('rgb-picker').classList.contains('hidden')");
    const rgbR = await evalJs("document.getElementById('rgb-r').value");
    check('RGB picker opens prefilled', rgbOpen && rgbR === '201', 'R=' + rgbR);
    await evalJs("closeRgbPicker(); true");

    // 6. Edit mode + modal
    await evalJs("enterContentEdit(); true");
    await new Promise(r => setTimeout(r, 400));
    await evalJs("document.getElementById('content-hero-badge').click(); true");
    await new Promise(r => setTimeout(r, 500));
    const modalKey = await evalJs("document.getElementById('content-modal-key').textContent");
    check('modal opens for badge', modalKey === 'hero_badge', modalKey);

    // 7. Change badge text, save, reload, verify
    await evalJs("document.getElementById('content-modal-textarea').value = 'Edited After Extract'; saveContentModal(); true");
    await new Promise(r => setTimeout(r, 1500));
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 6000));
    const badge2 = await evalJs("document.getElementById('content-hero-badge').textContent");
    check('content edit persists after extraction', badge2 === 'Edited After Extract', badge2);

    console.log('\n' + results.filter(Boolean).length + '/' + results.length + ' checks passed');
    ws.close();
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    chrome.kill();
  }
}
main();
