# Runtime architecture — go-chu-ver2

Tài liệu này khóa **critical load order, post-startup dependency order, wrapper chain và invariant hiệu năng**.

## 1. Nguyên tắc

- Không đổi thứ tự script nếu chưa audit dependency/wrapper.
- Easy first usable frame không được chờ Free/Visual/Listen/TTS/Memory behavior/Stats/A11y/Debug.
- Hard/Free không ghi vào `promptStats` adaptive Easy.
- Wrapper phải gọi base đúng một lần trừ replacement đã ghi rõ.
- Không thêm synchronous scan/network/storage/dashboard vào first Easy frame.
- Google credential/API key không ở browser/runtime.

---

## 2. Critical load order — Phase 9.11F

Production `index.html` chỉ giữ khoảng **14 external script tag** ở critical path:

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
13. `script.js`
14. `post-startup-loader.js`

`script.js` cuối startup core gọi:

```js
startStudyTimer();
setMode("easy");
```

Critical CSS chỉ giữ:

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

`post-startup-loader.js` chờ double RAF để browser có first Easy paint, sau đó nạp classic scripts với `async=false` để giữ thứ tự:

1. `data-poems.js`
2. `tts-manifest.js`
3. `visual-data.js`
4. `twemoji-local-manifest.js`
5. `visual-prompt.js`
6. `listen-mode.js`
7. `ux-hotfix.js`
8. `tts-local.js`
9. `memory-mode.js`
10. `memory-topic-bridge.js`
11. `vietnamese-input.js`
12. `vietnamese-dashboard.js`
13. `stability-fixes.js`
14. `mode-stats.js`
15. `storage-health.js`
16. `asset-reliability.js`
17. `accessibility.js`
18. `performance-health.js`
19. `debug-smoke.js`

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

Hard + Free bị disabled/`aria-busy=true` trong post warm-up. Easy vẫn usable.

Post loader chỉ mở mode phụ khi **network load + runtime validation** đều đạt.

Debug:

```js
getGoChuPostStartupHealth()
GO_CHU_POST_STARTUP_READY
```

---

## 4. Memory state/behavior split — 11F

### Critical: `memory-state.js`

Chỉ chứa state/preference mà Topic/Profile cần:

```text
GO_CHU_MEMORY_WORDS_KEY
GO_CHU_MEMORY_SECONDS_KEY
memoryModeActive
memoryWordCount
memorySeconds
loadMemoryNumber/saveMemoryNumber
getPromptWordCount
buildMemoryRound stub
```

Không timer, không DOM, không Listen bridge.

Debug:

```js
getGoChuMemoryStateHealth()
```

### Post: `memory-mode.js`

Sau first paint mới nạp:

- timer/countdown;
- Memory controls;
- actual `buildMemoryRound`;
- `setMemoryMode`;
- wrappers `showText/setMode/checkNext`;
- Listen/Memory exclusion.

Nó **không được redeclare** state từ `memory-state.js`.

Khi behavior sẵn sàng:

```js
GO_CHU_MEMORY_BEHAVIOR_READY = true
```

### Post: `memory-topic-bridge.js`

`topic-level.js` critical cần một `buildMemoryRound` binding sớm nên dùng stub. Khi `memory-mode.js` thay stub bằng implementation thật, bridge này gắn lại filter theo `selectedTopicId`.

Ready flag:

```js
GO_CHU_MEMORY_TOPIC_BRIDGE_READY
```

---

## 5. Easy startup evolution

### 11 — CPU cache

