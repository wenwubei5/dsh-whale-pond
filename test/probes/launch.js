(async function(){
  var proto = CanvasRenderingContext2D.prototype;
  if(!proto.__oTr) proto.__oTr = proto.translate;
  if(!proto.__oST) proto.__oST = proto.setTransform;
  var oTr = proto.__oTr, oST = proto.__oST;
  var W = window.innerWidth, H = window.innerHeight, ZX = W-132, ZY = H-132, ZR = 170;
  var cur = null, trail = [], frame = 0, watch = false;
  function mine(ctx){ return ctx.canvas && ctx.canvas.id === "whale-pond-canvas"; }
  proto.setTransform = function(){
    if(watch && mine(this) && cur){ trail.push([frame, cur[0], cur[1]]); cur = null; }
    frame++; return oST.apply(this, arguments);
  };
  proto.translate = function(x, y){
    if(watch && mine(this) && !cur) cur = [x, y];
    return oTr.apply(this, arguments);
  };
  function fire(x, y){ window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: false })); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function d(p){ var dx = p[1]-ZX, dy = p[2]-ZY; return Math.sqrt(dx*dx+dy*dy); }
  fire(Math.round(W*0.5), Math.round(H*0.4));
  await wait(1500);
  watch = true; trail.length = 0; frame = 0;
  await wait(1500);
  var baseD = 0; for(var i = 0; i < trail.length; i++) baseD += d(trail[i]);
  baseD = trail.length ? baseD/trail.length : -1;
  var mark = frame;
  fire(ZX, ZY);
  await wait(14000);
  watch = false;
  proto.translate = oTr; proto.setTransform = oST;
  var maxD = 0, off = 0, n = 0, samples = [], maxIdx = -1, backAt = -1;
  for(var i = 0; i < trail.length; i++){
    if(trail[i][0] < mark) continue;
    n++;
    var dd = d(trail[i]);
    if(dd > maxD){ maxD = dd; maxIdx = n; }
    if(trail[i][1] < 0 || trail[i][1] > W || trail[i][2] < 0 || trail[i][2] > H) off++;
    if(maxD > 500 && backAt < 0 && dd < 330) backAt = n;
    if(n % 20 === 0) samples.push(Math.round(dd));
  }
  return JSON.stringify({ W: W, H: H, zone: [Math.round(ZX), Math.round(ZY), ZR],
    baseDist: Math.round(baseD), whaleMaxDist: Math.round(maxD),
    maxInDiameters: +(maxD/340).toFixed(2), offScreenFrames: off, armedFrames: n,
    maxAtFrame: maxIdx, backUnder330AtFrame: backAt, distancesEvery20: samples, hidden: document.hidden });
})()