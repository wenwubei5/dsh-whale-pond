import fs from 'node:fs';
const PORT = 9333, want = process.argv[2] || '4406';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let list = [];
for (let i = 0; i < 20; i++) { try { list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (list.length) break; } catch (e) {} await sleep(300); }
const page = list.find(x => x.type === 'page' && (x.url || '').includes(want));
if (!page) { console.log('NO TARGET'); process.exit(2); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
await new Promise(r => { ws.onopen = r; });
const send = (method, params) => new Promise(res => { const i = ++seq; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Page.bringToFront');
await sleep(700);
const r = await send('Runtime.evaluate', { expression: "JSON.stringify({hidden: document.hidden, vis: document.visibilityState, focus: document.hasFocus()})", returnByValue: true });
console.log('front state: ' + (r.result && r.result.result ? r.result.result.value : JSON.stringify(r).slice(0, 200)));
process.exit(0);