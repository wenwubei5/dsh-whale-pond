(async () => {
  const out = {};
  const P = CanvasRenderingContext2D.prototype;
  const arc = P.arc;
  let cur = [], frames = [];
  P.arc = function (x, y, r) {
    if (this.canvas && this.canvas.id === "whale-pond-canvas" && r < 16) cur.push([x, y, r]);
    return arc.apply(this, arguments);
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const panel = document.getElementById("whale-pond-panel");
  const gear = document.getElementById("whale-pond-gear");
  out.gear = !!gear; out.panel = !!panel;
  if (panel && panel.style.display !== "block") gear.click();
  out.display = panel && panel.style.display;
  const sel = panel && panel.querySelector("select.wp-sel");
  out.selFound = !!sel;
  out.selOptions = sel ? Array.from(sel.options).map(o => o.value + ":" + o.textContent) : null;
  out.selValue = sel ? sel.value : null;
  out.sliders = panel ? panel.querySelectorAll("input[type=range]").length : -1;
  const boxes = panel ? Array.from(panel.querySelectorAll("input[type=checkbox]")) : [];
  out.boxLabels = boxes.map(b => (b.parentNode && b.parentNode.textContent || "").slice(0, 6));
  function dd(A) { const m = {}, o = []; for (const p of A) { const k = Math.round(p[0]) + "," + Math.round(p[1]); if (!m[k]) { m[k] = 1; o.push(p); } } return o; }
  function vecs(Pe, Pl) {
    const A = dd(Pe), B = dd(Pl); let sx = 0, sy = 0, n = 0, sp = 0;
    for (const a of A) {
      let best = 1e9, bi = -1;
      for (let j = 0; j < B.length; j++) { const dx = a[0] - B[j][0], dy = a[1] - B[j][1], d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; bi = j; } }
      if (bi < 0 || best > 900) continue;
      const vx = B[bi][0] - a[0], vy = B[bi][1] - a[1], vl = Math.sqrt(vx * vx + vy * vy);
      if (vl < 0.05) continue;
      sx += vx; sy += vy; sp += vl; n++;
    }
    return n ? [+(sx / n).toFixed(2), +(sy / n).toFixed(2), +(sp / n).toFixed(2), n] : [0, 0, 0, 0, 0];
  }
  async function sample(mode) {
    sel.value = mode; sel.dispatchEvent(new Event("change"));
    await sleep(2600);
    frames = []; cur = []; let rec = true;
    const tick = () => { frames.push(cur); cur = []; if (rec) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    await sleep(9 * 220);
    rec = false;
    const use = frames.filter(f => f.length > 100);
    let sx = 0, sy = 0, sp = 0, c = 0;
    for (let i = 1; i < use.length; i++) { const v = vecs(use[i - 1], use[i]); if (v[3] > 80) { sx += v[0]; sy += v[1]; sp += v[2]; c++; } }
    return c ? { mx: +(sx / c).toFixed(2), my: +(sy / c).toFixed(2), sp: +(sp / c).toFixed(2), frames: use.length, n: c } : { err: "no frames", got: frames.map(f => f.length) };
  }
  try {
    out.drift = await sample("drift");
    out.fall = await sample("fall");
    out.rise = await sample("rise");
    out.current = await sample("current");
    out.swirl = await sample("swirl");
    out.ls = (localStorage.getItem("whale-pond-settings-v1") || "").match(/"motion":"[a-z]+"/) ? localStorage.getItem("whale-pond-settings-v1").match(/"motion":"[a-z]+"/)[0] : "none";
    if (out.fall.my !== undefined) out.dFall = +(out.fall.my - out.drift.my).toFixed(2);
    if (out.rise.my !== undefined) out.dRise = +(out.rise.my - out.drift.my).toFixed(2);
    if (out.swirl.sp !== undefined) out.dSwirlSp = +(out.swirl.sp - out.drift.sp).toFixed(2);
    // 呼吸灯：勾上，比较半径分布
    let bb = boxes.find(b => (b.parentNode && b.parentNode.textContent || "").indexOf("呼吸灯") >= 0);
    out.breatheBox = !!bb;
    const radii = () => { const s = new Set(); for (const f of frames) for (const p of f) if (p[2] < 14) s.add(Math.round(p[2] * 100) / 100); return s.size; };
    frames = []; cur = []; let rec2 = true;
    const t2 = () => { frames.push(cur); cur = []; if (rec2) requestAnimationFrame(t2); };
    requestAnimationFrame(t2);
    await sleep(2600);
    out.radiiNoBreathe = radii();
    if (bb) { bb.checked = true; bb.dispatchEvent(new Event("change")); }
    await sleep(2600);
    out.radiiBreathe = radii();
    out.lsBreathe = (localStorage.getItem("whale-pond-settings-v1") || "").indexOf('"breathe":true') >= 0;
    rec2 = false;
    if (bb) { bb.checked = false; bb.dispatchEvent(new Event("change")); }
    // 截图前：滚到「光点运动」组 + 选回漂移
    sel.value = "drift"; sel.dispatchEvent(new Event("change"));
    const row = sel.closest("div");
    if (row && panel) panel.scrollTop = Math.max(0, row.offsetTop - 70);
    out.scrollTop = panel ? panel.scrollTop : -1;
    document.querySelectorAll("canvas#whale-pond-canvas").forEach(c => {});
    out.ok = true;
  } catch (e) { out.err = String(e && e.stack || e); }
  P.arc = arc;
  return JSON.stringify(out);
})()