(async function(){
  var out = { hostEsc: 0 };
  function q(id){ return document.getElementById(id); }
  var gear = q('whale-pond-gear'), panel = q('whale-pond-panel'), cv = q('whale-pond-canvas');
  function key(){ return (cv.style.zIndex === '2147483002') ? 'full' : (cv.style.zIndex === '2147482990' ? 'mini' : 'wall'); }
  function openPanel(){ for(var i=0;i<5 && panel.style.display!=='block';i++) gear.click(); }
  function btn(txt){ var bs = panel.querySelectorAll('.wp-btn'); for(var i=0;i<bs.length;i++){ if((bs[i].textContent||'')===txt) return bs[i]; } return null; }
  function snap(){ return { mode: key(), z: cv.style.zIndex, pe: cv.style.pointerEvents, disp: cv.style.display||'block', tok: (document.body.style.getPropertyValue('--dsw-alias-bg-base')||'').slice(0,24) }; }
  openPanel();
  var w = btn('回到壁纸'); if(w) w.click();
  await new Promise(function(r){ setTimeout(r,400); });
  out.start = snap();
  openPanel(); var f = btn('全屏屏保'); if(f) f.click();
  await new Promise(function(r){ setTimeout(r,500); });
  out.full = snap();
  window.addEventListener('keydown', function(e){ if(e.key === 'Escape') out.hostEsc++; }, false);
  document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true, cancelable:true }));
  await new Promise(function(r){ setTimeout(r,400); });
  out.afterEsc = snap();
  out.panelAfterEsc = panel.style.display;
  openPanel(); var m = btn('小窗摸鱼'); if(m) m.click();
  await new Promise(function(r){ setTimeout(r,500); });
  out.mini = snap();
  function mev(t,x,y){ return new MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}); }
  var r0 = cv.getBoundingClientRect();
  cv.dispatchEvent(mev('mousedown', r0.left+50, r0.top+50));
  window.dispatchEvent(mev('mouseup', r0.left+50, r0.top+50));
  cv.dispatchEvent(mev('click', r0.left+50, r0.top+50));
  await new Promise(function(r){ setTimeout(r,450); });
  out.afterMiniClick = snap();
  return JSON.stringify(out);
})()