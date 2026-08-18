# Runtime architecture — go-chu-ver2

Tài liệu khóa **critical load order, post-startup dependency order, wrapper chain và invariant hiệu năng**.

## 1. Nguyên tắc

- Không đổi thứ tự script nếu chưa audit dependency/wrapper.
- Easy first usable frame không được chờ Free/Settings/Visual/Listen/TTS/Memory behavior/Stats/A11y/Debug.
- Hard/Free không ghi vào `promptStats` adaptive Easy.
- Wrapper gọi base đúng một lần trừ replacement đã ghi rõ.
- Không thêm sync scan/network/storage/dashboard vào first Easy frame.
- Google credential/API key không ở browser/runtime.

---

## 2. Critical load order — Phase 9.11G

Production `index.html` giữ khoảng **14 external script tag** ở critical path, nhưng code volume nhỏ hơn 11F vì `script.js` lớn đã ra hậu kỳ:

1. `startup-performance.js`
2. `data-easy.js`
3. `topic-data.js`
4. `memory-state.js`
5. `audio-lazy-bootstrap.js`
6. `script-core.js`
7. `easy-boot-state.js`
8. `smart-review.js`
9. `topic-level.js`
10. `profile-stats.js`
11. `startup-runtime-instrument.js`
12. `easy-entry-transition.js`
13. `easy-start.js`
14. `post-startup-loader.js`

`easy-start.js` là bootstrap chính thức:

```js
startStudyTimer();
setMode("easy");
```

Nó còn cài one-time guard để suppress đúng lời gọi `setMode("easy")` legacy khi `script.js` được post-loader thực thi; guard **không được chặn click Easy của user**.

Critical CSS:

```text
styles-1.css
styles-2.css
smart-review.css
topic-level.css
profile-stats.css
ui-scope-fixes.css
```

---

## 3. Post-startup load order

`post-startup-loader.js` chờ double RAF để browser có first Easy paint.

### Bootstrap hậu kỳ

`script.js` được tải riêng đầu tiên với marker:

```js
GO_CHU_EXECUTING_POST_SCRIPT = "script.js"
```

để `easy-start.js` suppress hai dòng startup legacy cuối file mà không suppress tương tác user.

`script.js` chứa phần lớn:

- Free mode;
- Settings handlers;
- global pointer/keyboard UI handlers;
- Free resize/input throttles;
- toast helper.

Vì vậy nó không còn được phép ở critical HTML.

### Feature hậu kỳ

Sau `script.js`, post loader tải các module còn lại với dynamic classic script `async=false` để giữ dependency order:

```text
data-poems.js
tts-manifest.js
visual-data.js
twemoji-local-manifest.js
visual-prompt.js
listen-mode.js
ux-hotfix.js
tts-local.js
memory-mode.js
memory-topic-bridge.js
vietnamese-input.js
vietnamese-dashboard.js
stability-fixes.js
mode-stats.js
storage-health.js
asset-reliability.js
accessibility.js
performance-health.js
debug-smoke.js
```

Post CSS:

```text
listen-mode.css
ux-hotfix.css
memory-mode.css
visual-prompt.css
vietnamese-input.css
accessibility.css
asset-reliability.css
```

Trong warm-up:

- Easy usable.
- Hard + Free + Settings disabled/`aria-busy=true`.
- Chỉ mở lại khi network load và runtime validation đều PASS.

Debug:

```js
getGoChuPostStartupHealth()
GO_CHU_POST_STARTUP_READY
```

---

## 4. Easy bootstrap split — 11G

### `easy-start.js` critical

Chỉ làm startup Easy + guard legacy:

```text
startStudyTimer
setMode(easy)
set GO_CHU_EASY_CORE_STARTED
install legacy script Easy suppression guard
```

Diagnostics:

```js
getGoChuEasyBootstrapHealth()
```

Expected sau post-ready:

```text
coreStarted = true
legacyScriptEasySuppressed = true
currentMode = easy
```

### `script.js` post

Giữ source baseline cũ, kể cả hai dòng startup legacy cuối file. Không chỉnh hàng trăm dòng chỉ để chuyển ownership startup; `easy-start.js` + loader marker đảm bảo lời gọi Easy legacy không rebuild mode lần hai.

Runtime validation yêu cầu:

```text
appUi = true
legacyEasySuppressed = true
```

---

## 5. Memory state/behavior split — 11F

### Critical: `memory-state.js`

Chỉ có state/preference:

```text
Memory keys
memoryModeActive
memoryWordCount
memorySeconds
load/save preference
getPromptWordCount
buildMemoryRound stub
```

Debug:

```js
getGoChuMemoryStateHealth()
```

