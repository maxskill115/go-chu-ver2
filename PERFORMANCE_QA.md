# Performance QA — Easy startup

Áp dụng sau Phase 9.11–11G và trước responsive UI redesign.

## 1. Cold load

Local:

```bat
tools\serve_local.bat
```

DevTools → Network → Disable cache → reload.

Ngay khi prompt/input usable:

```js
printGoChuStartupPerformance()
getGoChuEasyBootstrapHealth()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuMemoryStateHealth()
```

Mục tiêu:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText:easy không Long Task > 50 ms
easy:entrySyncGate ~0–20 ms nếu có thể
postStartup:start sau first Easy paint
```

Mobile không tự bật keyboard khi vừa vào Easy.

## 2. Critical path 11F/11G

Cold-load Network phải cho thấy khoảng:

```text
14 critical script tag
6 blocking CSS
```

**11G không nhất thiết giảm thêm request count.** Mục tiêu là giảm **critical parse/execute volume**: `script.js` lớn không còn trong HTML critical path.

Critical phải có:

```text
memory-state.js
easy-start.js
```

Không được có:

```text
script.js
tts-manifest.js
listen-mode.js
ux-hotfix.js
tts-local.js
memory-mode.js
visual/Twemoji
Vietnamese UI/dashboard
mode-stats/storage/asset/a11y/debug
```

`easy-start.js` chỉ chịu trách nhiệm startup Easy và one-time legacy suppression; Free/Settings code không được quay lại file này.

## 3. Easy bootstrap split 11G

Ngay sau first Easy frame:

```js
getGoChuEasyBootstrapHealth()
```

Kỳ vọng:

```text
coreStarted = true
currentMode = easy
```

Sau post-startup ready:

```text
legacyScriptEasySuppressed = true
```

Ý nghĩa: `script.js` được post-load và hai dòng legacy cuối file không được phép re-run Easy transition lần hai.

Trong warm-up:

- Easy vẫn dùng được;
- Hard + Free + Settings tạm disabled/`aria-busy=true`;
- click Easy của user **không được** bị suppression guard chặn; guard chỉ chặn khi `GO_CHU_EXECUTING_POST_SCRIPT === "script.js"`.

Startup report nên có:

```text
easy:bootstrap
```

## 4. Post-startup 11E–11G

```js
getGoChuPostStartupHealth()
```

Sau khi hoàn tất kỳ vọng:

```text
ready = true
runtimeValidated = true
failedScripts = []
loadedScripts = 20
loadedStyles = 7
pendingScripts = 0
pendingStyles = 0
appUiLoaded = true
legacyScriptEasySuppressed = true
memoryBehaviorReady = true
memoryTopicBridgeReady = true
```

`runtimeChecks` phải đều true, gồm:

```text
appUi
legacyEasySuppressed
freeData
listen
tts
memory
memoryTopic
vietnameseInput
modeStats
storage
performance
```

Sau ready:

- Settings mở/đóng bình thường;
- Free có event handlers và bài thơ;
- Hard/Free tự mở.

## 5. Memory state/behavior regression

Trước post ready:

```js
getGoChuMemoryStateHealth()
```

Kỳ vọng:

```text
behaviorReady = false
memoryModeActive = false
memoryWordCount / memorySeconds hợp lệ
```

Sau post ready: `behaviorReady = true`.

Bật Memory phải giữ topic filter, weak prompt, profile preference và Listen/Memory mutual exclusion.

## 6. Boot/transition regression

```js
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
```

Kỳ vọng:

```text
currentMode = easy
isBooting = false
transitionActive = false
pending jobs về false sau vài frame
```

Mobile: `mobileAutofocusSkipped` tăng. Desktop: `desktopAutofocusDeferred` tăng.

## 7. Cache/prompt loop

Sau post ready:

```js
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuVisualHealth()
```

Luyện 20–30 prompt Easy. Không long task lặp, Smart Review/Auto level đúng, `lastEasySourcePoolSize` phải là pool topic/level thực tế.

## 8. Mode/Settings regression

Sau `GO_CHU_POST_STARTUP_READY === true`, thử 10 vòng:

```text
Easy → Hard → Easy → Free → Easy
```

và mở/đóng Settings nhiều lần.

Kiểm tra:

- Hard/Free stats còn sau reload;
- Free đủ bài;
- Settings volume/case/music hoạt động;
- visual/Vietnamese progress hoạt động;
- Listen/TTS/Memory không lộ Hard/Free;
- không duplicate event handler hoặc duplicate Easy rebuild.

## 9. Profile/dashboard

Ngay startup:

```js
Boolean(document.getElementById("profileDashboardOverlay"))
```

Kỳ vọng `false`.

Sau post ready mở 👤: dashboard đầy đủ Vietnamese/mode stats, Tab/Escape/focus trap đúng.

## 10. Browser/device matrix

```text
Chrome 1366×768
Chrome 1920×1080
390×844 mobile
640×360 landscape
```

Nếu vẫn lag, lấy:

```js
printGoChuStartupPerformance()
getGoChuEasyBootstrapHealth()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuMemoryStateHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau post ready thêm:

```js
printGoChuPerformanceHealth()
```

Không bắt đầu Phase 9.12 nếu first Easy frame vẫn có long task lớn hoặc input chưa usable nhanh.
