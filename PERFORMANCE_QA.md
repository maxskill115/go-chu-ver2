# Performance QA — Easy startup

Áp dụng sau Phase 9.11–11F và trước responsive UI redesign.

## 1. Cold load

Local:

```bat
tools\serve_local.bat
```

DevTools → Network → Disable cache → reload.

Ngay khi prompt/input usable:

```js
printGoChuStartupPerformance()
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

## 2. Critical path 11F

Cold-load Network phải cho thấy khoảng:

```text
14 critical script tag
6 blocking CSS
```

Không được có trong critical HTML:

```text
tts-manifest.js
listen-mode.js
ux-hotfix.js
tts-local.js
memory-mode.js
visual/Twemoji
Vietnamese UI/dashboard
mode-stats/storage/asset/a11y/debug
```

Critical phải có:

```text
memory-state.js
```

để Topic/Profile đọc Memory preferences mà không tải behavior Memory.

## 3. Post-startup 11E/11F

```js
getGoChuPostStartupHealth()
```

Sau khi hoàn tất kỳ vọng:

```text
ready = true
runtimeValidated = true
failedScripts = []
loadedScripts = 19
loadedStyles = 7
pendingScripts = 0
pendingStyles = 0
memoryBehaviorReady = true
memoryTopicBridgeReady = true
```

`runtimeChecks` phải đều `true`, đặc biệt:

```text
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

Trong warm-up, Hard + Free phải disabled/`aria-busy=true`; Easy vẫn usable. Sau ready, Hard/Free tự mở.

## 4. Memory state/behavior regression

Trước post ready:

```js
getGoChuMemoryStateHealth()
```

Kỳ vọng:

```text
behaviorReady = false
memoryModeActive = false
memoryWordCount / memorySeconds có giá trị profile/default hợp lệ
```

Sau post ready:

```text
behaviorReady = true
```

Bật Memory:

- đúng số từ và số giây đã lưu trong profile;
- topic filter vẫn đúng;
- weak prompt vẫn được ưu tiên;
- Listen đang bật thì phải tắt khi Memory bật và ngược lại;
- rời Easy phải dừng timer/Memory.

## 5. Boot/transition regression

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

## 6. Cache/prompt loop

Sau post ready:

```js
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuVisualHealth()
```

Luyện 20–30 prompt Easy. Không được có long task lặp, Smart Review/Auto level phải đúng, `lastEasySourcePoolSize` phải là pool topic/level thực tế chứ không toàn `easyWords`.

## 7. Mode regression

Sau `GO_CHU_POST_STARTUP_READY === true`, thử 10 vòng:

```text
Easy → Hard → Easy → Free → Easy
```

Kiểm tra:

- Hard/Free stats ghi đúng và còn sau reload;
- Free có đủ bài;
- visual/Vietnamese progress hoạt động;
- Listen/TTS/Memory hoạt động và không lộ sang Hard/Free;
- không tích timer/frame pending.

## 8. Profile/dashboard

Ngay startup:

```js
Boolean(document.getElementById("profileDashboardOverlay"))
```

Kỳ vọng `false`.

Sau post ready mở 👤: dashboard đầy đủ Vietnamese/mode stats; Tab/Escape/focus trap vẫn đúng.

## 9. Browser/device matrix

```text
Chrome 1366×768
Chrome 1920×1080
390×844 mobile
640×360 landscape
```

Nếu vẫn lag, lấy cùng lúc:

```js
printGoChuStartupPerformance()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuMemoryStateHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau post ready lấy thêm:

```js
printGoChuPerformanceHealth()
```

Không bắt đầu Phase 9.12 nếu first Easy frame vẫn bị long task lớn hoặc input chưa usable nhanh.
