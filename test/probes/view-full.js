(async function(){
  var out = {};
  function q(id){ return document.getElementById(id); }
  var gear = q('whale-pond-gear'), panel = q('whale-pond-panel'), cv = q('whale-pond-canvas');
  out.gear = !!gear; out.cv = !!cv;
  for(var i=0;i<5 && panel && panel.style.display!=='block';i++) gear.click();
  out.panelOpen = panel ? panel.style.display : 'none';
  var bs = panel ? panel.querySelectorAll('.wp-btn') : [];
  var b = null;
  for(var j=0;j<bs.length;j++){ if((bs[j].textContent||'')==='全屏屏保') b = bs[j]; }
  out.btns = bs.length; out.foundFull = !!b;
  if(b) b.click();
  await new Promise(function(r){ setTimeout(r, 900); });
  function snap(){ return cv ? { z: cv.style.zIndex, pe: cv.style.pointerEvents, w: cv.style.width, h: cv.style.height, disp: cv.style.display || 'block', rect: (function(){var r=cv.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];})() } : null; }
  var h = q('whale-pond-hint');
  out.after = snap();
  out.hint = h ? h.textContent : null;
  out.hintOp = h ? h.style.opacity : null;
  out.tok = (document.body.style.getPropertyValue('--dsw-alias-bg-base') || '').slice(0,26);
  out.bodyBg = document.body.style.background || '';
  out.panelNow = panel ? panel.style.display : 'none';
  out.gearZ = gear ? getComputedStyle(gear).zIndex : null;
  out.win = [window.innerWidth, window.innerHeight];
  out.errs = (window.__wpErrs || []).slice(0,3);
  return JSON.stringify(out);
})()