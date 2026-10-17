(async () => {
  var out = {};
  var q = function(id){ return document.getElementById(id); };
  var sleep = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  // 数「插件自己排的帧」与「画到画布上的弧」——停用后两个都该归零
  var raf0 = window.requestAnimationFrame, frames = 0;
  window.requestAnimationFrame = function(cb){ frames++; return raf0.call(window, cb); };
  var arc0 = CanvasRenderingContext2D.prototype.arc, arcs = 0;
  CanvasRenderingContext2D.prototype.arc = function(){ var c = this.canvas; if (c && c.id === 'whale-pond-canvas') arcs++; return arc0.apply(this, arguments); };
  function sample(ms){ var f0 = frames, a0 = arcs; return sleep(ms).then(function(){ return { frames: frames - f0, arcs: arcs - a0 }; }); }
  var gear = q('whale-pond-gear'), power = q('whale-pond-power'), cv = q('whale-pond-canvas');
  out.found = { gear: !!gear, power: !!power, canvas: !!cv };
  out.onText = power ? power.textContent : null;
  out.onDisplay = cv ? getComputedStyle(cv).display : null;
  out.onBodyInline = document.body.style.background || '';
  out.onTokenInline = document.body.style.getPropertyValue('--dsw-alias-bg-base');
  out.on = await sample(1200);
  if (power) power.click();
  await sleep(350);
  out.offText = power.textContent; out.offClass = power.className; out.offTitle = power.title;
  out.offDisplay = getComputedStyle(cv).display;
  out.offBodyInline = document.body.style.background || '';
  out.offComputedBg = getComputedStyle(document.body).backgroundColor;
  out.offTokenInline = document.body.style.getPropertyValue('--dsw-alias-bg-base');
  out.offGearOpacity = getComputedStyle(gear).opacity;
  out.off = await sample(1200);
  out.lsOff = (localStorage.getItem('whale-pond-settings-v1') || '').slice(0, 46);
  gear.click(); await sleep(300);
  var pnl = q('whale-pond-panel');
  out.panelDisplay = getComputedStyle(pnl).display;
  var cbs = pnl.querySelectorAll('input[type=checkbox]');
  out.checkboxes = cbs.length;
  out.enabledCheckbox = cbs.length ? cbs[0].checked : null;
  out.perfOffText = (pnl.textContent.match(/已停用[^帧]{0,46}/) || ['n/a'])[0];
  out.offPanelOpen = await sample(900);
  if (cbs.length){ cbs[0].checked = true; cbs[0].dispatchEvent(new Event('change')); }
  await sleep(350);
  out.on2Text = power.textContent; out.on2Display = getComputedStyle(cv).display;
  out.on2BodyInline = document.body.style.background || '';
  out.on2TokenInline = document.body.style.getPropertyValue('--dsw-alias-bg-base');
  out.on2 = await sample(1200);
  out.lsOn = (localStorage.getItem('whale-pond-settings-v1') || '').slice(0, 46);
  return JSON.stringify(out);
})()