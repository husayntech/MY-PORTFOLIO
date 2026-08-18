const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const PORT = 9235;
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
    let failed = 0;
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
        await cdp.send('Network.enable');

        cdp.events = [];
        await cdp.send('Page.navigate', { url: BASE + '/' });
        await sleep(4000);

        // 1) Failed/aborted network requests
        const failures = cdp.events.filter(e => e.method === 'Network.loadingFailed');
        const failedReqs = [];
        for (const ev of failures) {
            const reqId = ev.params.requestId;
            const gotResponse = cdp.events.find(e => e.method === 'Network.responseReceived' && e.params.requestId === reqId);
            const url = gotResponse ? gotResponse.params.response.url : '(no response)';
            failedReqs.push(url + ' :: ' + ev.params.errorText);
        }
        console.log('=== FAILED REQUESTS ===');
        failedReqs.forEach(f => console.log(' ', f));
        if (!failedReqs.length) console.log('  none');

        // 2) Exceptions during interactions
        console.log('=== INTERACTION EXCEPTIONS ===');
        const before = cdp.events.filter(e => e.method === 'Runtime.exceptionThrown').length;
        await cdp.eval(`document.getElementById('editor-toggle').click()`);
        await sleep(400);
        await cdp.eval(`document.getElementById('content-edit-toggle').click()`);
        await sleep(400);
        await cdp.eval(`document.getElementById('hero-image').click()`);
        await sleep(400);
        await cdp.eval(`document.getElementById('content-modal').classList.add('hidden'); document.getElementById('content-modal-textarea') && null;`);
        await cdp.eval(`document.getElementById('hero-badge-0').click()`);
        await sleep(400);
        await cdp.eval(`document.getElementById('content-modal').classList.add('hidden');`);
        await cdp.eval(`document.getElementById('editor-primary-swatch').click()`);
        await sleep(400);
        const after = cdp.events.filter(e => e.method === 'Runtime.exceptionThrown');
        const newOnes = after.slice(before);
        if (!newOnes.length) console.log('  no exceptions during interactions');
        newOnes.forEach(e => {
            const d = e.params.exceptionDetails;
            console.log('  EXCEPTION:', (d.exception && d.exception.description || d.text || '').split('\n').slice(0, 4).join(' | '));
        });

        // 3) readyState + whether any resource is still pending after 4s
        const state = await cdp.eval(`JSON.stringify({ ready: document.readyState, imgs: Array.from(document.images).map(i => i.complete + ':' + i.src.split('/').pop()), toggle: !!document.getElementById('editor-toggle') })`);
        console.log('=== PAGE STATE ===', state);

        ws.close();
    } catch (err) {
        failed = 1;
        console.log('ERROR:', err.message);
        console.log(err.stack);
    } finally {
        try { if (cdp) cdp.send('Browser.close'); } catch (e) {}
        try { chrome.kill('SIGKILL'); } catch (e) {}
    }
    process.exit(failed);
})();
