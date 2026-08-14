# Runtime architecture — go-chu-ver2

Tài liệu này khóa **load order, wrapper chain và invariant hiệu năng** của project.

## 1. Nguyên tắc

- Không đổi thứ tự `<script>` nếu chưa audit wrapper.
- Hard/Free không được ghi vào `promptStats` adaptive của Easy.
- Wrapper phải lưu base function và gọi base đúng một lần, trừ implementation replacement đã ghi rõ.
- Không thêm network/storage/dashboard work vào frame đầu của Easy.
- Google credential/API key không được đưa vào browser/runtime.
- Module accessibility không được bọc logic học.
- Debug/smoke-test không được thay hành vi học.

## 2. Load order hiện tại

1. `startup-performance.js`
2. `data-easy.js`
3. `tts-manifest.js`
4. `data-poems.js`
5. `visual-data.js`
6. `twemoji-local-manifest.js`
7. `topic-data.js`
8. `script-core.js`
9. `smart-review.js`
10. `visual-prompt.js`
11. `listen-mode.js`
12. `ux-hotfix.js`
13. `tts-local.js`
14. `memory-mode.js`
15. `topic-level.js`
16. `profile-stats.js`
17. `vietnamese-input.js`
18. `vietnamese-dashboard.js`
19. `startup-runtime-instrument.js`
20. `script.js`
21. `stability-fixes.js`
22. `mode-stats.js`
23. `storage-health.js`
24. `asset-reliability.js`
25. `accessibility.js`
26. `performance-health.js`
27. `debug-smoke.js`

`script.js` gọi cuối startup:

```js
startStudyTimer();
setMode("easy");
```

Vì vậy `startup-runtime-instrument.js` phải nạp **trước `script.js`** để đo đúng final wrapper chain khi Easy khởi động.

## 3. Easy startup performance — Phase 9 đợt 11

### Root cause đã xác định

Trước đợt 11, `topic-level.js` lọc từng prompt bằng `promptMatchesLearningFilters()`. Mỗi prompt lại gọi `getEffectiveLearningLevel()`, hàm này tiếp tục dựng topic/level pool bằng cách scan toàn `easyWords`.

Với hàng trăm prompt, startup gần dạng:

```text
N prompt
× effective-level calculation
× scan N prompt
× normalize/topic-term matching
```

Đây là hot path gần O(n²) và là nguyên nhân rất mạnh khiến Easy vào trang bị lag/gần treo.

### Cache tĩnh

`topic-data.js` tạo một lần:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
```

- normalize topic string được cache;
- membership prompt/topic được cache;
- word count được cache;
- normalized topic terms được compile một lần.

Debug:

```js
getGoChuTopicCacheHealth()
```

### Pool cache

`topic-level.js` giữ:

```js
goChuTopicPoolCache
goChuLevelPoolCache
```

`getTopicPool()` và `getLevelPool()` không scan lại `easyWords` sau lần đầu cho cùng key.

Quan trọng nhất, `buildSmartEasyRound()` tính:

```js
const effectiveLevel = getEffectiveLearningLevel();
```

**một lần cho cả round**, rồi filter bằng topic + cached word count. Không được quay lại tính effective level cho từng prompt.

Debug:

```js
getGoChuLearningPoolHealth()
```

### Smart Review

`getWeakPromptRecords()` dùng `GO_CHU_EASY_PROMPT_SET` thay vì tạo `new Set(easyWords)` mỗi lần.

### Visual deferred

`visual-prompt.js`:

- compile semantic rules một lần;
- cache prompt → visual mapping;
- `showText()` chỉ schedule visual bằng `requestAnimationFrame`;
- image dùng `loading="lazy"`, `decoding="async"`, low fetch priority;
- stale request không được ghi đè prompt mới.

Thứ tự:

```text
prompt/input paint
→ frame kế tiếp
→ visual mapping / local SVG / CDN / emoji
```

Debug:

```js
getGoChuVisualHealth()
```

### Web Speech lazy

Khi Listen tắt:

- không `getVoices()` ở mỗi `showText`;
- không dựng voice selector lúc startup;
- voice runtime chỉ initialize khi bật Listen hoặc mở Settings.

TTS local vẫn theo:

```text
1. local MP3
2. Web Speech vi-*
3. báo thiếu audio
```

### Profile/dashboard lazy

Startup chỉ load registry + active profile data và route preferences.

Không còn:

```text
startup → ensureProfileDashboard() → render toàn bộ dashboard
```

Dashboard DOM + thống kê chỉ dựng khi bấm 👤.

Existing profile không bị stringify/write lại vô điều kiện ở mỗi startup.

Accessibility theo dõi việc dashboard được tạo lazy bằng `MutationObserver`, nên focus trap/ARIA/Escape vẫn hoạt động sau khi mở.

### Asset probing idle

`asset-reliability.js` không probe `../IMG` trong critical startup path.

Nó chạy bằng:

```text
requestIdleCallback(timeout 1200)
hoặc setTimeout 700ms
```

## 4. Startup diagnostics

`startup-performance.js` cung cấp:

```js
getGoChuStartupPerformance()
printGoChuStartupPerformance()
```

Markers hiện có:

```text
bootstrap
profileReady
runtimeWrappersReady
setModeEasy:start
setModeEasy:end
easy:firstPaint
easy:firstInputReady
assetProbe:started
```

Measures:

```text
profile:init
setMode:easy
showText:easy
```

Performance gate mục tiêu:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText không tạo Long Task > 50 ms
network không block input
```

