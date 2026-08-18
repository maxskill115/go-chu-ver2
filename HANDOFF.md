# HANDOFF — go-chu-ver2

## 1. Mục tiêu + quy tắc

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có Topic/Level, profile, thống kê và hỗ trợ tiếng Việt.

Quy tắc bắt buộc:

- Không backend/refactor lớn khi chưa cần.
- Mỗi đợt lớn: branch → PR → CI → squash merge `main`.
- **Mọi điều tra, plan, thay đổi, PR/commit và việc còn lại đều ghi vào HANDOFF này.**
- Easy-only feature không được lộ Hard/Free.
- UI phải ổn PC + mobile.
- Không đưa API key/credential vào browser/runtime.
- Với hiệu năng: **trace nguyên nhân trước → xác định xong tự fix luôn → không hỏi lại người dùng giữa chừng.**

---

## 2. Roadmap

- [x] Phase 0–8: baseline ver2, diff lỗi, Smart Review, visual, Listen, Memory, Topic/Level, Profiles, Vietnamese input.
- [x] Phase 9.1–9.10: QA, wrapper audit, accessibility, storage, asset fallback, offline visual, deploy QA, UI scope/visual accuracy, freeze diagnostics.
- [x] Phase 9.11: Easy CPU startup rewrite.
- [x] Phase 9.11B: startup network + lazy audio.
- [x] Phase 9.11C: filtered-pool fast-path.
- [x] Phase 9.11D: neutral boot + transition gate.
- [x] Phase 9.11E: critical/post-startup split.
- [x] **Phase 9.11F: optional Listen/TTS/Memory runtime split.**
- [ ] Browser/device performance gate.
- [ ] Phase 9.12 responsive UI redesign PC/mobile.
- [~] Phase 10 Google TTS framework xong; MP3 thật chờ user render.

---

## 3. PR / commit chính

- PR #1 → `1e8450b`
- PR #2 → `11b5689`
- PR #3 → `e0fe068`
- PR #4 → `6cc6b00`
- PR #5 → `26cdb63`
- PR #6 → `daecd42`
- PR #7 → `18552e0`
- PR #8 → `e281c40`
- PR #9 → `10d756e`
- PR #10 → `36d16dc`
- PR #12 → `7d598f2`
- PR #13 → `94bb3ef`
- PR #14 → `d750722`
- PR #15 → `0e0ce0e`
- Phase 10 framework PR #17 → `b7e52fd`
- PR #19 → `58f295d`
- PR #20 → `24f6673`
- PR #22 → `14d04bd`
- PR #24 → `ed76406`
- PR #26 → `25d2727`
- Performance/UI plan PR #28 → `1cd65bc`
- Easy CPU PR #29 → `b27de10`
- Startup network PR #31 → `3b13a7a`
- Handoff PR #32 → `2f28b49`
- Easy filtered round PR #33 → `b6876c0`
- Handoff PR #34 → `0c86aba`
- Easy boot/transition PR #35 → `3d63d67`
- Handoff PR #36 → `9128040`
- Critical/post split PR #37 → `0d5afff`
- Handoff 11E PR #38 → `a2c944f`
- **Optional Listen/TTS/Memory split PR #39 → `c6205f3`**

Tooling cleanup: branch `noop` và các file tạm `EASY_ENTRY_FIX.tmp`, `noop.tmp`, `TEMP_SHOULD_NOT_EXIST.tmp` đã xóa; không nằm trong release tree.

---

## 4. Mode invariant

Easy-only:

```text
Topic/Level
Smart Review
Visual
Listen/TTS
Memory
adaptive promptStats
```

Hard: prompt Hard + `modeStats.hard`.
Free: Free flow + `modeStats.free`.
Hard/Free không chạy adaptive/UI Easy.

---

## 5. Chuỗi điều tra hiệu năng

### 11 — CPU cache

Đã loại near-O(n²) topic/effective-level scan bằng cache unique prompts, normalized topic, membership, word count, topic/level pool.

### 11B — network/audio

Đã bỏ CSS `@import` waterfall, dùng defer và lazy audio src.

### 11C — filtered round

Root cause cũ:

```text
toàn easyWords → shuffle → weak insert → mới filter topic/level
```

Fix:

```text
getLevelPool(topic, level) → shuffle đúng pool → weak insert phù hợp
```

### 11D — phantom init / duplicate UI / mobile focus

Fix:

- `easy-boot-state.js` dùng `currentMode="__boot__"` lúc module load;
- `easy-entry-transition.js` coalesce auxiliary UI bằng double RAF;
- desktop focus sau 2 frame;
- mobile không autofocus.

### 11E — critical path dài

Trước fix:

```text
30 script
13 blocking CSS
script.js khoảng #23
```

PR #37 giảm thành:

```text
18 critical script
9 blocking CSS
13 post scripts
4 post CSS
```

Free/Visual/Vietnamese/Stats/A11y/Debug chuyển post-startup.

### 11F — Listen/TTS/Memory dependency coupling

Sau 11E vẫn còn trong critical path:

