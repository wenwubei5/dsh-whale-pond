(async function(){
  var out = {};
  function q(id){ return document.getElementById(id); }
  var gear = q('whale-pond-gear'), panel = q('whale-pond-panel'), cv = q('whale-pond-canvas');
  for(var i=0;i<5 && panel && panel.style.display!=='block';i++) gear.click();
  var bs = panel ? panel.querySelectorAll('.wp-btn') : [];
  var b = null;
  for(var j=0;j<bs.length;j++){ if((bs[j].textContent||'')==='小窗摸鱼') b = bs[j]; }
  out.foundMini = !!b;
  if(b) b.click();
  await new Promise(function(r){ setTimeout(r, 900); });
  function snap(){ var r = cv.getBoundingClientRect(); return { z: cv.style.zIndex, pe: cv.style.pointerEvents, rad: cv.style.borderRadius, left: cv.style.left, top: cv.style.top, w: cv.style.width, h: cv.style.height, rect: [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)] }; }
  out.after = snap();
  var g = q('whale-pond-grip'), h = q('whale-pond-hint');
  out.grip = g ? { disp: getComputedStyle(g).display, rect: (function(){var r=g.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];})() } : null;
  out.hint = h ? h.textContent : null;
  out.hintPos = h ? { left: h.style.left, top: h.style.top } : null;
  // 合成拖拽：往下左挪 60/40
  var r0 = cv.getBoundingClientRect();
  function mev(t,x,y){ return new MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}); }
  cv.dispatchEvent(mev('mousedown', r0.left+40, r0.top+30));
  window.dispatchEvent(mev('mousemove', r0.left-20, r0.top+70));
  await new Promise(function(r){ setTimeout(r, 120); });
  window.dispatchEvent(mev('mouseup', r0.left-20, r0.top+70));
  await new Promise(function(r){ setTimeout(r, 220); });
  out.afterDrag = snap();
  // 手柄缩放 +80/+60
  var gr = g.getBoundingClientRect();
  g.dispatchEvent(mev('mousedown', gr.left+10, gr.top+10));
  window.dispatchEvent(mev('mousemove', gr.left+90, gr.top+70));
  await new Promise(function(r){ setTimeout(r, 120); });
  window.dispatchEvent(mev('mouseup', gr.left+90, gr.top+70));
  await new Promise(function(r){ setTimeout(r, 320); });
  out.afterResize = snap();
  out.gripNow = (function(){ var rr=g.getBoundingClientRect(); return [Math.round(rr.left),Math.round(rr.top),Math.round(rr.width),Math.round(rr.height)]; })();
  out.tok = (document.body.style.getPropertyValue('--dsw-alias-bg-base') || '').slice(0,26);
  out.win = [window.innerWidth, window.innerHeight];
  return JSON.stringify(out);
})()