### Post: `memory-mode.js`

Thay stub bằng actual Memory round, tạo timer/UI/wrappers và set:

```js
GO_CHU_MEMORY_BEHAVIOR_READY = true
```

Không được redeclare state.

### Post: `memory-topic-bridge.js`

Gắn lại selected-topic filter cho actual Memory round sau khi behavior post-load.

```js
GO_CHU_MEMORY_TOPIC_BRIDGE_READY = true
```

---

## 6. Easy startup evolution

### 11 — CPU cache

Loại near-O(n²) topic/effective-level scan bằng static caches.

### 11C — filtered round first

```text
getLevelPool(topic, level)
→ shuffle đúng pool
→ weak insert phù hợp
```

### 11D — boot/transition

- `currentMode="__boot__"` trong module load;
- auxiliary UI coalesce double RAF;
- desktop focus sau 2 frame;
- mobile không autofocus.

### 11E — critical/post split

30 script / 13 CSS → 18 / 9 bằng cách post-load Free/Visual/Vietnamese/Stats/A11y/Debug.

### 11F — optional runtime split

Tách Memory state khỏi behavior để đưa Listen/TTS/Memory behavior ra hậu kỳ. Critical còn khoảng 14 script / 6 CSS.

### 11G — critical code-volume split

Request count gần như giữ nguyên, nhưng `script.js` lớn không còn phải tải/parse/execute trước Easy. Critical chỉ chạy `easy-start.js` cực nhỏ; Free/Settings code chuyển hậu kỳ.

---

## 7. Wrapper chain sau post-ready

### Initial first Easy frame

Chỉ critical wrappers:

```text
script-core
→ smart-review
→ topic-level
→ startup instrumentation
→ easy-entry-transition
→ easy-start calls setMode(easy)
```

### Sau post-ready

Outer wrappers được bổ sung:

```text
visual-prompt
listen-mode / tts-local
memory-mode
vietnamese-input
mode-stats
```

Invariant:

- rời Easy dừng/ẩn Listen/Memory/Visual;
- Easy-only tools không lộ Hard/Free;
- script.js post-load không được rebuild Easy lần hai.

---

## 8. Profile/storage

`profile-stats.js` vẫn critical vì initial profile preferences phải có trước first Easy round.

Dashboard DOM chỉ dựng khi bấm 👤, nhưng file hiện vẫn chứa cả runtime + dashboard code. Đây là **ứng viên điều tra tiếp theo** nếu 11G vẫn chưa đạt performance gate: tách profile runtime nhỏ khỏi dashboard/backup UI lớn.

Post-load:

- `mode-stats.js` hydrate Hard/Free stats;
- `storage-health.js` compare-before-write;
- accessibility gắn modal semantics.

---

## 9. Visual / Listen / TTS

Visual post-load:

```text
semantic exact/contains → local SVG → pinned CDN → emoji
```

Listen/TTS post-load:

```text
local Google MP3 → Web Speech vi-* → warning
```

Voice enumeration chỉ khi bật Listen/mở Settings.

---

## 10. Diagnostics

Critical:

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

Sau post ready:

```js
printGoChuPerformanceHealth()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuStorageHealth()
getGoChuAssetHealth()
```

Markers/measures:

```text
setMode:easy
showText:easy
easy:buildFilteredRound
easy:entrySyncGate
easy:auxUiFlush
easy:bootstrap
easy:coreStarted
postStartup:start
postStartup:ready
```

---

## 11. CI/static guards

Workflow kiểm tra:

1. Python compile.
2. `node --check` JS root.
3. `verify_repository.py`.
4. `verify_startup_loading.py`.
5. `verify_easy_entry.py`.
6. `verify_easy_transition.py`.
7. `verify_optional_runtime.py`.
8. deploy readiness.
9. Twemoji/TTS dry-run.

CI fail nếu:

- `script.js` quay lại critical path;
- `easy-start.js` mất official Easy startup/legacy guard;
- Listen/TTS/Memory behavior quay lại critical;
- post dependency order/readiness validation mất;
- Memory state/bridge split bị phá;
- critical JS/CSS tăng ngoài budget.

---

## 12. Khi thêm feature/module

1. Xác định có cần cho first Easy frame không.
2. Không cần → post-startup.
3. Chỉ cần state → tách state nhẹ khỏi behavior/UI.
4. Không đặt file lớn chỉ vì vài dòng startup cần chạy sớm; tách bootstrap nhỏ.
5. Audit wrapper/dependency order.
6. Chạy CI + browser performance QA.
7. Cập nhật `RUNTIME_ARCHITECTURE.md` + `HANDOFF.md`.
