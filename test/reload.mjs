import fs from 'node:fs';
const PORT = 9333, want = process.argv[2] || '4406', waitMs = Number(process.argv[3] || 9000);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let list = [];
for (let i = 0; i < 20; i++) { try { list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (list.length) break; } catch (e) {} await sleep(400); }
const page = list.find(x => x.type === 'page' && (x.url || '').includes(want)) || list.find(x => x.type === 'page');
if (!page) { console.log('NO TARGET ' + JSON.stringify(list).slice(0, 300)); process.exit(2); }
console.log('target: ' + page.url);
const ws = new WebSocket(page.webSocketDebuggerUrl);
let seq = 0; const pending = new Map(); const events = [];
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); };
await new Promise(r => { ws.onopen = r; });
const send = (method, params) => new Promise(res => { const i = ++seq; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
await send('Network.enable'); await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
console.log('emulated prefers-reduced-motion: no-preference');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Page.reload', { ignoreCache: true });
console.log('reload issued (cache disabled)');
await sleep(waitMs);
const r = await send('Runtime.evaluate', { expression: "JSON.stringify({canvas: !!document.getElementById('whale-pond-canvas'), bg: getComputedStyle(document.body).backgroundColor, inlineBg: document.body.style.getPropertyValue('background'), reduce: matchMedia('(prefers-reduced-motion: reduce)').matches})", returnByValue: true });
console.log('state: ' + (r.result && r.result.result ? r.result.result.value : JSON.stringify(r).slice(0,300)));
const errs = events.filter(e => e.method === 'Runtime.exceptionThrown');
console.log('exceptions after reload: ' + errs.length);
for (const e of errs.slice(0, 4)) console.log('  ' + JSON.stringify(e.params).slice(0, 200));
process.exit(0);
