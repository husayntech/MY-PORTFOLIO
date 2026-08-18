// Load pages and capture console errors + exceptions to find the crash
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const PORT = 9234;
const BASE = 'http://localhost:3001';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function getJson(p, m = 'GET') {
    return new Promise((res, rej) => {
        const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: m }, x => {
            let d = ''; x.on('data', c => d += c);
            x.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
        });
        r.on('error', rej);
        r.end();
    });
}

class CDP {
    constructor(ws) {
        this.ws = ws; this.id = 0; this.p = new Map(); this.events = [];
        ws.onmessage = e => {
            const m = JSON.parse(e.data);
            if (m.id && this.p.has(m.id)) {
                const q = this.p.get(m.id); this.p.delete(m.id);
                m.error ? q.rej(new Error(m.error.message)) : q.res(m.result);
            } else if (m.method) {
                this.events.push(m);
            }
        };
    }
    send(method, params = {}) {
        return new Promise((res, rej) => {
            const id = ++this.id;
            this.p.set(id, { res, rej });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }
    async eval(expression) {
        const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description));
        return r.result.value;
    }
}

(async () => {
    const userData = path.join(os.tmpdir(), 'cdp-' + Math.random().toString(36).slice(2));
    const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
        '--headless=new', '--disable-gpu', '--no-sandbox',
        '--remote-debugging-port=' + PORT, '--user-data-dir=' + userData, 'about:blank'
    ], { stdio: 'ignore' });
    let cdp;
    let exitCode = 0;
    try {
        let v = null;
        for (let i = 0; i < 40 && !v; i++) {
            try { v = await getJson('/json/version'); } catch (e) {}
            if (!v) await sleep(250);
        }
        if (!v) throw new Error('Chrome not available');
        const t = await getJson('/json/new?about:blank', 'PUT');
        const ws = new WebSocket(t.webSocketDebuggerUrl);
        await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
        cdp = new CDP(ws);
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Log.enable');

        for (const page of ['/', '/projects.html', '/admin.html']) {
            cdp.events = [];
            await cdp.send('Page.navigate', { url: BASE + page });
            await sleep(3000);
            const errs = cdp.events.filter(e => e.method === 'Runtime.exceptionThrown' || e.method === 'Log.entryAdded' || e.method === 'Runtime.consoleAPICalled');
            console.log('\n=== ' + page + ' ===');
            if (!errs.length) {
                console.log('  no console errors/exceptions');
            }
            errs.forEach(e => {
                if (e.method === 'Runtime.exceptionThrown') {
                    const d = e.params.exceptionDetails;
                    console.log('  EXCEPTION:', (d.exception && d.exception.description || d.text || '').split('\n')[0], '@', d.url, d.lineNumber);
                } else if (e.method === 'Log.entryAdded') {
                    const d = e.params.entry;
                    if (d.level === 'error') console.log('  LOG ERROR:', d.text);
                } else if (e.method === 'Runtime.consoleAPICalled') {
                    if (e.params.type === 'error') console.log('  CONSOLE ERROR:', JSON.stringify(e.params.args.map(a => a.value || a.description).slice(0, 3)));
                }
            });
            // Page healthy?
            const state = await cdp.eval(`JSON.stringify({ ready: document.readyState, editor: !!document.getElementById('editor-toggle'), badges: document.querySelectorAll('.hero-badge').length })`).catch(e => 'eval failed: ' + e.message);
            console.log('  state:', state);
        }
        ws.close();
    } catch (err) {
        exitCode = 1;
        console.log('ERROR:', err.message);
        console.log(err.stack);
    } finally {
        try { if (cdp) cdp.send('Browser.close'); } catch (e) {}
        try { chrome.kill('SIGKILL'); } catch (e) {}
    }
    process.exit(exitCode);
})();
