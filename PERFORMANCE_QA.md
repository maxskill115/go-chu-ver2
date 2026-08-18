# Performance QA — Easy startup

Dùng sau Phase 9 đợt 11/11B/11C/11D/11E và trước khi bắt đầu responsive UI redesign.

## 1. Mở đúng môi trường

Local:

```bat
tools\serve_local.bat
```

Mở:

```text
http://127.0.0.1:8000/
```

Vercel: dùng URL deploy hiện tại sau khi deploy commit mới.

## 2. Cold load Easy

1. Mở DevTools → Network → Disable cache.
2. Reload trang.
3. Không bấm Listen/Memory/Profile trong lần đo đầu.
4. Khi prompt + input usable, Console:

```js
printGoChuStartupPerformance()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
```

`printGoChuPerformanceHealth()` chỉ xuất hiện sau khi post-startup modules đã nạp xong.

Mục tiêu:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText:easy không tạo Long Task > 50 ms
easy:entrySyncGate càng gần 0–20 ms càng tốt
easy:auxUiFlush không tạo Long Task > 50 ms
postStartup:start phải sau easy:firstInputReady/first paint gate
```

`easy:firstInputReady` phải xuất hiện trước asset probe/visual/post-startup network không thiết yếu.

## 3. Phase 9 đợt 11D — transition gate

`getGoChuEasyEntryTransitionHealth()`:

- `easyEntries >= 1`;
- `transitionActive === false` sau khi vào mode;
- `deferredCalls > 0`;
- `auxFlushes >= 1`;
- `pending` về false sau vài frame;
- mobile/touch: `mobileAutofocusSkipped` tăng;
- desktop: `desktopAutofocusDeferred` tăng.

Mobile không tự bật bàn phím ngay khi vừa vào Easy; bé chạm ô gõ thì bàn phím mới mở.

## 4. Phase 9 đợt 11E — critical/post-startup split

Ngay sau first Easy frame:

```js
getGoChuPostStartupHealth()
```

Kỳ vọng trong giai đoạn đầu có thể thấy:

```text
ready = false
loading = false/true
```

Sau vài trăm ms tùy mạng:

```text
ready = true
failedScripts = []
failedStyles = []
loadedScripts = 13
loadedStyles = 4
pendingScripts = 0
pendingStyles = 0
```

Network cold-load phải cho thấy:

- critical HTML chỉ có khoảng 18 script tag thay vì ~30;
- chỉ 9 CSS blocking first render;
- `data-poems.js`, visual/Twemoji, Vietnamese UI/dashboard, mode stats, storage, asset, accessibility, performance/debug **bắt đầu sau first paint**;
- Free button tạm disabled/`aria-busy=true` cho tới post-startup ready;
- sau ready, Free hoạt động bình thường.

Visual prompt đầu tiên có thể xuất hiện sau prompt/input một nhịp; đây là chủ đích để không block first usable frame.

## 5. Boot state regression

```js
getGoChuBootState()
```

Kỳ vọng cuối cùng:

```text
currentMode = easy
isBooting = false
```

`easy-boot-state.js` chỉ giữ mode trung tính trong lúc module Easy-only critical được nạp; `script.js` sau đó gọi `setMode("easy")` một lần để kích hoạt thật.

## 6. Cache health

Sau khi post-startup ready:

```js
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuVisualHealth()
```

Kỳ vọng:

- topic/word-count cache được tái sử dụng;
- `lastEasySourcePoolSize` gần pool topic/level thực tế, không phải toàn bộ `easyWords`;
- `lastEasyRoundBuildMs` nhỏ;
- weak cache hit tăng khi stats không đổi;
- visual cache tăng theo prompt đã gặp.

## 7. Prompt loop

Luyện 20–30 prompt Easy liên tục, sau đó:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
```

Kiểm tra:

- `showText:easy` max không tăng bất thường;
- không có long task lặp liên tục;
- input phản hồi tức thì;
- Smart Review count đúng;
- topic/Auto level đúng;
- post-startup loader chỉ chạy một lần.

## 8. Chuyển mode qua lại

Sau khi `GO_CHU_POST_STARTUP_READY === true`, thử tối thiểu 10 vòng:

```text
Easy → Hard → Easy → Free → Easy
```

Kỳ vọng:

- Easy prompt xuất hiện ngay;
- Hard/Free không lộ control Easy;
- Free có đủ bài thơ;
- visual/Vietnamese progress vẫn hoạt động sau post-load;
- audio/listen dừng đúng khi rời Easy;
- không tích lũy timer/frame pending.

## 9. Lazy-init checks

### Profile

Ngay sau load:

```js
Boolean(document.getElementById("profileDashboardOverlay"))
```

Kỳ vọng: `false`.

Bấm 👤 sau post-startup ready → dashboard hoạt động đầy đủ, gồm extension Vietnamese/mode stats.

### Asset probe

`asset-reliability.js` là post-startup và bản thân probe còn chờ idle. Không được xuất hiện trong critical first paint.

### Listen

Listen/TTS core vẫn sẵn sàng sớm, nhưng không enumerate voice nếu chưa bật.

### Settings

Voice selector chỉ dựng khi mở Settings.

## 10. Profile persistence regression

1. Tạo ít nhất một lượt Hard hoặc Free.
2. Ghi lại dashboard stats Hard/Free.
3. Reload trang.
4. Đợi post-startup ready rồi mở dashboard.

Kỳ vọng: Hard/Free stats vẫn còn, không reset về 0.

## 11. Browser/device matrix trước UI redesign

Tối thiểu:

```text
Chrome desktop 1366×768
Chrome desktop 1920×1080
Android/Chrome hoặc emulation 390×844
Landscape 640×360
```

Nếu Easy vẫn gần treo, lấy cùng lúc:

```js
printGoChuStartupPerformance()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau post-startup ready lấy thêm:

```js
printGoChuPerformanceHealth()
```

Không bắt đầu Phase 9 đợt 12 nếu vẫn có startup long task lớn hoặc input chưa usable nhanh.