```text
tts-manifest
listen-mode
ux-hotfix
tts-local
memory-mode
```

Mặc định Listen/Memory tắt, nhưng chưa thể dời vì:

- profile cần `memoryWordCount/memorySeconds`;
- topic-level cần `getPromptWordCount/buildMemoryRound` binding;
- memory behavior cần `setListenMode`.

Kết luận: first Easy frame chỉ cần **Memory state/preference**, không cần timer/UI/Listen/TTS behavior.

---

## 6. Phase 9.11F — đã merge PR #39 → `c6205f3`

### 6.1 `memory-state.js` — critical nhẹ

Chứa:

```text
Memory keys
memoryModeActive
memoryWordCount
memorySeconds
load/save preference
getPromptWordCount
buildMemoryRound stub
```

Không DOM/timer/Listen bridge.

Debug:

```js
getGoChuMemoryStateHealth()
```

### 6.2 `memory-mode.js` — post behavior

Không redeclare state. Sau post-load:

- thay stub bằng actual `buildMemoryRound`;
- tạo timer/UI/wrappers;
- giữ logic đúng/sai cũ;
- giữ Listen/Memory mutual exclusion;
- set `GO_CHU_MEMORY_BEHAVIOR_READY=true`.

### 6.3 `memory-topic-bridge.js`

Sau actual Memory behavior, bridge gắn lại topic filter + anti-repeat.

Ready:

```js
GO_CHU_MEMORY_TOPIC_BRIDGE_READY
```

### 6.4 Critical path sau 11F

Khoảng **14 external script tag**:

```text
startup-performance
data-easy
topic-data
memory-state
audio-lazy-bootstrap
script-core
easy-boot-state
smart-review
topic-level
profile-stats
startup-runtime-instrument
easy-entry-transition
script
post-startup-loader
```

Blocking CSS còn **6**:

```text
styles-1
styles-2
smart-review
topic-level
profile-stats
ui-scope-fixes
```

### 6.5 Post runtime

Post CSS = 7:

```text
listen
ux-hotfix
memory
visual
vietnamese
accessibility
asset
```

Post scripts = 19. Dependency quan trọng:

```text
tts-manifest
→ listen-mode
→ ux-hotfix
→ tts-local
→ memory-mode
→ memory-topic-bridge
→ vietnamese-input
```

### 6.6 Runtime validation

`post-startup-loader.js` không chỉ tin HTTP load event. Trước khi mở Hard/Free nó kiểm tra runtime thật:

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

Chỉ khi tất cả true:

```js
GO_CHU_POST_STARTUP_READY = true
```

Nếu extension lỗi, Easy vẫn usable nhưng Hard/Free giữ khóa.

Diagnostics:

```js
getGoChuPostStartupHealth()
getGoChuMemoryStateHealth()
```

### 6.7 CI/QA

Mới:

```text
tools/verify_optional_runtime.py
```

Cập nhật:

```text
tools/verify_repository.py
tools/verify_startup_loading.py
.github/workflows/verify.yml
PERFORMANCE_QA.md
RUNTIME_ARCHITECTURE.md
```

PR #39 CI **PASS toàn bộ** trước squash merge.

---

## 7. Diagnostics ưu tiên

First Easy:

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

Stage:

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

## 8. Phase 9.12 UI redesign

Chỉ bắt đầu khi performance gate ổn.

PC:

```text
compact header
Title + Mode
Prompt/visual
1 toolbar: Topic | Level | Nghe | Nhớ | Ôn
Input
Next
fixed-height feedback
```

Mobile:

```text
☰ Timer 👤 ⚙
Mode compact
Prompt
visual nhỏ
Input
Next
2 hàng tool compact
feedback
```

Không auto-open keyboard. Touch target >=48px. Dashboard desktop dùng tabs; mobile full-screen sheet/tab/accordion.

QA: `360×640`, `390×844`, `430×932`, `768×1024`, `1366×768`, `1440×900`, `1920×1080`, zoom 125/150%.

---

## 9. TTS / Visual

TTS Easy-only:

```text
local Google MP3 → Web Speech vi-* → warning
```

Default renderer: `vi-VN-Chirp3-HD-Aoede`, rate `0.82`. MP3 thật chờ user render.

Visual:

```text
semantic exact/contains → local Twemoji → pinned CDN → emoji fallback
```

---

## 10. Việc tiếp theo cho phiên sau

1. Main runtime phải có **`c6205f3`** + commit HANDOFF bookkeeping sau PR #39.
2. Test local/Vercel:
   - critical khoảng 14 scripts / 6 CSS;
   - Easy usable trước post runtime;
   - `getGoChuPostStartupHealth().runtimeValidated === true` sau warm-up;
   - `memoryBehaviorReady === true`, `memoryTopicBridgeReady === true`.
3. Test Listen/TTS/Memory sau post ready, đặc biệt Memory topic filter + profile preferences.
4. Nếu Easy vẫn chậm: tiếp tục trace **critical core còn lại** rồi tự fix, không hỏi lại.
5. Nếu Easy ổn: bắt đầu Phase 9.12 responsive UI redesign.
