(async () => {
  var out = {};
  var g = document.getElementById('whale-pond-gear');
  var p = document.getElementById('whale-pond-panel');
  out.gear = !!g; out.panel = !!p;
  out.displayInit = p ? getComputedStyle(p).display : 'n/a';
  if (g && (!p || getComputedStyle(p).display === 'none')) g.click();
  p = document.getElementById('whale-pond-panel');
  out.displayOpen = p ? getComputedStyle(p).display : 'n/a';
  var rs = p ? p.querySelectorAll('input[type=range]') : [];
  var cbs = p ? p.querySelectorAll('input[type=checkbox]') : [];
  out.sliders = rs.length; out.checks = cbs.length;
  var arc0 = CanvasRenderingContext2D.prototype.arc, frames = 0, arcs = 0, raf0 = window.requestAnimationFrame;
  window.requestAnimationFrame = function (cb) { frames++; return raf0.call(window, cb); };
  CanvasRenderingContext2D.prototype.arc = function () { arcs++; return arc0.apply(this, arguments); };
  function sample(ms){ return new Promise(function (r) { var a0 = arcs, f0 = frames; setTimeout(function () { r({ arcs: arcs - a0, frames: frames - f0 }); }, ms); }); }
  function setRange(i, v){ if (rs[i]) { rs[i].value = v; rs[i].dispatchEvent(new Event('input', { bubbles: true })); } }
  setRange(2, 700);
  var hi = await sample(1300);
  setRange(2, 150);
  var lo = await sample(1300);
  out.hiPerFrame = hi.frames ? +(hi.arcs / hi.frames).toFixed(0) : -1;
  out.loPerFrame = lo.frames ? +(lo.arcs / lo.frames).toFixed(0) : -1;
  var cv = document.getElementById('whale-pond-canvas');
  out.canvasFilter = cv ? cv.style.filter : 'n/a';
  out.tokenBase = document.body.style.getPropertyValue('--dsw-alias-bg-base');
  out.lsSaved = (localStorage.getItem('whale-pond-settings-v1') || '').slice(0, 140);
  var btns = p ? p.querySelectorAll('.wp-btn') : [];
  out.btns = btns.length;
  if (btns.length) btns[0].click();
  out.lsAfterReset = (localStorage.getItem('whale-pond-settings-v1') || '').slice(0, 140);
  setRange(2, 400);
  CanvasRenderingContext2D.prototype.arc = arc0;
  window.requestAnimationFrame = raf0;
  out.hidden = document.hidden;
  return JSON.stringify(out);
})()