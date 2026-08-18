# Runtime architecture — go-chu-ver2

Tài liệu khóa **critical load order, post-startup dependency order, wrapper chain và invariant hiệu năng**.

## 1. Nguyên tắc

- Không đổi thứ tự script nếu chưa audit dependency/wrapper.
- Easy first usable frame không được chờ Free/Settings/Profile UI/Visual/Listen/TTS/Memory behavior/Stats/A11y/Debug.
- Hard/Free không ghi vào `promptStats` adaptive Easy.
- Wrapper gọi base đúng một lần trừ replacement đã ghi rõ.
- Không thêm sync scan/network/storage/dashboard vào first Easy frame.
- Nếu critical chỉ cần state/runtime thì tách UI/management sang post-startup.
- Google credential/API key không ở browser/runtime.

---

## 2. Critical load order — Phase 9.11H

Production `index.html` giữ khoảng **14 external script tag** ở critical path:

1. `startup-performance.js`
2. `data-easy.js`
3. `topic-data.js`
4. `memory-state.js`
5. `audio-lazy-bootstrap.js`
6. `script-core.js`
7. `easy-boot-state.js`
8. `smart-review.js`
9. `topic-level.js`
10. `profile-stats.js` — runtime/data only
11. `startup-runtime-instrument.js`
12. `easy-entry-transition.js`
13. `easy-start.js`
14. `post-startup-loader.js`

`easy-start.js` là bootstrap chính thức:

```js
startStudyTimer();
setMode("easy");
```

Critical CSS còn khoảng **5 file**:

```text
styles-1.css
styles-2.css
smart-review.css
topic-level.css
ui-scope-fixes.css
```

`profile-stats.css` không còn blocking first Easy paint.

---

## 3. Post-startup load order

`post-startup-loader.js` chờ double RAF để browser có first Easy paint.

### Bootstrap hậu kỳ

`script.js` được tải riêng đầu tiên với marker:

```js
GO_CHU_EXECUTING_POST_SCRIPT = "script.js"
```

để `easy-start.js` suppress hai dòng startup legacy cuối file mà không suppress click Easy của user.

### Feature hậu kỳ

