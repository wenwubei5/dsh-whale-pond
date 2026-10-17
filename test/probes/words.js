(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const out = {};
  const gear = document.getElementById('whale-pond-gear');
  const pnl = document.getElementById('whale-pond-panel');
  if (!gear || !pnl) return JSON.stringify({ err: 'no panel/gear' });
  const disp = () => getComputedStyle(pnl).display;
  for (let i = 0; i < 4 && disp() !== 'block'; i++) gear.click();
  const ta = pnl.querySelector('textarea.wp-words');
  out.panelOpen = disp();
  out.taFound = !!ta;
  if (!ta) return JSON.stringify(out);
  const cntOf = (t) => { const ch = t.parentElement.children; return ch[ch.length - 1].textContent; };
  out.initLabel = cntOf(ta);
  out.initCount = ta.value.split('\n').length;
  out.initFirst = ta.value.split('\n')[0];
  // 只认鲸鱼那块 canvas 上画的字
  const texts = [];
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (s) {
    if (this.canvas && this.canvas.id === 'whale-pond-canvas') texts.push(String(s));
    return orig.apply(this, arguments);
  };
  const NAME = ['潮汐', '盐', '月光', '鲸落'];
  const BUILT = ['潮汐', '盐', '月光', '鲸落', '暗流', '礁石', '海雾', '星光', '潮声', '深蓝'];
  ta.value = NAME.join('\n');
  ta.dispatchEvent(new Event('input'));
  await sleep(900);
  try { out.saved = JSON.parse(localStorage.getItem('whale-pond-settings-v1') || '{}').words; } catch (e) { out.saved = 'ERR'; }
  out.labelAfter = cntOf(ta);
  texts.length = 0;
  await sleep(14000);
  const drawn = texts.filter(s => s && s !== '-1 token');
  out.drawnTotal = drawn.length;
  out.drawnSample = drawn.slice(0, 6);
  out.drawnCustom = drawn.filter(s => NAME.indexOf(s) >= 0).length;
  out.drawnBuiltin = drawn.filter(s => BUILT.indexOf(s) >= 0).length;
  out.hidden = document.hidden;
  out.vis = document.visibilityState;
  const btns = pnl.querySelectorAll('.wp-btn');
  out.btnCount = btns.length;
  btns[0].click();
  await sleep(400);
  out.afterResetLabel = cntOf(ta);
  out.afterResetCount = ta.value.split('\n').length;
  out.afterResetFirst = ta.value.split('\n')[0];
  try { out.afterResetWords = JSON.parse(localStorage.getItem('whale-pond-settings-v1') || '{}').words; } catch (e) { out.afterResetWords = 'ERR'; }
  CanvasRenderingContext2D.prototype.fillText = orig;
  return JSON.stringify(out);
})()
