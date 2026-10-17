(async function(){
  var out = {}, F = {};
  var cvId = 'whale-pond-canvas';
  function mine(c){ return c.canvas && c.canvas.id === cvId; }
  var _arc = CanvasRenderingContext2D.prototype.arc, arcs = 0;
  CanvasRenderingContext2D.prototype.arc = function(x, y, r){ if (mine(this)){ arcs++; if (!(isFinite(x) && isFinite(y) && isFinite(r))) F.badArcs = (F.badArcs || 0) + 1; } return _arc.apply(this, arguments); };
  var frames = 0; (function tick(){ frames++; requestAnimationFrame(tick); })();
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  async function sample(ms){ frames = 0; arcs = 0; await sleep(ms); return [ +(frames / (ms / 1000)).toFixed(1), frames ? Math.round(arcs / frames) : -1 ]; }
  var gear = document.getElementById('whale-pond-gear'), panel = document.getElementById('whale-pond-panel');
  function disp(){ return getComputedStyle(panel).display; }
  function open(){ for (var i = 0; i < 3 && disp() !== 'block'; i++) gear.click(); }
  out.dom0 = { canvas: document.querySelectorAll('#whale-pond-canvas').length, gear: document.querySelectorAll('#whale-pond-gear').length, panel: document.querySelectorAll('#whale-pond-panel').length, style: document.querySelectorAll('#whale-pond-style').length };
  out.loader = { type: typeof window.__ModuleLoader__, keys: Object.keys(window.__ModuleLoader__ || {}).slice(0, 8) };
  open();
  var rs = panel.querySelectorAll('input[type=range]'), cbs = panel.querySelectorAll('input[type=checkbox]');
  var SN = ['glass','brightness','count','speed','ar','ak','padR','padM','padPower'], CN = ['attract','ring','popToken','popWord','pad'];
  function set(i, v, cb){ if (cb){ cbs[i].checked = v; cbs[i].dispatchEvent(new Event('change')); } else { rs[i].value = v; rs[i].dispatchEvent(new Event('input')); } }
  out.nSliders = rs.length; out.nChecks = cbs.length;
  out.base = await sample(700);
  out.ctl = [];
  for (var i = 0; i < Math.min(9, rs.length); i++){
    set(i, parseFloat(rs[i].min), false); await sleep(220); var a = await sample(420);
    set(i, parseFloat(rs[i].max), false); await sleep(220); var b = await sample(420);
    out.ctl.push(SN[i] + ' min ' + a[0] + 'fps/' + a[1] + 'arc  max ' + b[0] + 'fps/' + b[1] + 'arc');
  }
  for (var i = 0; i < Math.min(5, cbs.length); i++){
    set(i, false, true); await sleep(220); var c = await sample(420);
    set(i, true, true);  await sleep(220); var d = await sample(420);
    out.ctl.push('cb:' + CN[i] + ' off ' + c[0] + 'fps/' + c[1] + 'arc  on ' + d[0] + 'fps/' + d[1] + 'arc');
  }
  open();
  var host = 0; window.addEventListener('keydown', function(){ host++; });
  out.panelBeforeEsc = disp();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  out.panelAfterEsc = disp();
  out.hostSawEscPanelOpen = host;
  host = 0;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  out.hostSawEscPanelClosed = host;
  var gr = gear.getBoundingClientRect();
  function under(x, y){ var els = document.elementsFromPoint(x, y) || []; return els.slice(0, 3).map(function(e){ return (e.id || e.tagName) + ':' + String(e.className || '').split(' ')[0]; }).join(' < '); }
  out.underGear = under(gr.left + gr.width / 2, gr.top + gr.height / 2);
  open();
  var pr = panel.getBoundingClientRect();
  out.panelRect = [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)];
  out.win = [window.innerWidth, window.innerHeight];
  out.underPanelMid = under(pr.left + pr.width / 2, pr.top + 40);
  var btns = panel.querySelectorAll('.wp-btn');
  if (btns.length) btns[0].click();
  await sleep(300);
  out.afterReset = await sample(600);
  out.savedAfterReset = (localStorage.getItem('whale-pond-settings-v1') || '').slice(0, 70);
  out.badArcs = F.badArcs || 0;
  out.hidden = document.hidden;
  open();
  return JSON.stringify(out);
})()
