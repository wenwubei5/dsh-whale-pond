(async function(){
  var proto = CanvasRenderingContext2D.prototype;
  if(!proto.__oArc) proto.__oArc = proto.arc;
  if(!proto.__oST) proto.__oST = proto.setTransform;
  var oArc = proto.__oArc, oST = proto.__oST;
  var W = window.innerWidth, H = window.innerHeight, ZX = W-132, ZY = H-132, ZR = 170;
  var frame = 0, rec = [], padStroke = {}, padFill = 0;
  proto.setTransform = function(){ frame++; return oST.apply(this, arguments); };
  proto.arc = function(x, y, r){
    if(r > 1.4 && r < 2.2) rec.push([x, y, frame]);
    else if(r > 168 && r < 172){ padStroke[String(this.strokeStyle)] = (padStroke[String(this.strokeStyle)]||0)+1; if(this.fillStyle && String(this.fillStyle).indexOf('Gradient') >= 0) padFill++; }
    return oArc.apply(this, arguments);
  };
  function analyse(){
    var byFrame = {};
    for(var i = 0; i < rec.length; i++){ var f = rec[i][2]; (byFrame[f] = byFrame[f] || []).push([rec[i][0], rec[i][1]]); }
    var fs = Object.keys(byFrame).map(Number).sort(function(a,b){ return a-b; });
    var inS = 0, inN = 0, outS = 0, outN = 0;
    for(var k = 1; k < fs.length; k++){
      var P = byFrame[fs[k-1]], Q = byFrame[fs[k]];
      for(var i = 0; i < Q.length; i += 2){
        var best = 1e9;
        for(var j = 0; j < P.length; j++){ var dx = P[j][0]-Q[i][0], dy = P[j][1]-Q[i][1], d = dx*dx+dy*dy; if(d < best) best = d; }
        if(best > 2500) continue;
        var dd = Math.sqrt(best), zx = Q[i][0]-ZX, zy = Q[i][1]-ZY;
        if(zx*zx + zy*zy < ZR*ZR){ inS += dd; inN++; } else { outS += dd; outN++; }
      }
    }
    return { inPad: inN ? +(inS/inN).toFixed(2) : -1, outPad: outN ? +(outS/outN).toFixed(2) : -1, inSamples: inN, frames: fs.length };
  }
  function run(ms){ rec.length = 0; frame = 0; return new Promise(function(res){ setTimeout(function(){ res(analyse()); }, ms); }); }
  function fire(x, y){ window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: false })); }
  fire(Math.round(W*0.5), Math.round(H*0.4));
  var base = await run(1600);
  fire(ZX, ZY);
  var armed = await run(1600);
  proto.arc = oArc; proto.setTransform = oST;
  return JSON.stringify({ W: W, H: H, zone: [Math.round(ZX), Math.round(ZY), ZR],
    padStrokeSeen: padStroke, padGradientFills: padFill, base: base, armed: armed, hidden: document.hidden });
})()