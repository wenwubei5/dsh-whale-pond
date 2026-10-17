(function(){
  var b = document.body;
  var cv = document.getElementById('whale-pond-canvas');
  var st = document.getElementById('whale-pond-style');
  var r = cv ? cv.getBoundingClientRect() : null;
  var cs = getComputedStyle(b);
  var toks = ['--dsw-alias-bg-base','--dsw-alias-bg-layer-1','--dsw-alias-bg-overlay'];
  var tv = [];
  for(var i=0;i<toks.length;i++) tv.push(toks[i] + '=' + cs.getPropertyValue(toks[i]).trim());
  return JSON.stringify({
    canvas: !!cv, rect: r ? [Math.round(r.width), Math.round(r.height)] : null,
    styleEl: !!st, styleRules: st && st.sheet ? st.sheet.cssRules.length : null,
    inlineBg: b.style.getPropertyValue('background') + '|' + b.style.getPropertyPriority('background'),
    computedBodyBg: cs.backgroundColor,
    tokens: tv,
    firstChild: b.firstChild ? (b.firstChild.id || b.firstChild.tagName) : null
  });
})()