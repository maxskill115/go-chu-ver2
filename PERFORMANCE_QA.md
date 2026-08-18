# Performance QA — Easy startup

Dùng sau Phase 9 đợt 11/11B/11C/11D và trước khi bắt đầu responsive UI redesign.

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
printGoChuPerformanceHealth()
getGoChuEasyEntryTransitionHealth()
```

Mục tiêu:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText:easy không tạo Long Task > 50 ms
easy:entrySyncGate càng gần 0–20 ms càng tốt
easy:auxUiFlush không tạo Long Task > 50 ms
```

`easy:firstInputReady` phải xuất hiện trước `assetProbe:started`; visual/network không được block input.

### Phase 9 đợt 11D cần thấy

`getGoChuEasyEntryTransitionHealth()`:

- `easyEntries >= 1`;
- `transitionActive === false` sau khi vào mode;
- `deferredCalls > 0` ở lần vào Easy;
- `auxFlushes >= 1`;
- `pending` trở về false sau vài frame;
- mobile/touch: `mobileAutofocusSkipped` tăng;
- desktop: `desktopAutofocusDeferred` tăng.

Mobile không tự bật bàn phím ngay khi vừa vào Easy; bé chạm ô gõ thì bàn phím mới mở.

## 3. Boot state regression

Ngay trong startup hoàn chỉnh:

```js
getGoChuBootState()
```

Kỳ vọng cuối cùng:

```text
currentMode = easy
isBooting = false
```

Ý nghĩa: `easy-boot-state.js` chỉ giữ mode trung tính trong lúc module Easy-only được nạp; `script.js` sau đó gọi `setMode("easy")` đúng một lần để kích hoạt thật.

Không được để Smart Review / Listen / Memory / Topic-Level / Vietnamese progress chạy workload Easy trước lần kích hoạt chính thức này.

## 4. Cache health

Console:

```js
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuVisualHealth()
```

Kỳ vọng:

- `topicMatches` / `wordCounts` tăng khi dùng rồi tái sử dụng;
- `topicPoolEntries` / `levelPoolEntries` ổn định, không tăng vô hạn;
- `lastEasySourcePoolSize` gần với pool topic/level thực tế, không phải toàn bộ `easyWords`;
- `lastEasyRoundBuildMs` nhỏ;
- weak cache hit tăng khi show prompt mà stats không đổi;
- visual `matchCacheSize` tăng theo prompt đã gặp;
- chuyển qua lại cùng topic/level không scan toàn `easyWords` lại theo mỗi prompt.

## 5. Prompt loop

Luyện 20–30 prompt Easy liên tục.

Sau đó:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuEasyEntryTransitionHealth()
```

Kiểm tra:

- `showText:easy` max không tăng bất thường;
- không có long task lặp liên tục;
- input vẫn phản hồi tức thì;
- Smart Review count vẫn đúng;
- topic/Auto level vẫn đúng;
- transition gate chỉ ảnh hưởng lúc `setMode("easy")`, không làm chậm prompt loop bình thường.

## 6. Chuyển mode qua lại

Thử tối thiểu 10 vòng:

```text
Easy → Hard → Easy → Free → Easy
```

Kỳ vọng:

- Easy prompt xuất hiện ngay;
- Hard/Free không lộ control Easy;
- audio/listen dừng đúng khi rời Easy;
- không tích lũy timer/frame pending;
- `getGoChuEasyEntryTransitionHealth().pending` trở về false sau mỗi lần vào Easy;
- `auxFlushes` tăng xấp xỉ số lần vào Easy, không tăng vô hạn khi đứng yên.

## 7. Lazy-init checks

### Profile

Ngay sau load:

```js
Boolean(document.getElementById("profileDashboardOverlay"))
```

Kỳ vọng: `false`.

Bấm 👤, chạy lại. Kỳ vọng: `true`, dashboard hoạt động bình thường, Tab/Escape/focus trap vẫn đúng.

### Asset probe

Ngay startup:

```js
getGoChuAssetHealth()
```

Có thể `initialized: false` trong critical first paint. Sau idle sẽ chuyển `true`.

### Listen

Không bật Listen: startup không cần enumerate voice.

Bật `Nghe rồi gõ`: voice Việt/local MP3 mới được resolve. Tắt Listen rồi đổi prompt phải không phát âm thanh.

### Settings

Voice selector chỉ cần dựng khi mở Settings.

## 8. Profile persistence regression

1. Tạo ít nhất một lượt Hard hoặc Free.
2. Ghi lại dashboard stats Hard/Free.
3. Reload trang.
4. Mở dashboard.

Kỳ vọng: Hard/Free stats vẫn còn, không reset về 0.

## 9. Browser/device matrix trước UI redesign

Tối thiểu:

```text
Chrome desktop 1366×768
Chrome desktop 1920×1080
Android/Chrome hoặc emulation 390×844
Landscape 640×360
```

Nếu Easy vẫn gần treo ở một thiết bị, lấy cùng lúc:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuEasyEntryTransitionHealth()
```

Không bắt đầu Phase 9 đợt 12 nếu vẫn có startup long task lớn hoặc input chưa usable nhanh.