CI chỉ khóa regression tĩnh; **latency ms thật phải đo trong browser thật**.

## 5. Wrapper chain

### `showText`

- `script-core.js` — baseline render/reset/focus.
- `smart-review.js` — reset wrong guard + review bar.
- `visual-prompt.js` — chỉ schedule visual deferred.
- `listen-mode.js` — prompt visibility; chỉ speech nếu Listen active.
- `memory-mode.js` — countdown chỉ khi Memory active.
- `topic-level.js` — bar/status dùng cached pools.
- `vietnamese-input.js` — word progress/guide.
- `startup-runtime-instrument.js` — measure final pre-script chain.
- `mode-stats.js` — Hard stats wrapper được nạp sau `script.js`.

### `setMode`

- `script-core.js`
- `smart-review.js`
- `visual-prompt.js`
- `listen-mode.js`
- `tts-local.js`
- `memory-mode.js`
- `topic-level.js`
- `vietnamese-input.js`
- `startup-runtime-instrument.js`

Invariant:

- rời Easy → Listen/Memory/visual Easy phải dừng/ẩn;
- Easy-only tools không xuất hiện ở Hard/Free.

### `checkNext`

- `smart-review.js` là implementation chính Easy/Hard hiện tại;
- `memory-mode.js` intercept khi Memory active;
- `mode-stats.js` ghi Hard stats lớp cuối.

### `showTypingDiff`

- baseline Levenshtein ở `script-core.js`;
- renderer gọn ở `ux-hotfix.js`;
- accent-only hint ở `vietnamese-input.js`.

## 6. Visual pipeline

Twemoji pinned `jdecked/twemoji@17.0.3`.

```text
semantic exact/contains match
→ local SVG nếu manifest có
→ CDN pinned
→ emoji fallback
```

Nếu semantic mapping không chắc → không hiện hình.

Vendor:

```text
tools/vendor_twemoji.py
tools/vendor_twemoji.bat
```

## 7. Profile/storage

Keys:

```text
goChuVer2.profiles.v1
goChuVer2.activeProfile.v1
goChuVer2.profile.<id>.v1
```

- Easy adaptive: `promptStats`.
- Hard/Free: `modeStats.hard/free` riêng.
- `storage-health.js` compare-before-write.
- Study time vẫn flush khoảng 15 giây.

Debug:

```js
getGoChuStorageHealth()
printGoChuStorageHealth()
goChuStorageMetrics
```

## 8. Stability layer

Đã cấm:

- auto-fullscreen trên click/keydown/wheel;
- rebuild 50+ Free options mỗi lần mở;
- layout-heavy resize/input nhiều lần cùng frame.

`performance-health.js` theo dõi Long Task/runtime error.

Debug:

```js
getGoChuPerformanceHealth()
printGoChuPerformanceHealth()
```

## 9. Accessibility

`accessibility.js` chỉ quản lý:

- ARIA;
- focus trap/restore;
- modal inert;
- Tab/Shift+Tab/Escape;
- lazy profile modal binding;
- reduced motion.

Không bọc logic học.

## 10. CI/static verification

`.github/workflows/verify.yml` chạy:

1. Python compile.
2. `node --check` toàn bộ JS root.
3. `tools/verify_repository.py`.
4. deploy readiness report.
5. Twemoji dry-run.
6. Google TTS dry-run.

Verifier khóa thêm đợt 11:

- startup marker scripts phải tồn tại đúng load order;
- topic/word-count/pool cache không được xóa;
- không quay lại per-prompt effective-level calculation;
- visual phải deferred/cached;
- profile dashboard không được eager render;
- voice enumeration không được eager;
- asset probing phải idle.

## 11. Khi thêm module mới

Trước merge:

1. Audit wrapper/load order.
2. Không thêm synchronous scan/network/storage vào Easy first paint.
3. `node --check` PASS.
4. `python tools/verify_repository.py` PASS.
5. `runGoChuSmokeTests()` PASS trong browser.
6. `printGoChuStartupPerformance()` kiểm tra first-input/showText.
7. Test Easy/Hard/Free/Listen/Memory/profile.
8. Test visual local/CDN/emoji.
9. Test dashboard keyboard/accessibility.
10. Cập nhật `RUNTIME_ARCHITECTURE.md` + `HANDOFF.md`.
