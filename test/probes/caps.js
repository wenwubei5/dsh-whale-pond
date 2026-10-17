(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  let arcs = 0, frames = 0;
  const proto = CanvasRenderingContext2D.prototype;
  if (!proto.__capsPatched) {
    const origArc = proto.arc;
    proto.arc = function(){ arcs++; return origArc.apply(this, arguments); };
    proto.__capsPatched = true;
  }
  function measure(ms){
    return new Promise(res => {
      arcs = 0; frames = 0;
      const t0 = performance.now();
      const tick = () => {
        frames++;
        if (performance.now() - t0 < ms) requestAnimationFrame(tick);
        else { const dt = (performance.now() - t0) / 1000; res({ fps: +(frames / dt).toFixed(1), arcsPerFrame: Math.round(arcs / Math.max(1, frames)) }); }
      };
      requestAnimationFrame(tick);
    });
  }
  const gear = document.getElementById('whale-pond-gear');
  const panel = document.getElementById('whale-pond-panel');
  o.gear = !!gear; o.panel = !!panel;
  if (gear && panel && getComputedStyle(panel).display === 'none') gear.click();
  await sleep(200);
  const rs = panel ? panel.querySelectorAll('input[type=range]') : [];
  o.ranges = Array.prototype.map.call(rs, r => r.min + '~' + r.max);
  const set = (i, v) => { if (rs.length >= 9) { rs[i].value = v; rs[i].dispatchEvent(new Event('input')); } };
  o.base = await measure(3000);
  set(2, 2100); await sleep(700); o.count2100 = await measure(3000);
  set(2, 400); set(3, 9.0); await sleep(700); o.speed9 = await measure(3000);
  set(3, 1.0); set(8, 40.0); await sleep(700); o.padPower40 = await measure(3000);
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: innerWidth - 132, clientY: innerHeight - 132, bubbles: false }));
  await sleep(2500);
  o.armedPower40 = await measure(2000);
  set(8, 4.0); set(2, 400); await sleep(400);
  o.savedAfterReset = (localStorage.getItem('whale-pond-settings-v1') || '').slice(0, 70);
  o.hidden = document.hidden; o.dpr = window.devicePixelRatio;
  set(2, 2100); set(8, 40.0);
  return JSON.stringify(o);
})()