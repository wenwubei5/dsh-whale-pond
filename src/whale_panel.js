		// =====================================================================
		// 控制台（2026-10-17 用户要求：把之前改过的参数做成能自己选的选项）
		// 面板挂在 document.body 上；只有齿轮按钮和打开后的面板会接收鼠标事件，
		// 其余时间对宿主界面零影响。设置存 localStorage，改完立刻生效。
		// =====================================================================
		var PANEL_ID = "whale-pond-panel";
		var GEAR_ID = "whale-pond-gear";
		var S_KEY = "whale-pond-settings-v1";
		var W_KEY = "whale-pond-words-v1";   // 词库单独存：整份设置回写/恢复默认都动不到它
		var HOOKS = {};                 // start() 内部回填：tokens / canvas / respawn
		var S_KEYS = ["glass","brightness","count","speed","attract","ar","ak","ring","popToken","popWord","pad","padR","padM","padPower","flow","breathe","breatheRate","motion","quality","words"];
		var S_DEFAULTS = {
			glass: 0.34,      // 界面面板不透明度（越小海越明显）
			brightness: 1.6,  // 画布亮度
			count: 400,       // 目标光点数
			speed: 1.0,       // 漂移速度倍率
			attract: true,    // 鼠标洋流
			ar: 340,          // 吸引半径（硬边界）
			ak: 1.0,          // 吸引强度倍率
			ring: true,       // 画吸引范围光环
			popToken: true,   // 吃光点冒 "-1 token"
			popWord: true,    // 吃掉词冒字
			pad: true,        // 右下角发射台
			padR: 170,        // 发射台半径
			padM: 132,        // 圆心距右下角两边
			padPower: 4.0,    // 弹射力度（4.0 ≈ 弹出 4 倍圈直径）
			flow: 1.0,        // 运动强度：飘落快慢 / 洋流急缓 / 漩涡松紧
			breathe: false,   // 呼吸灯：每个光点按自己的相位一明一暗
			breatheRate: 1.0, // 呼吸快慢
			motion: "drift",  // 运动方式：drift 漂移 / fall 飘落 / rise 上浮 / current 洋流 / swirl 漩涡
			quality: 1.0,     // 内部清晰度：乘在 devicePixelRatio 上，再有 260 万像素硬上限（卡就调低）
			words: null       // 词库：null = 用内建的 10 个词；数组 = 用户自己编的
		};
		var S = {};
		for(var _si = 0; _si < S_KEYS.length; _si++) S[S_KEYS[_si]] = S_DEFAULTS[S_KEYS[_si]];
		function sDerive(){
			S.ar2 = S.ar * S.ar;
			S.capA = Math.round(S.count * 1.4);
			S.capB = Math.round(S.count * 1.45);
			S.restock = Math.round(S.count * 0.85);
			S.whalePower = 8.5 * S.padPower;
			S.whaleCap = 350 * S.padPower;
		}
		function sLoad(){
			try{
				var raw = localStorage.getItem(S_KEY);
				if(raw){
					var o = JSON.parse(raw);
					for(var i = 0; i < S_KEYS.length; i++){
						var k = S_KEYS[i];
						if(o && o[k] !== undefined && typeof o[k] === typeof S_DEFAULTS[k]) S[k] = o[k];
					}
				}
			}catch(e){}
			// 词库（2026-10-17 用户要求：控制台里能直接编词库）：
			// null = 用 whale_pond.html 里那份内建词表，非空数组 = 用户自己编的。
			// 2026-10-17 修「改了的词库无法保存」：词库改存 W_KEY，不再和其余设置挤在一个对象里 ——
			// 这样「恢复默认」或任何一次整份设置回写都不会再把它抹成 null。旧版把 words 写在
			// S_KEY 里，这里仍读一次做迁移；读到的脏值（类型不对 / 混进数字 / 单个词过长 /
			// 超量 / 重复）在这里修干净，然后无条件回写一次，localStorage 自愈。
			var wRaw = S.words;
			try{
				var wr = localStorage.getItem(W_KEY);
				if(wr == null){                      // 还没有独立的词库键 → 从旧版设置对象里搬一次
					var bo = JSON.parse(localStorage.getItem(S_KEY) || "null");
					if(bo && bo.words !== undefined) wr = JSON.stringify(bo.words);
				}
				if(wr != null) wRaw = JSON.parse(wr);
			}catch(e){}
			S.words = sNormWords(wRaw);
			wSave();                             // 归一化后的值回写（wSave 对 null 也写，避免又被迁移回来）
			if(sClamp()) sSave();
			sDerive();
		}
		var W_MAX = 200, W_LEN = 24;
		function sNormWords(v){
			if(!v || Object.prototype.toString.call(v) !== "[object Array]") return null;
			var out = [];
			for(var i = 0; i < v.length && out.length < W_MAX; i++){
				if(typeof v[i] !== "string") continue;
				var s = v[i].replace(/[\r\n\t]+/g, " ").trim().slice(0, W_LEN);
				if(!s || out.indexOf(s) >= 0) continue;
				out.push(s);
			}
			return out.length ? out : null;
		}
		function parseWords(txt){
			return sNormWords(String(txt == null ? "" : txt).split(/[\n\r,，、;；]+/));
		}
		function applyWords(){
			if(!HOOKS.applyWords) return;           // start() 还没跑：词库在那个作用域里
			HOOKS.applyWords(S.words);              // null = 回内建
			refreshWords();
		}
		function refreshWords(){
			for(var i = 0; i < valRefs.length; i++){
				var r = valRefs[i];
				if(!r.ta) continue;
				var custom = !!(S.words && S.words.length);
				var list = custom ? S.words : (HOOKS.wordsDefault || []);
				// 正在输入时别回写 textarea，否则光标会跳
				if(document.activeElement !== r.ta) r.ta.value = list.join("\n");
				if(r.cnt) r.cnt.textContent = list.length + " 个" + (custom ? "（自定义）" : "（内建）")
					+ (custom ? " · 已保存" + (wSavedAt ? " " + wSavedAt : "") : "");
			}
		}
		function onWordsInput(e){
			S.words = parseWords(e && e.target ? e.target.value : "");
			wSave();                              // 立刻落盘（原先防抖 320ms，关得太快就白改了）
			wSavedAt = wStamp();
			applyWords();
		}
		// 夹紧：localStorage 里的数字必须落在 CTL 滑杆区间内。
		// 不夹的话（用户手改 localStorage，或将来下调某个滑杆上限让旧值越界）
		// 引擎会真按越界值跑，而 <input range> 会被浏览器自动夹到 min/max ——
		// 面板显示与实际行为分家。真页面实测 count=5000：引擎每帧 9268 个圆
		// （= 上限 2100 的 4 倍），面板却写着 5000、滑杆卡在 2100。
		// 返回是否有值被改动，让 sLoad 回写一次、localStorage 自愈。
		function sClamp(){
			if(typeof CTL === "undefined" || !CTL) return false;
			var changed = false;
			for(var i = 0; i < CTL.length; i++){
				var c = CTL[i];
				if(c[0] === "s"){                      // 下拉选项：值必须在选项表里，否则回默认
					var sk = c[1], sok = false;
					for(var j = 0; j < c[3].length; j++) if(c[3][j][0] === S[sk]) sok = true;
					if(!sok){ S[sk] = S_DEFAULTS[sk]; changed = true; }
					continue;
				}
				if(c[0] !== "r") continue;
				var k = c[1], v = S[k], lo = c[3], hi = c[4];
				if(typeof v !== "number" || !isFinite(v)){ S[k] = S_DEFAULTS[k]; changed = true; continue; }
				if(v < lo) v = lo;
				if(v > hi) v = hi;
				if(v !== S[k]){ S[k] = v; changed = true; }
			}
			return changed;
		}
		function wSave(){
			try{                                  // 词库自己一个键：null 也写成 "null"，
				if(S.words && S.words.length) localStorage.setItem(W_KEY, JSON.stringify(S.words));
				else localStorage.setItem(W_KEY, "null");   // 免得下次启动又被旧版设置对象迁移回来
			}catch(e){}
		}
		var wSavedAt = "";
		function wStamp(){
			var d = new Date(), p = function(n){ return (n < 10 ? "0" : "") + n; };
			return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
		}
		function sSave(){
			try{
				var o = {};
				for(var i = 0; i < S_KEYS.length; i++) if(S_KEYS[i] !== "words") o[S_KEYS[i]] = S[S_KEYS[i]];
				localStorage.setItem(S_KEY, JSON.stringify(o));
			}catch(e){}
		}
		var PANEL_CSS = [
			"#" + GEAR_ID + "{position:fixed;right:14px;top:46px;width:30px;height:30px;border-radius:50%;z-index:2147483000;",
			"background:rgba(8,14,22,.72);border:1px solid rgba(255,168,96,.35);color:rgba(255,196,120,.9);",
			"font:15px/28px -apple-system,'Segoe UI',system-ui,sans-serif;text-align:center;cursor:pointer;",
			"opacity:.55;transition:opacity .15s;-webkit-user-select:none;user-select:none;backdrop-filter:blur(3px)}",
			"#" + GEAR_ID + ":hover{opacity:1}",
			"#" + PANEL_ID + "{position:fixed;right:14px;top:84px;width:334px;max-height:78vh;overflow:auto;z-index:2147483001;",
			"display:none;background:rgba(6,11,18,.95);border:1px solid rgba(255,168,96,.28);border-radius:12px;",
			"padding:14px 14px 12px;box-shadow:0 18px 50px rgba(0,0,0,.6);color:#cfe3f2;backdrop-filter:blur(9px);",
			"font:13px/1.55 -apple-system,'Segoe UI',system-ui,sans-serif}",
			"#" + PANEL_ID + " input[type=range]{width:100%;accent-color:#ffb066;margin:3px 0 0}",
			"#" + PANEL_ID + " input[type=checkbox]{accent-color:#ffb066;width:15px;height:15px;cursor:pointer;margin:0}",
			"#" + PANEL_ID + " .wp-g{margin:13px 0 6px;font-size:11px;letter-spacing:.18em;color:#7d94a8;",
			"border-top:1px solid rgba(255,168,96,.13);padding-top:8px}",
			"#" + PANEL_ID + " .wp-words{width:100%;box-sizing:border-box;min-height:76px;resize:vertical;border-radius:7px;",
			"border:1px solid rgba(255,168,96,.22);background:rgba(255,255,255,.045);color:#d8e8f5;padding:6px 7px;",
			"font:12px/1.5 ui-monospace,Consolas,'Courier New',monospace;outline:none}",
			"#" + PANEL_ID + " .wp-words:focus{border-color:rgba(255,168,96,.55)}",
			"#" + PANEL_ID + " .wp-sel{width:100%;box-sizing:border-box;border-radius:7px;border:1px solid rgba(255,168,96,.22);",
			"background:rgba(255,255,255,.045);color:#d8e8f5;padding:5px 6px;font-size:12px;outline:none}",
			"#" + PANEL_ID + " .wp-sel:focus{border-color:rgba(255,168,96,.55)}",
			"#" + PANEL_ID + " .wp-foot{display:flex;gap:8px;margin-top:15px}",
			"#" + PANEL_ID + " .wp-btn{flex:1;text-align:center;padding:6px 0;border-radius:7px;cursor:pointer;",
			"border:1px solid rgba(255,168,96,.28);color:#ffc484;background:rgba(255,168,96,.06)}",
			"#" + PANEL_ID + " .wp-btn:hover{background:rgba(255,168,96,.16)}"
		].join(NL);
		var CTL = [
			["g", "界面"],
			["r", "glass", "面板不透明度", 0.15, 0.75, 0.01, "越小，海越明显"],
			["r", "brightness", "画布亮度", 1.0, 2.2, 0.05, ""],
			["g", "海"],
			["r", "count", "光点数量", 150, 2100, 10, "越多越热闹，也越费电"],
			["r", "speed", "光点速度", 0.4, 9.0, 0.05, "1.0 = 现在的速度"],
			["g", "鼠标（提灯）"],
			["c", "attract", "洋流吸引光点", "把光点赶向鲸鱼嘴边"],
			["r", "ar", "吸引半径", 150, 600, 10, "只在这个半径内有拉力", "px"],
			["r", "ak", "吸引强度", 0.4, 2.0, 0.05, ""],
			["c", "ring", "显示吸引范围光环", ""],
			["g", "吃光点"],
			["c", "popToken", "飘字「-1 token」", ""],
			["c", "popWord", "飘字「吃掉「词」」", ""],
			["g", "右下角发射台"],
			["c", "pad", "启用发射台", "鼠标进圈才通电"],
			["r", "padR", "圈半径", 100, 260, 5, "", "px"],
			["r", "padM", "距右下角", 60, 260, 5, "", "px"],
			["r", "padPower", "弹射力度", 1.0, 40.0, 0.5, "4.0 ≈ 4 倍圈直径；40 会把鲸鱼甩出屏幕几秒"],
			["g", "光点运动"],
			["s", "motion", "运动方式", [["drift","漂移（原样）"],["fall","从上往下飘落"],["rise","从下往上浮"],["current","洋流：成片流线"],["swirl","漩涡：绕中心打转"]], "和上面的鼠标吸引、发射台叠加生效，改完立刻变"],
			["r", "flow", "运动强度", 0.2, 3.0, 0.1, "飘落更快 / 洋流更急 / 漩涡更紧"],
			["c", "breathe", "呼吸灯（一明一暗）", "每个光点按自己的相位慢慢变亮变暗"],
			["r", "breatheRate", "呼吸快慢", 0.2, 3.0, 0.1, "越大闪得越快"],
			["g", "性能"],
			["r", "quality", "内部清晰度", 0.5, 1.5, 0.05, "只影响背景壁纸的渲染分辨率：调低更顺、几乎看不出差别"],
			["i", "perf", "运行状态"],
			["g", "词库（鲸鱼吃的词）"],
			["w", "words", "词库", "一行一个词，逗号 / 顿号也行；最多 200 个、每个 24 字。改一下存一下，刷新也不会丢。清空 = 回到内建那 10 个词；下面的「恢复默认」不会动词库"]
		];
		var panelEl = null, gearEl = null, valRefs = [];
		function mkEl(tag, css, txt){
			var d = document.createElement(tag);
			if(css) d.style.cssText = css;
			if(txt != null) d.textContent = txt;
			return d;
		}
		function fmtVal(v, unit){
			var s = (Math.round(v * 100) / 100).toString();
			return unit ? s + unit : s;
		}
		function refreshValues(){
			for(var i = 0; i < valRefs.length; i++){
				var r = valRefs[i];
				if(r.out) r.out.textContent = fmtVal(S[r.key], r.unit);
				if(r.range) r.range.value = S[r.key];
				if(r.box) r.box.checked = !!S[r.key];
				if(r.sel) r.sel.value = S[r.key];
			}
			refreshWords();
		}
		var perfTimer = 0, perfEl = null;
		var qTimer = 0;
		// 「内部清晰度」滑杆每拖一格都会走到 resize()，而 resize 要重新分配画布缓冲 + 重烘离屏图；
		// 逐格做会拖出一条卡顿带 —— 拖动期间只更新数字，停手 260ms 之后才真正改分辨率。
		function qResizeSoon(){
			if(qTimer) clearTimeout(qTimer);
			qTimer = setTimeout(function(){ qTimer = 0; if(HOOKS.resizeCanvas) HOOKS.resizeCanvas(); }, 260);
		}
		function refreshPerf(){
			if(!perfEl) return;
			var p = HOOKS.perfInfo ? HOOKS.perfInfo() : null;
			if(!p){ perfEl.textContent = "（壁纸还没起来）"; return; }
			var eff = Math.round(p.quality * 100) / 100;
			perfEl.textContent = "帧率 " + p.fps + " · 单帧 " + p.cost + "ms · 清晰度 " + eff + "× · 缓冲 " + p.buf + " · 光点 " + p.count;
		}
		function applyCanvasFilter(){
			if(HOOKS.canvas) HOOKS.canvas.style.filter = "brightness(" + S.brightness + ") saturate(1.12)";
		}
		function syncLive(key){
			if(key === undefined || key === "brightness") applyCanvasFilter();
			if(key === undefined || key === "glass"){ if(HOOKS.tokens) HOOKS.tokens.apply(); }
			if((key === undefined || key === "count") && HOOKS.respawn) HOOKS.respawn(S.count);
			if(key === undefined){ if(HOOKS.resizeCanvas) HOOKS.resizeCanvas(); }
			else if(key === "quality") qResizeSoon();
			if(key === undefined || key === "words") applyWords();
			refreshValues();
		}
		function applyChange(key, v){
			S[key] = v;
			sDerive(); sSave(); syncLive(key);
		}
		function onKey(e){
			if(e.key !== "Escape") return;
			var open = !!(panelEl && panelEl.style.display === "block");
			// 面板开着时必须吃掉这次 Escape。宿主（React 根容器在 body 里）比 document
			// 的冒泡监听更早拿到事件，事后 stopPropagation 救不回来 —— DSH 里 Escape 是
			// 「取消生成 / 关弹窗」，穿透过去就是真事故（夹具实测 hostSawEsc 1）。
			// 所以监听注册在捕获阶段（见 buildPanel 末尾），这里再阻止继续下发。
			if(open){ e.preventDefault(); e.stopPropagation(); }
			togglePanel(false);
		}
		function buildPanel(){
			if(panelEl || !document.body) return;
			gearEl = mkEl("div", "", "\u2699");
			gearEl.id = GEAR_ID;
			gearEl.title = "鲸鱼壁纸设置";
			gearEl.addEventListener("mousedown", function(e){ e.stopPropagation(); });
			gearEl.addEventListener("click", function(e){ e.stopPropagation(); togglePanel(); });
			document.body.appendChild(gearEl);
			panelEl = mkEl("div", "", "");
			panelEl.id = PANEL_ID;
			panelEl.addEventListener("mousedown", function(e){ e.stopPropagation(); });
			panelEl.addEventListener("click", function(e){ e.stopPropagation(); });
			var head = mkEl("div", "display:flex;align-items:center;justify-content:space-between;margin-bottom:4px", "");
			head.appendChild(mkEl("div", "font-size:14px;letter-spacing:.06em;color:#ffc484", "鲸鱼壁纸 · 控制台"));
			var x = mkEl("div", "cursor:pointer;padding:0 4px;font-size:17px;line-height:1;color:#8fa8bd", "\u00d7");
			x.addEventListener("click", function(){ togglePanel(false); });
			head.appendChild(x);
			panelEl.appendChild(head);
			valRefs = [];
			for(var i = 0; i < CTL.length; i++){
				var c = CTL[i];
				if(c[0] === "g"){ var g = mkEl("div", "", c[1]); g.className = "wp-g"; panelEl.appendChild(g); continue; }
				var key = c[1], row = mkEl("div", "margin:9px 0", "");
				if(c[0] === "c"){
					var lab = mkEl("label", "display:flex;align-items:center;gap:9px;cursor:pointer", "");
					var box = document.createElement("input");
					box.type = "checkbox";
					box.checked = !!S[key];
					box.addEventListener("change", (function(k, b){ return function(){ applyChange(k, b.checked); }; })(key, box));
					lab.appendChild(box);
					lab.appendChild(mkEl("span", "color:#d8e8f5", c[2]));
					row.appendChild(lab);
					if(c[3]) row.appendChild(mkEl("div", "margin-left:24px;font-size:11px;color:#7d94a8", c[3]));
					valRefs.push({ key: key, box: box, out: null, range: null });
				} else if(c[0] === "i"){
					perfEl = mkEl("div", "font-size:11px;color:#7d94a8;margin-top:2px;font-variant-numeric:tabular-nums", "");
					row.appendChild(perfEl);
					valRefs.push({ key: key, perf: true, range: null, box: null, out: null });
				} else if(c[0] === "w"){
					row.appendChild(mkEl("div", "color:#d8e8f5;margin-bottom:4px", c[2]));
					var ta = document.createElement("textarea");
					ta.className = "wp-words";
					ta.rows = 5;
					ta.spellcheck = false;
					ta.placeholder = "一行一个词";
					// 在词库里打字时别把按键喂给宿主界面（React 根容器在 body 上，冒泡被拦下它就拿不到
					// 这次 keydown）；面板自己的 Escape 仍走捕获，不受影响。
					ta.addEventListener("keydown", function(e){ e.stopPropagation(); });
					ta.addEventListener("input", onWordsInput);
					ta.addEventListener("change", onWordsInput);
					row.appendChild(ta);
					if(c[3]) row.appendChild(mkEl("div", "font-size:11px;color:#7d94a8;margin-top:3px", c[3]));
					var cnt = mkEl("div", "font-size:11px;color:#ffc484;margin-top:2px", "");
					row.appendChild(cnt);
					valRefs.push({ key: key, ta: ta, cnt: cnt, range: null, box: null, out: null });
				} else if(c[0] === "s"){
					row.appendChild(mkEl("div", "color:#d8e8f5;margin-bottom:4px", c[2]));
					var sel = document.createElement("select");
					sel.className = "wp-sel";
					for(var oi = 0; oi < c[3].length; oi++){
						var op = document.createElement("option");
						op.value = c[3][oi][0];
						op.textContent = c[3][oi][1];
						sel.appendChild(op);
					}
					sel.value = S[key];
					sel.addEventListener("mousedown", function(e){ e.stopPropagation(); });
					sel.addEventListener("click", function(e){ e.stopPropagation(); });
					sel.addEventListener("change", (function(k, el){ return function(){ applyChange(k, el.value); }; })(key, sel));
					row.appendChild(sel);
					if(c[4]) row.appendChild(mkEl("div", "font-size:11px;color:#7d94a8;margin-top:3px", c[4]));
					valRefs.push({ key: key, sel: sel, ta: null, cnt: null, range: null, box: null, out: null });
				} else {
					var top = mkEl("div", "display:flex;justify-content:space-between;align-items:baseline", "");
					top.appendChild(mkEl("span", "color:#d8e8f5", c[2]));
					var out = mkEl("span", "color:#ffc484;font-variant-numeric:tabular-nums", "");
					top.appendChild(out);
					row.appendChild(top);
					var range = document.createElement("input");
					range.type = "range"; range.min = c[3]; range.max = c[4]; range.step = c[5]; range.value = S[key];
					range.addEventListener("input", (function(k, r){ return function(){ applyChange(k, parseFloat(r.value)); }; })(key, range));
					row.appendChild(range);
					if(c[6]) row.appendChild(mkEl("div", "font-size:11px;color:#7d94a8", c[6]));
					valRefs.push({ key: key, range: range, box: null, out: out, unit: c[7] || "" });
				}
				panelEl.appendChild(row);
			}
			var foot = mkEl("div", "", "");
			foot.className = "wp-foot";
			var reset = mkEl("div", "", "恢复默认（词库保留）");
			reset.className = "wp-btn";
			reset.addEventListener("click", function(){
				// 词库不在重置范围内：它单独存 W_KEY，用户自己编的词不该被一键清掉
				for(var i = 0; i < S_KEYS.length; i++) if(S_KEYS[i] !== "words") S[S_KEYS[i]] = S_DEFAULTS[S_KEYS[i]];
				perfEl = null;
				sDerive(); sSave(); syncLive();
			});
			var close = mkEl("div", "", "关闭");
			close.className = "wp-btn";
			close.addEventListener("click", function(){ togglePanel(false); });
			foot.appendChild(reset); foot.appendChild(close);
			panelEl.appendChild(foot);
			document.body.appendChild(panelEl);
			document.addEventListener("keydown", onKey, true);
			refreshValues();
		}
		function togglePanel(force){
			buildPanel();
			if(!panelEl) return;
			var open = (typeof force === "boolean") ? force : (panelEl.style.display !== "block");
			panelEl.style.display = open ? "block" : "none";
			if(open){
				refreshValues(); refreshPerf();
				if(!perfTimer) perfTimer = setInterval(refreshPerf, 1000);
			} else if(perfTimer){ clearInterval(perfTimer); perfTimer = 0; }
		}
		function panelMount(){ buildPanel(); applyCanvasFilter(); }
		function panelUnmount(){
			document.removeEventListener("keydown", onKey, true);
			if(panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
			if(gearEl && gearEl.parentNode) gearEl.parentNode.removeChild(gearEl);
			if(perfTimer){ clearInterval(perfTimer); perfTimer = 0; }
			if(qTimer){ clearTimeout(qTimer); qTimer = 0; }
			panelEl = null; gearEl = null; perfEl = null; valRefs = [];
		}
