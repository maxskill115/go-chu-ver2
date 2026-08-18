# Performance QA — Easy startup

Áp dụng sau Phase 9.11–11H và trước responsive UI redesign.

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
getGoChuProfileRuntimeHealth()
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

## 2. Critical path 11H

Cold-load Network phải cho thấy khoảng:

```text
14 critical script tag
5 blocking CSS
```

Critical phải có:

```text
memory-state.js
profile-stats.js   # runtime/data only
easy-start.js
```

Không được có:

```text
script.js
profile-dashboard.js
profile-stats.css
tts-manifest.js
listen-mode.js
ux-hotfix.js
tts-local.js
memory-mode.js
visual/Twemoji
Vietnamese UI/dashboard
mode-stats/storage/asset/a11y/debug
```

11G giảm critical code volume bằng `easy-start.js`; 11H giảm tiếp bằng cách bỏ profile dashboard/backup code và CSS khỏi first Easy parse/paint.

## 3. Easy bootstrap 11G

```js
getGoChuEasyBootstrapHealth()
```

Ngay first frame:

```text
coreStarted = true
currentMode = easy
```

Sau post ready:

```text
legacyScriptEasySuppressed = true
```

Trong warm-up Easy dùng được; Hard + Free + Settings tạm disabled/`aria-busy=true`.

## 4. Profile runtime/dashboard split 11H

Ngay first Easy frame:

```js
getGoChuProfileRuntimeHealth()
```

Kỳ vọng:

```text
ready = true
profileCount >= 1
activeProfileId != ""
dashboardReady = false
```

Đồng thời:

```js
Boolean(document.getElementById("profileDashboardBtn"))
Boolean(document.getElementById("profileDashboardOverlay"))
```

Kỳ vọng trước post-ready:

```text
false
false
```

Sau post-ready:

```text
getGoChuProfileRuntimeHealth().dashboardReady = true
Boolean(document.getElementById("profileDashboardBtn")) = true
```

`profile-stats.css` phải được post-load cùng dashboard, không block first Easy paint.

## 5. Post-startup 11E–11H

```js
getGoChuPostStartupHealth()
```

Sau khi hoàn tất kỳ vọng:

```text
ready = true
runtimeValidated = true
failedScripts = []
loadedScripts = 21
loadedStyles = 8
pendingScripts = 0
pendingStyles = 0
appUiLoaded = true
legacyScriptEasySuppressed = true
memoryBehaviorReady = true
memoryTopicBridgeReady = true
profileRuntimeReady = true
profileDashboardReady = true
```

`runtimeChecks` phải đều true:

```text
appUi
legacyEasySuppressed
freeData
listen
tts
memory
memoryTopic
profileUi
vietnameseInput
modeStats
storage
performance
```

Sau ready:

- Settings mở/đóng bình thường;
- Free có event handlers và bài thơ;
- Hard/Free tự mở;
- nút 👤 xuất hiện và dashboard hoạt động.

## 6. Profile regression bắt buộc

Sau post-ready kiểm tra:

1. Mở 👤.
2. Đổi profile.
3. Thêm profile.
4. Đổi tên.
5. Xóa profile khi có >1 profile.
6. Reset tiến độ profile hiện tại.
7. Export backup JSON.
8. Import backup JSON.
9. Reload trang.

Kỳ vọng:

- active profile đúng;
- Topic/Level/Memory preference theo profile đúng;
- Easy promptStats không lẫn profile;
- Hard/Free modeStats còn nguyên sau reload;
- study timer vẫn tăng và flush khoảng 15 giây;
- dashboard vẫn nhận extension `vietnamese-dashboard.js` và `mode-stats.js`.

## 7. Memory state/behavior regression

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

## 8. Boot/transition regression

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

## 9. Cache/prompt loop

Sau post ready:

```js
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuVisualHealth()
```

Luyện 20–30 prompt Easy. Không long task lặp, Smart Review/Auto level đúng, `lastEasySourcePoolSize` phải là pool topic/level thực tế.

## 10. Mode/Settings regression

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

## 11. Browser/device matrix

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
getGoChuProfileRuntimeHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau post ready thêm:

```js
printGoChuPerformanceHealth()
```

Không bắt đầu Phase 9.12 nếu first Easy frame vẫn có long task lớn hoặc input chưa usable nhanh.