Đã loại near-O(n²) topic/effective-level scan bằng:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
goChuTopicPoolCache
goChuLevelPoolCache
```

### 11C — filtered round first

```text
getLevelPool(topic, level)
→ shuffle đúng pool
→ weak insert phù hợp
```

Không full-library shuffle rồi filter sau.

### 11D — boot/transition

`easy-boot-state.js` dùng `currentMode="__boot__"` trong module load để tránh phantom Easy init.

`easy-entry-transition.js` coalesce auxiliary UI và dời autofocus:

- desktop focus sau 2 frame;
- mobile không autofocus.

Debug:

```js
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
```

### 11E — critical/post split

Từ 30 script / 13 CSS xuống 18 / 9 bằng cách post-load Free/Visual/Vietnamese/Stats/A11y/Debug.

### 11F — optional Listen/TTS/Memory split

Tách Memory state khỏi behavior để đẩy Listen/TTS/Memory khỏi critical path, còn khoảng 14 script / 6 CSS.

---

## 6. Wrapper chain sau post-startup ready

### `showText`

Theo thứ tự dependency tích lũy:

```text
script-core
→ smart-review
→ topic-level
→ startup-runtime-instrument/easy transition core
→ visual-prompt (post)
→ listen-mode (post)
→ memory-mode (post)
→ vietnamese-input (post)
→ mode-stats (post, Hard guard)
```

Lưu ý: post modules được gắn **sau initial `setMode("easy")`**, vì vậy initial first frame không chạy chúng. Từ prompt tiếp theo/future mode switch chúng hoạt động bình thường.

### `setMode`

Critical trước post:

```text
script-core → smart-review → topic-level → startup instrument → easy transition
```

Sau post-load thêm Visual/Listen/TTS/Memory/Vietnamese wrappers ở ngoài chain.

Invariant:

- rời Easy phải dừng/ẩn Listen/Memory/Visual;
- Easy-only tools không lộ Hard/Free.

### `checkNext`

- Smart Review implementation chính Easy/Hard.
- Memory intercept khi active.
- Mode stats ghi Hard ở post layer.

---

## 7. Visual / Listen / TTS

Visual post-load:

```text
semantic exact/contains
→ local SVG
→ pinned Twemoji CDN
→ emoji fallback
```

First prompt được hydrate bằng `schedulePromptVisual(currentPrompt)` khi visual module vừa post-load.

Listen/TTS post-load:

```text
local Google TTS MP3
→ Web Speech vi-*
→ warning
```

Voice enumeration chỉ khi thực sự bật Listen/mở Settings.

---

## 8. Profile/storage

Profile state vẫn critical để initial Topic/Level/Memory preferences đúng ngay first round.

Dashboard DOM chỉ dựng khi bấm 👤.

Post-load:

- `mode-stats.js` hydrate Hard/Free stats;
- `storage-health.js` compare-before-write;
- accessibility gắn lazy modal semantics.

Study time flush khoảng 15 giây.

---

## 9. Diagnostics

Critical:

```js
printGoChuStartupPerformance()
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
postStartup:start
postStartup:ready
```

---

## 10. CI/static guards

Workflow chạy:

1. Python compile.
2. `node --check` toàn JS root.
3. `tools/verify_repository.py`.
4. `tools/verify_startup_loading.py`.
5. `tools/verify_easy_entry.py`.
6. `tools/verify_easy_transition.py`.
7. `tools/verify_optional_runtime.py`.
8. deploy readiness.
9. Twemoji/TTS dry-run.

CI phải fail nếu:

- Listen/TTS/Memory behavior quay lại critical path;
- `memory-state.js` bị mất/redeclare trong memory-mode;
- post dependency order sai;
- Memory topic bridge mất;
- critical JS/CSS tăng lại ngoài budget;
- post runtime validation/readiness guard mất.

---

## 11. Khi thêm feature/module

1. Xác định feature có cần cho first Easy frame không.
2. Nếu không cần → mặc định post-startup.
3. Nếu chỉ cần state → tách state nhẹ khỏi behavior/UI.
4. Audit wrapper/dependency order.
5. Không thêm sync network/storage/full-pool scan vào critical path.
6. Chạy toàn CI + browser smoke/performance QA.
7. Cập nhật `RUNTIME_ARCHITECTURE.md` + `HANDOFF.md`.
