# HANDOFF — go-chu-ver2

## 1. Mục tiêu + quy tắc làm việc

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, cấp độ, hồ sơ riêng, thống kê và hỗ trợ tiếng Việt.

Quy tắc bắt buộc:

- Không backend/refactor lớn khi chưa cần.
- Mỗi đợt lớn: branch → PR → CI → squash merge `main`.
- **Mọi điều tra, plan, thay đổi, PR/commit và việc còn lại đều ghi vào HANDOFF này.**
- Easy-only feature không được lộ sang Hard/Free.
- UI phải ổn PC + mobile.
- Không đưa API key/credential vào browser/runtime.
- Với lỗi hiệu năng: **trace nguyên nhân trước → xác định xong tự fix luôn → không hỏi lại người dùng giữa chừng.**

---

## 2. Roadmap

- [x] Phase 0–8: baseline ver2, diff lỗi, Smart Review, visual, Listen, Memory, Topic/Level, Profiles, Vietnamese input.
- [x] Phase 9.1–9.10: QA, wrapper audit, accessibility, storage, asset fallback, offline visual framework, deploy QA, UI scope/visual accuracy, freeze diagnostics.
- [x] Phase 9.11: Easy CPU startup rewrite.
- [x] Phase 9.11B: startup network parallel + lazy audio.
- [x] Phase 9.11C: Easy filtered-pool fast-path.
- [x] Phase 9.11D: neutral boot state + Easy transition gate.
- [x] **Phase 9.11E: critical Easy path / post-startup split.**
- [ ] Browser/device performance gate trên Vercel/local thật.
- [ ] Phase 9.12: responsive UI redesign PC/mobile.
- [~] Phase 10 Google TTS: framework xong, MP3 thật chờ người dùng render.

---

## 3. PR / commit quan trọng

- Phase 1: PR #1 → `1e8450b`
- Phase 2: PR #2 → `11b5689`
- Phase 3: PR #3 → `e0fe068`
- Phase 4: PR #4 → `6cc6b00`
- UX/voice hotfix: PR #5 → `26cdb63`
- Phase 5: PR #6 → `daecd42`
- Phase 6: PR #7 → `18552e0`
- Phase 7: PR #8 → `e281c40`
- Phase 8: PR #9 → `10d756e`
- Phase 9.1: PR #10 → `36d16dc`
- Phase 9.2: PR #12 → `7d598f2`
- Phase 9.3: PR #13 → `94bb3ef`
- Phase 9.4: PR #14 → `d750722`
- Phase 9.5: PR #15 → `0e0ce0e`
- Phase 10 framework: PR #17 → `b7e52fd`
- Phase 9.6: PR #19 → `58f295d`
- Phase 9.7: PR #20 → `24f6673`
- Phase 9.8: PR #22 → `14d04bd`
- Phase 9.9: PR #24 → `ed76406`
- Phase 9.10: PR #26 → `25d2727`
- Performance/UI plan: PR #28 → `1cd65bc`
- Easy CPU rewrite: PR #29 → `b27de10`
- Startup network/lazy audio: PR #31 → `3b13a7a`
- Handoff startup: PR #32 → `2f28b49`
- Easy filtered fast-path: PR #33 → `b6876c0`
- Handoff 11C: PR #34 → `0c86aba`
- Easy boot/transition: PR #35 → `3d63d67`
- Handoff 11D: PR #36 → `9128040`
- **Critical/post-startup split 11E: PR #37 → `0d5afff`**

Tooling cleanup: branch `noop` và các file tạm `EASY_ENTRY_FIX.tmp`, `noop.tmp`, `TEMP_SHOULD_NOT_EXIST.tmp` từng tạo nhầm nhưng đã xóa; không nằm trong tree release.

---

## 4. Mode scope invariant

Easy-only:

```text
Topic/Level
Smart Review
Visual
Listen/TTS
Memory
adaptive promptStats
```

Hard chỉ dùng prompt Hard + `modeStats.hard`. Free chỉ dùng Free flow + `modeStats.free`. Hard/Free không được chạy UI/adaptive Easy.

---

## 5. Chuỗi điều tra hiệu năng Easy

### 11 — CPU/pool

Root cause cũ: topic/effective-level scan/filter lặp gần O(n²). Đã cache unique prompts, topic normalize/match, word count, topic pool, level pool.

### 11B — network/audio

Root cause cũ: CSS `@import` waterfall, nhiều classic JS, audio preload sớm. Đã direct CSS/defer JS và `audio-lazy-bootstrap.js` để audio chỉ gắn src lúc thật sự play.

### 11C — full-library shuffle

Root cause:

```text
toàn easyWords → shuffle → weak insert → mới filter topic/level
```

Fix:

```text
getLevelPool(topic, effectiveLevel) cached
→ shuffle đúng pool
→ insert weak phù hợp
```

Timing: `easy:buildFilteredRound`.

### 11D — phantom init + duplicate UI + mobile focus

Root cause:

1. `currentMode="easy"` tồn tại trước `script.js -> setMode("easy")` → module Easy-only tự init một lượt sớm.
2. `showText()` update UI rồi wrapper `setMode` update thêm lượt nữa.
3. `input.focus()` giữa critical layout mở mobile keyboard/resize quá sớm.

