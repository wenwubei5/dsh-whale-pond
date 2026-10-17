# dsh-whale-pond 🐋

> 一只在深海里慢慢游的鲸鱼，把它的自留地铺在 **DSH** 的 Web 界面背后（桌面端窗口，或浏览器里打开的 `dsh web`）。
> 纯视觉背景插件：**不拦鼠标、不抢键盘、不碰任何业务代码**。

[![release](https://img.shields.io/github/v/release/wenwubei5/dsh-whale-pond?color=2b6cb0)](https://github.com/wenwubei5/dsh-whale-pond/releases/latest)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![DSH Desktop](https://img.shields.io/badge/DSH%20Desktop-0.2.0--rc.2-1f2937)](https://github.com/wenwubei5/dsh-whale-pond)


## 它是什么

DSH（DeepSeek Harness）的 Web 界面背后本来是一块不透明背景。这个插件在 `z-index:-1` 挂一张
`position:fixed` 的全屏 canvas，再把界面自己的背景 token 调成半透明玻璃 —— 于是海、光点、水母、
鲸鱼就从界面底下透出来了：

- 默认 **400 颗光点**在海里飘（可拉到 2100），鲸鱼游过去把它们吃掉，头上飘一行 `-1 token`
- 鼠标是一盏**提灯**，带着洋流把光点往鲸鱼嘴边赶
- 右下角有个**发射区**：鼠标进圈，圈里的光点和鲸鱼一起被甩出去（最远约 4 倍圈直径）
- 右上角齿轮 ⚙ 是**控制台**：12 个滑杆 + 6 个开关 + 1 个下拉 + 1 个词库框，改完立刻变
- **五种运动方式**（漂移 / 飘落 / 上浮 / 洋流 / 漩涡）+ **呼吸灯**，和鼠标吸引、发射台叠加生效
- 深浅色主题自动跟随；`prefers-reduced-motion` 时跑 120 帧后定格；页面隐藏时暂停


## 安装

前提：**页面必须是 DSH 自己的 Web 界面** —— 桌面端窗口，或者用 `dsh web` 起在浏览器里打开，两者都行
（见下面「在浏览器里用」）。插件走的是 DSH 的客户端插件机制（`window.__ModuleLoader__`），所以不能当普通
`<script>` 塞进别的网页；但它**不是 Electron 专属**，Chromium 内核的浏览器里实测正常。
仓库里已经带了生成好的 `lib/client.js`，**装的时候不需要 Node、不需要 Python、不需要构建**。

### 方式 A：一条命令从 GitHub 直装（推荐）

```bash
# 1) 先确认活动 profile —— 这个文件里 "active" 那一项就是（常见 desktop / web）
cat "$APPDATA/DSH Desktop/profile-selection"

# 2) 用桌面端自带的 CLI，把 GitHub 上的包直接装进 profile（dsh 一般不在 PATH 里）
DSH="/c/Program Files/DSH Desktop"        # 换成你自己的安装目录
ELECTRON_RUN_AS_NODE=1 DSH_HOME="$HOME/.dsh" "$DSH/DSH Desktop.exe" \
  --expose-internals "$DSH/resources/app/lib/desktop-cli.js" \
  plugin --profile desktop add "github:wenwubei5/dsh-whale-pond"
```

`plugin add` 后面的参数是**原样转给 pnpm** 的，所以三种写法都行：

| 写法 | 例子 | 说明 |
| --- | --- | --- |
| GitHub 简写 | `github:wenwubei5/dsh-whale-pond` | 装当前 main 的最新提交 |
| git URL | `git+https://github.com/wenwubei5/dsh-whale-pond.git` | 同上，可加 `#v1.0.0` 钉版本 |
| 本地目录 | `"D:/code/dsh-whale-pond"` | 装成 `link:`，改源码刷新即生效 |

### 方式 B：先 clone 再装（想改源码用这个）

```bash
git clone https://github.com/wenwubei5/dsh-whale-pond.git "D:/code/dsh-whale-pond"
# 然后照上面第 2 步，最后一段换成：
#   plugin --profile desktop add "D:/code/dsh-whale-pond"
```

改完 `src/whale_pond.html` 或 `src/whale_panel.js` 后跑 `python build/build.py` 重新生成
`lib/client.js`（只要 Python 3 + 标准库，没有第三方依赖）。

**新增插件包必须重启一次 DSH**（客户端入口要重新扫描）。之后再改代码就只要刷新页面（Ctrl+R）。
从 GitHub 装的是**中性默认词**版本；你自己的词库存在 `localStorage`，不受影响。

### 方式 C：下载 zip（离线 / 机器上没有 git）

到 [Releases](https://github.com/wenwubei5/dsh-whale-pond/releases/latest) 下载 `dsh-whale-pond-1.0.0.zip`
（55 KB，里面是 `package.json` + `lib/` + `cordis.patch.yml` + `README.md` + `LICENSE`），
解压出 `dsh-whale-pond/`，再把上面的命令最后一段换成那个目录：

```bash
... plugin --profile desktop add "D:/下载/dsh-whale-pond"
```

zip 里的 `lib/client.js` 就是生成好的产物（44,604 B），解压即可用，不需要构建。

卸载：把上面的 `add` 换成 `remove`。

### 在浏览器里用（不打开桌面端窗口）

插件跑在 DSH 的 Web 界面里，所以只要页面是 DSH 提供的，用浏览器打开效果完全一样。桌面端自带的 CLI 就能起
一个纯 Web 实例：

```bash
DSH="/c/Program Files/DSH Desktop"          # 换成你自己的安装目录
ELECTRON_RUN_AS_NODE=1 DSH_HOME="$HOME/.dsh" "$DSH/DSH Desktop.exe" \
  --expose-internals "$DSH/resources/app/lib/desktop-cli.js" \
  --profile web --port 4407 --no-open
```

它会打印一行 `http://127.0.0.1:4407/?token=…`，复制到 Chrome / Edge 里打开就有鲸鱼、光点和控制台。
**插件要装进提供这个页面的那个 profile** —— 上面安装命令里的 `--profile desktop` 换成 `--profile web` 即可。

两点要知道：

- 桌面端窗口自己那个端口（默认 `43120`）是给 Electron 渲染进程用的：浏览器直接开会被 DSH 的鉴权挡住（401），
  插件路由还带 `x-dsh-desktop-renderer` 头校验。这是宿主自己的限制，跟插件无关。
- 实测用的是 Chromium 内核（Chrome / Edge）；Firefox / Safari 没测，理论上没问题（只用到 canvas 2D、CSS 变量和 localStorage）。

## 控制台

界面右上角的小齿轮 ⚙（悬停变亮）点开就是控制台，拖动即时生效、不用刷新。
设置存在 `localStorage['whale-pond-settings-v1']`（词库单独一个键），面板底部「恢复默认（词库保留）」一键回默认。

| 分组 | 控件 | 默认 |
| --- | --- | --- |
| 界面 | 面板不透明度 · 画布亮度 | 0.34 · 1.6 |
| 海 | 光点数量 · 光点速度 | 400 · 1.0 |
| 鼠标（提灯） | 洋流吸引光点 ☑ · 吸引半径 · 吸引强度 · 显示吸引范围光环 ☑ | 340px · 1.0 |
| 吃光点 | 飘字「-1 token」☑ · 飘字「吃掉「词」」☑ | 都开 |
| 词库 | 一行一个词，最多 200 个 / 每个 24 字，改一下存一下 | 内建 10 个词 |
| 右下角发射台 | 启用发射台 ☑ · 圈半径 · 距右下角 · 弹射力度 | 170px · 132px · 4.0 |
| 光点运动 | 运动方式 · 运动强度 · 呼吸灯 ☐ · 呼吸快慢 | 漂移 · 1.0 · 关 · 1.0 |
| 性能 | 内部清晰度 · 运行状态（只读） | 1.0 |


## 实现要点（这些坑都踩过）

- **canvas 要 `z-index:-1`，但光这样是看不见的**：body 自己的不透明背景画在负 z-index 后代之上，
  样式表压不住主题规则 —— 必须 `document.body.style.setProperty("background","transparent","important")`（inline + important 实测必胜）。
- **设计 token 定义在 body 上、不在 html 上**：往 `documentElement` 写等于白写。token 覆盖成半透明后，
  界面自己就变玻璃了（透明度表在 `lib/client.js` 的 `TOKENS`）。
- **背景要烘焙**：海面渐变 + 暗角很贵，改成离屏 canvas 各烘一次（背景 1/4 分辨率、暗角只在建立或改尺寸时烘），
  每秒的离屏重绘像素量从 3.3M 降到 254K。
- **光点要批量画**：按类型分 4 桶、每桶一次 `fill()`；呼吸灯再按 3 档亮度分桶（每帧 fill 29 → 45，仍然不掉帧）。
- **「跟手」得用阻尼弹簧 + 距离比例力**：把弹簧力写成单位向量会让拉力弱约 100 倍，光点「越赶越散」。
- **发射出去的光点要免疫鼠标吸引**（`if(lamp.on && !(m.lz>0))`），否则会被鼠标自己拽回来、飞不远。
- **帧门 `if(dt < 24) return;` + `document.hidden` 暂停 + DPR ≤ 1.5 + 32fps 上限**，4K 屏也稳。

## 改它

```
src/whale_pond.html   # 原版海洋小游戏 —— 物理与绘制的来源（build.py 按行号引用它）
src/whale_panel.js    # 控制台（面板）源码
build/build.py        # 生成器：按行号剪裁 src/whale_pond.html + 注入补丁 → lib/client.js
lib/client.js         # 生成产物（已提交，装完即用，不需要构建工具）
test/harness.html     # 离线夹具：假 __ModuleLoader__ + 手动 rAF 泵，无头浏览器 3 秒跑完
test/probes/*.js      # 真页面 CDP 探针（运动方式 / 控制台 / 词库 / 发射区 / 越界值 / 全控件扫描）
```

重建（会重写 `lib/client.js`、`cordis.patch.yml`、`package.json`）：

```bash
python build/build.py
node --check lib/client.js
```

### 离线夹具（不用起 DSH）

```bash
msedge --headless=new --disable-gpu --no-sandbox --virtual-time-budget=300000 \
  --dump-dom "file:///$(pwd)/test/harness.html" | grep -o 'RESULT {.*}'
```

夹具返回一大坨 JSON：每帧 `arc` 调用数、光点数量、控制台 20 个控件的读数、
五种运动方式的平均位移（最近邻匹配）、呼吸灯的半径分布、离屏烘焙成本，
以及两个历史 bug 的回归项（面板开着时 Esc 不穿透、localStorage 越界值自动夹紧）。

### 真页面探针

先起一个测试用的 DSH 实例，再用无头 Edge 连上去：

```bash
node test/front.mjs 4406                        # 让标签页前台化（否则 rAF 一帧不发）
node test/cdp.mjs test/probes/motion.js shot.png 4406
```

`test/cdp.mjs <探针.js> <截图.png|""> <url 子串>`，截图参数传空串就只求值。

## English

A purely visual wallpaper plugin for **DSH Desktop**: a whale, drifting motes and jellyfish are
drawn on a fixed `z-index:-1` canvas behind the web UI, while the UI's own background tokens are
made translucent so the sea shows through. The mouse acts as a lamp that herds motes toward the
whale; a launch pad in the bottom-right corner blasts motes and the whale away; a gear panel
exposes 20 live controls (count, speed, motion mode, breathing light, word list, render scale, …).
No input is intercepted, nothing is fetched, there are no dependencies.

Install: `dsh plugin --profile <profile-name> add <this folder>`, then restart DSH once.

## License

MIT