Sau `script.js`, dynamic classic scripts dùng `async=false` để giữ dependency order:

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
profile-dashboard.js
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
profile-stats.css
vietnamese-input.css
accessibility.css
asset-reliability.css
```

Trong warm-up:

- Easy usable.
- Hard + Free + Settings disabled/`aria-busy=true`.
- Profile HUD chưa xuất hiện cho tới `profile-dashboard.js` post-load.
- Chỉ coi post runtime ready khi network load + runtime validation đều PASS.

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
GO_CHU_EASY_CORE_STARTED=true
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

Giữ Free/Settings/global UI handlers và source baseline cũ. Không nằm critical HTML.

Runtime validation yêu cầu:

```text
appUi = true
legacyEasySuppressed = true
```

---

## 5. Memory state/behavior split — 11F

### Critical: `memory-state.js`

Chỉ state/preference:

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

### Post: `memory-topic-bridge.js`

Gắn lại selected-topic filter cho actual Memory round:

```js
GO_CHU_MEMORY_TOPIC_BRIDGE_READY = true
```

---

## 6. Profile runtime/dashboard split — 11H

### Critical: `profile-stats.js`

Chỉ giữ runtime/data cần trước first Easy round:

```text
profile registry + active id
profile data normalize/load/save
legacy promptStats migration
active profile routing
Topic/Level/Memory preference routing
savePromptStats override
saveTopicLevelSetting override
saveMemoryNumber override
study timer + 15s flush
visibility/beforeunload sync
```

Không còn chứa:

```text
profile HUD button
profile modal DOM
summary/weak/topic dashboard stats
switch/add/rename/delete UI
reset/export/import backup UI
```

Flags/debug:

```js
GO_CHU_PROFILE_RUNTIME_READY = true
getGoChuProfileRuntimeHealth()
```

Ngay first Easy frame expected:

```text
ready = true
dashboardReady = false
```

### Post: `profile-dashboard.js`

Chứa toàn bộ profile HUD/dashboard/management/backup UI và set:

```js
GO_CHU_PROFILE_DASHBOARD_READY = true
```

Sau load gọi:

```js
ensureProfileHud();
updateProfileHud();
```

### Dependency order bắt buộc

```text
profile-dashboard.js
→ vietnamese-dashboard.js
→ mode-stats.js
→ accessibility.js
```

Lý do:

- `vietnamese-dashboard.js` wrap `renderProfileDashboard`;
- `mode-stats.js` wrap `renderProfileDashboard` và `applyProfileToRuntime`;
- accessibility cần profile HUD/dialog đã tồn tại hoặc có lazy observer tương ứng.

`profile-stats.css` post-load cùng dashboard.

Post runtime validation yêu cầu:

```text
profileUi = true
profileDashboardReady = true
```

---

## 7. Easy startup evolution

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

Tách Memory state khỏi behavior để đưa Listen/TTS/Memory behavior ra hậu kỳ. Critical khoảng 14 script / 6 CSS.

### 11G — critical code-volume split

`script.js` lớn không còn parse trước Easy; `easy-start.js` cực nhỏ sở hữu startup.

### 11H — profile code-volume split

`profile-stats.js` critical chỉ còn runtime/data; profile HUD/dashboard/backup và `profile-stats.css` chuyển post-startup. Critical CSS khoảng 5 file và profile JS parse volume giảm mạnh.

---

## 8. Wrapper chain

### Initial first Easy frame

Critical wrappers:

```text
script-core
→ smart-review
→ topic-level
→ startup instrumentation
→ easy-entry-transition
→ easy-start calls setMode(easy)
```

Profile runtime đã hydrate `promptStats`/preferences trước Easy activation nhưng không dựng profile UI.

### Sau post-ready

Outer wrappers bổ sung:

```text
visual-prompt
listen-mode / tts-local
memory-mode
vietnamese-input
mode-stats
```

Dashboard wrapper order:

```text
profile-dashboard base render
→ vietnamese-dashboard extension
→ mode-stats extension
```

Invariant:

- rời Easy dừng/ẩn Listen/Memory/Visual;
- Easy-only tools không lộ Hard/Free;
- script.js post-load không rebuild Easy lần hai;
- profile UI không được kéo vào critical path.

---

## 9. Profile/storage behavior

Profile migration/schema/persistence không đổi ở 11H.

`applyProfileToRuntime()` critical gọi profile HUD/dashboard **chỉ khi function đã tồn tại**, nên hoạt động an toàn cả trước và sau post-load.

`startStudyTimer()` critical chỉ render dashboard nếu overlay đã tồn tại và `renderProfileDashboard` đã load.

Post-load:

- `profile-dashboard.js` cung cấp switch/add/rename/delete/reset/export/import;
- `mode-stats.js` hydrate Hard/Free stats và wrap dashboard;
- `storage-health.js` compare-before-write;
- `accessibility.js` gắn dialog/focus semantics.

---

## 10. Visual / Listen / TTS

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

## 11. Diagnostics

Critical:

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

## 12. CI/static guards

Workflow kiểm tra:

1. Python compile.
2. `node --check` JS root.
3. `verify_repository.py`.
4. `verify_startup_loading.py`.
5. `verify_easy_entry.py`.
6. `verify_easy_transition.py`.
7. `verify_optional_runtime.py`.
8. `verify_profile_split.py`.
9. deploy readiness.
10. Twemoji/TTS dry-run.

CI fail nếu:

- `script.js` quay lại critical path;
- profile dashboard functions quay lại `profile-stats.js` critical;
- `profile-dashboard.js`/`profile-stats.css` quay lại critical;
- profile dashboard load sau Vietnamese dashboard/mode-stats;
- Listen/TTS/Memory behavior quay lại critical;
- post dependency/readiness validation mất;
- critical JS/CSS tăng ngoài budget.

---

## 13. Khi thêm feature/module

1. Xác định có cần cho first Easy frame không.
2. Không cần → post-startup.
3. Chỉ cần state/runtime → tách UI/management ra hậu kỳ.
4. Không đặt file lớn critical chỉ vì vài hàm runtime cần sớm.
5. Audit wrapper/dependency order.
6. Chạy CI + browser performance QA.
7. Cập nhật `RUNTIME_ARCHITECTURE.md` + `HANDOFF.md`.