Fix:

- `easy-boot-state.js` → `currentMode="__boot__"` trong lúc load module.
- `easy-entry-transition.js` coalesce auxiliary UI bằng double RAF.
- desktop focus sau 2 frame; mobile không autofocus.

Diagnostics:

```js
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
```

Measures: `easy:entrySyncGate`, `easy:auxUiFlush`.

### 11E — critical execution path quá dài

Điều tra trực tiếp `index.html` sau 11D cho thấy trước fix:

```text
30 external script tag
13 blocking stylesheet
script.js khoảng vị trí #23
```

`defer` chỉ song song download nhưng vẫn giữ execution order. Trước `script.js` vẫn có Free data, visual/Twemoji, Vietnamese UI/dashboard không cần cho first usable Easy frame.

=> HTML có thể đã hiện nhưng Easy vẫn phải chờ resource không liên quan.

---

## 6. Phase 9.11E — đã merge PR #37 → `0d5afff`

### Critical path mới

`index.html` first-start chỉ còn **18 script tag**:

```text
startup-performance

data-easy
tts-manifest
topic-data
audio-lazy-bootstrap
script-core
easy-boot-state
smart-review
listen-mode
ux-hotfix
tts-local
memory-mode
topic-level
profile-stats
startup-runtime-instrument
easy-entry-transition
script
post-startup-loader
```

`script.js`/`setMode("easy")` không còn chờ Free/visual/Vietnamese-dashboard/stats/debug modules.

Critical CSS giảm **13 → 9**. Optional CSS visual/Vietnamese/accessibility/asset chuyển post-load.

### `post-startup-loader.js`

Luồng:

```text
script.js → setMode(easy)
→ RAF #1
→ browser có first Easy paint
→ RAF #2
→ load feature hậu kỳ
```

13 post scripts:

```text
data-poems
visual-data
twemoji-local-manifest
visual-prompt
vietnamese-input
vietnamese-dashboard
stability-fixes
mode-stats
storage-health
asset-reliability
accessibility
performance-health
debug-smoke
```

Dynamic scripts dùng `async=false` để giữ dependency execution order.

Trong warm-up:

- Easy usable ngay.
- Hard + Free tạm disabled/`aria-busy=true` để tránh vào mode khi `mode-stats`/`data-poems` chưa sẵn sàng.
- Khi post modules ready, Hard/Free tự mở lại.

Visual post-load tự hydrate prompt Easy hiện tại nên hình chỉ đến sau prompt/input một nhịp.

Diagnostics:

```js
getGoChuPostStartupHealth()
GO_CHU_POST_STARTUP_READY
```

Marks:

```text
postStartup:start
postStartup:ready
```

CI PR #37 **PASS toàn bộ** trước squash merge.

Guards đã cập nhật:

```text
tools/verify_repository.py
tools/verify_startup_loading.py
PERFORMANCE_QA.md
```

CI fail nếu critical scripts tăng >20, optional modules/CSS quay lại first path, mất double RAF/ordered dynamic scripts/readiness guard.

---

## 7. Diagnostics ưu tiên

Ngay khi vào Easy:

```js
printGoChuStartupPerformance()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau `GO_CHU_POST_STARTUP_READY === true`:

```js
printGoChuPerformanceHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
```

Stage cần nhìn:

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

## 8. Phase 9.12 UI redesign plan

Chỉ bắt đầu khi Easy performance gate ổn.

PC:

```text
header compact
Title + Mode
Prompt/visual
1 toolbar: Topic | Level | Nghe | Nhớ | Ôn
Input
Next
feedback fixed-height
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

Không auto-open keyboard khi vừa vào Easy. Touch target >=48px. Memory details/Replay chỉ hiện khi feature active.

QA: `360×640`, `390×844`, `430×932`, `768×1024`, `1366×768`, `1440×900`, `1920×1080`, zoom 125/150%.

---

## 9. Google TTS / Visual

TTS Easy-only:

```text
local Google MP3 → Web Speech vi-* → warning
```

Default renderer: `vi-VN-Chirp3-HD-Aoede`, rate `0.82`. MP3 thật vẫn chờ user render.

Visual:

```text
semantic exact/contains → local Twemoji → pinned CDN → emoji fallback
```

---

## 10. Việc tiếp theo cho phiên sau

1. Main runtime hiện tại cần có **`0d5afff`** + commit HANDOFF bookkeeping sau PR #37.
2. Test Vercel/local 11E với diagnostics mục 7.
3. Xác nhận Easy usable trước `postStartup:start`; sau đó post loader `ready=true`, `failedScripts=[]`.
4. Nếu Easy vẫn chậm: tiếp tục trace **critical core còn lại** (đặc biệt Listen/TTS/Memory/Profile dependency) → điều tra xong tự fix, không hỏi lại.
5. Nếu Easy ổn: bắt đầu Phase 9.12 responsive UI redesign.
6. Sau redesign chạy full PC/mobile QA.
7. Sau cùng hoàn thiện Google TTS binary/Twemoji local nếu cần offline 100%.
