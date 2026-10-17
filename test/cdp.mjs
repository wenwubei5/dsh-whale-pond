import fs from 'node:fs';
const PORT = 9333;
const exprFile = process.argv[2];
const shotPath = process.argv[3];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const expr = fs.readFileSync(exprFile, 'utf8');
let list = [];
for (let i = 0; i < 20; i++) { try { list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (list.length) break; } catch (e) {} await sleep(400); }
const want = process.argv[4] || '4399';
const page = list.find(x => x.type === 'page' && (x.url || '').includes(want)) || list.find(x => x.type === 'page');
if (!page) { console.log('NO TARGET ' + JSON.stringify(list).slice(0, 300)); process.exit(2); }
console.log('target: ' + page.url);
const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0; const pending = new Map(); const events = [];
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); };
await new Promise(r => { ws.onopen = r; });
const send = (method, params) => new Promise(res => { const i = ++seq; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await sleep(1500);
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
const res = r.result || {};
if (res.exceptionDetails) console.log('EVAL EXCEPTION: ' + JSON.stringify(res.exceptionDetails).slice(0, 800));
console.log('EVAL RESULT:\n' + String(res.result ? res.result.value : JSON.stringify(res)).slice(0, 6000));
if (shotPath) { const s = await send('Page.captureScreenshot', { format: 'png' }); if (s.result && s.result.data) { fs.writeFileSync(shotPath, Buffer.from(s.result.data, 'base64')); console.log('screenshot -> ' + shotPath); } }
const errs = events.filter(e => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params && e.params.type === 'error'));
console.log('errors captured: ' + errs.length);
for (const e of errs.slice(0, 6)) console.log('  ' + JSON.stringify(e.params).slice(0, 200));
process.exit(0);