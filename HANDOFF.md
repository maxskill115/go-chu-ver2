# HANDOFF — go-chu-ver2

## 1. Mục tiêu

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, cấp độ, hồ sơ riêng, thống kê và hỗ trợ tiếng Việt.

### Quy tắc làm việc bắt buộc

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi đợt lớn: branch riêng → PR → CI → squash merge `main`.
- **Mọi thay đổi, plan, điều tra nguyên nhân, PR/commit và việc còn lại đều phải ghi vào HANDOFF này.**
- Easy-only feature không được lộ sang Hard/Free.
- UI phải dùng tốt PC + mobile.
- Không đưa API key/credential vào browser/runtime.
- Với lỗi hiệu năng: **điều tra/trace nguyên nhân trước → xác định xong thì tự fix luôn → không hỏi lại người dùng giữa chừng.**
- Không tối ưu cảm tính bằng CSS nếu chưa xác định hot-path/runtime/network/layout liên quan.

---

## 2. Roadmap hiện tại

### Hoàn tất

- [x] Phase 0 — Khởi tạo ver2.
- [x] Phase 1 — Levenshtein diff + hotfix UI bỏ ô đỏ/SP.
- [x] Phase 2 — Smart random + prompt yếu + Ôn lại.
- [x] Phase 3 — Ảnh + chữ + emoji fallback.
- [x] Phase 4 — Nghe rồi gõ, voice Việt.
- [x] Phase 5 — Nhớ rồi gõ.
- [x] Phase 6 — Chủ đề + cấp độ.
- [x] Phase 7 — Hồ sơ bé + dashboard + backup.
- [x] Phase 8 — Progress theo từ + lỗi dấu + Telex/VNI.

### Phase 9 — Stabilization / performance / responsive

- [x] Đợt 1 — smoke test + QA checklist.
- [x] Đợt 2 — wrapper audit + Hard/Free stats.
- [x] Đợt 3 — accessibility + keyboard.
- [x] Đợt 4 — storage audit.
- [x] Đợt 5 — asset reliability + fallback.
- [x] Đợt 6 — offline visual framework + CI/static verify.
- [x] Đợt 7 — deploy QA prep + readiness report.
- [x] Đợt 8 — UI scope + visual accuracy.
- [x] Đợt 9 — visual mapping round 2.
- [x] Đợt 10 — freeze/stability audit + runtime diagnostics.
- [x] Đợt 11 — Easy CPU startup rewrite.
- [x] Đợt 11B — startup network parallel + lazy audio.
- [x] Đợt 11C — Easy entry fast-path.
- [x] **Đợt 11D — Easy boot state + transition gate.**
- [ ] **Browser/device performance gate trên Vercel/local thật.**
- [ ] **Đợt 12 — responsive UI redesign PC/mobile.**

### Phase 10 — Pre-rendered Google TTS MP3

- [x] Runtime MP3 local-first + Web Speech fallback.
- [x] Google Cloud TTS renderer + Windows `.bat`.
- [x] Manifest deterministic + incremental/resume.
- [ ] Người dùng render MP3 thật.
- [ ] Commit `Audio/tts/*.mp3` + manifest đầy đủ.

---

## 3. PR / commit chính

- Phase 1: PR #1 → `1e8450b`
- Phase 2: PR #2 → `11b5689`
- Phase 3: PR #3 → `e0fe068`
- Phase 4: PR #4 → `6cc6b00`
- Hotfix UX/voice: PR #5 → `26cdb63`
- Phase 5: PR #6 → `daecd42`
- Phase 6: PR #7 → `18552e0`
- Phase 7: PR #8 → `e281c40`
- Phase 8: PR #9 → `10d756e`
- Phase 9 đợt 1: PR #10 → `36d16dc`
- Phase 9 đợt 2: PR #12 → `7d598f2`
- Phase 9 đợt 3: PR #13 → `94bb3ef`
- Phase 9 đợt 4: PR #14 → `d750722`
- Phase 9 đợt 5: PR #15 → `0e0ce0e`
- Phase 10 framework: PR #17 → `b7e52fd`
- Phase 9 đợt 6: PR #19 → `58f295d`
- Phase 9 đợt 7: PR #20 → `24f6673`
- Phase 9 đợt 8: PR #22 → `14d04bd`
- Phase 9 đợt 9: PR #24 → `ed76406`
- Phase 9 đợt 10: PR #26 → `25d2727`
- Performance + responsive plan: PR #28 → `1cd65bc`
- Easy CPU startup rewrite: PR #29 → `b27de10`
- Startup network/lazy audio: PR #31 → `3b13a7a`
- Handoff startup network: PR #32 → `2f28b49`
- Easy entry fast-path: PR #33 → `b6876c0`
- Handoff Easy fast-path: PR #34 → `0c86aba`
- **Easy boot/transition 11D: PR #35 → `3d63d67`**

### Tooling cleanup đã biết

- Branch rỗng `noop` từng tạo nhầm; không ảnh hưởng `main`.
- `EASY_ENTRY_FIX.tmp`, `noop.tmp`, `TEMP_SHOULD_NOT_EXIST.tmp` từng tạo nhầm trong quá trình chuyển tool và đã xóa ngay; không còn trong tree release.
- Các commit tạo/xóa file tạm chỉ là lịch sử tooling, không thuộc runtime feature.

---

## 4. Mode scope invariant

### Easy-only

Chỉ Easy được chạy/hiển thị:

- Topic / Level.
- Smart Review / Ôn lại.
- Visual prompt.
- Listen / Nghe rồi gõ.
- Memory / Nhớ rồi gõ.
- Adaptive `promptStats`.

### Hard

- Prompt nâng cao + input/check + `modeStats.hard`.
- Không Listen / Memory / Topic-Level / Review / Visual.

### Free

- Setup/custom text/typing Free + `modeStats.free`.
- Không control Easy.

---

## 5. Lịch sử điều tra hiệu năng Easy

### 5.1 Freeze/stability — PR #26

Đã bỏ:

- auto fullscreen trên `click/keydown/wheel`;
- Free resize/input chạy dồn;
- Free dropdown render lại hàng chục thumbnail mỗi lần mở.

Diagnostics:

```js
printGoChuPerformanceHealth()
```

### 5.2 Easy CPU startup rewrite — PR #29

Root cause cũ: `buildSmartEasyRound()` từng tính/filter topic + effective level lặp quá nhiều trên toàn kho Easy, gần O(n²).

Cache chính:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
goChuTopicPoolCache
goChuLevelPoolCache
```

Đã lazy/defer khỏi first paint:

- visual semantic matching + image request;
- Web Speech voice enumeration;
- profile dashboard DOM/statistics;
- `../IMG` asset probe.

### 5.3 Startup network + lazy audio — PR #31

Audit phát hiện:

- `styles.css` từng là chuỗi 13 `@import`;
- khoảng 27 JS classic script;
- 2 MP3 nền + 2 WAV bị tạo/preload quá sớm.

Fix:

- production `index.html` link trực tiếp stylesheet trong `<head>`;
- JS dùng `defer` để tải song song nhưng giữ execute order;
- `audio-lazy-bootstrap.js` nạp trước `script-core.js`;
- audio chỉ gắn `src` khi chính nguồn đó thật sự `play()` sau user activation.

Debug:

```js
getGoChuAudioBootstrapHealth()
```

CI:

```text
tools/verify_startup_loading.py
```

### 5.4 Easy entry fast-path — PR #33

Audit đường:

```text
setMode("easy")
→ buildSmartEasyRound()
→ topic/level filter
→ showText + UI wrappers
```

Root cause còn lại lúc đó:

```text
Toàn bộ easyWords
→ shuffle toàn bộ
→ chèn weak prompt
→ cuối cùng mới filter Chủ đề/Cấp độ
```

Fix 11C:

```text
getEffectiveLearningLevel() một lần
→ getLevelPool(selectedTopicId, effectiveLevel) từ cache
→ shuffle đúng pool đã lọc
→ chèn weak prompt phù hợp topic + level
→ show prompt
```

Weak prompt cache:

```js
goChuPromptStatsRevision
goChuWeakPromptCache
goChuWeakPromptCacheStatsRef
goChuWeakPromptCacheRevision
```

Timing:

```text
easy:buildFilteredRound
```

CI:

```text
tools/verify_easy_entry.py
```

### 5.5 Điều tra sâu 11D

Sau 11C tiếp tục trace toàn bộ:

```text
script-core init
→ module Easy-only load
→ profile route
→ setMode("easy")
→ showText wrapper chain
→ DOM/layout/focus
```

#### Root cause A — phantom Easy initialization

Baseline `script-core.js` khởi tạo:

```js
let currentMode = "easy";
```

trong khi `script.js` cuối chuỗi lại gọi:

```js
setMode("easy");
```

Các module Smart Review / Listen / TTS / Memory / Topic / Vietnamese UI được nạp ở giữa và đã nhìn thấy `currentMode === "easy"`.

=> Một số workload Easy chạy **trước activation thật**, rồi chạy thêm lần nữa khi `setMode("easy")`.

#### Root cause B — duplicate UI update khi setMode unwind

Base `setMode("easy")` gọi `showText()`.

`showText()` chain đã update/schedule:

- Smart Review;
- Visual;
- Listen;
- Memory;
- Topic/Level;
- Vietnamese progress/guide.

Sau đó các wrapper `setMode` tương ứng lại update/schedule một lượt nữa khi unwind.

=> nhiều DOM/class/text update trùng trong cùng transition.

#### Root cause C — autofocus giữa critical layout

Base `showText()` gọi `input.focus()` trước khi toàn bộ Easy UI hoàn tất.

Trên mobile:

```text
focus input
→ bật keyboard
→ resize visual viewport
→ media-query/layout chạy
→ trong lúc Easy controls vẫn đang đổi
```

=> gây jank/độ trễ mạnh và cảm giác tab bị treo.

---

## 6. Phase 9 đợt 11D — đã merge PR #35 → `3d63d67`

### `easy-boot-state.js`

Load order:

```text
script-core.js
→ easy-boot-state.js
→ smart-review.js / các module Easy-only
```

Tạm chuyển:

```js
currentMode = "__boot__";
```

=> module Easy-only chỉ dựng shell nhẹ trong lúc load; `script.js` sau đó mới gọi `setMode("easy")` một lần để activate thật.

Debug:

```js
getGoChuBootState()
```

### `easy-entry-transition.js`

Load order:

```text
startup-runtime-instrument.js
→ easy-entry-transition.js
→ script.js
```

Gate bọc final `setMode` và coalesce các update lúc vào Easy:

```text
scheduleSmartReviewBarUpdate
scheduleTopicLevelBarUpdate
schedulePromptVisual
updateListenModeBar
updateMemoryModeBar
renderPromptWordProgress
updateVietnameseInputGuide
```

Core path vẫn đồng bộ:

```text
set mode
build filtered round
show prompt
clear input/result
return
```

UI phụ flush sau **double requestAnimationFrame**, cho browser một paint của prompt/input trước.

Visual chạy cuối; bản thân visual còn rAF thêm một nhịp nên image/network không chen vào core transition.

### Autofocus policy 11D

Trong lúc `setMode("easy")`:

- input tạm `disabled` để base `input.focus()` là no-op;
- sau core transition input được khôi phục;
- desktop: focus sau 2 frame với `preventScroll`;
- mobile/coarse pointer: **không tự focus**, bé chạm input rồi keyboard mới mở.

### Diagnostics mới

```js
getGoChuEasyEntryTransitionHealth()
```

Có:

```text
easyEntries
bootFramesCancelled
deferredCalls
auxFlushes
lastSyncEntryMs
lastAuxFlushMs
mobileAutofocusSkipped
desktopAutofocusDeferred
pending UI jobs
```

Startup measures:

```text
easy:entrySyncGate
easy:auxUiFlush
```

### CI/QA 11D

- `tools/verify_easy_transition.py`
- `PERFORMANCE_QA.md` có boot/transition/mobile autofocus test.
- PR #35 CI **PASS toàn bộ** trước khi squash merge.

---

## 7. Runtime diagnostics hiện có

Khi điều tra Easy ưu tiên lấy cùng lúc:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Các stage quan trọng:

```text
setMode:easy
showText:easy
easy:buildFilteredRound
easy:entrySyncGate
easy:auxUiFlush
```

Các health khác:

```js
getGoChuTopicCacheHealth()
getGoChuAudioBootstrapHealth()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
```

---

## 8. Responsive UI redesign — Phase 9 đợt 12

**Chưa bắt đầu cho tới khi kiểm tra 11D trên browser/device thật.**

### PC >= 1024px

Mục tiêu:

```text
Menu/Profile/Timer/Settings
Title + Mode
Prompt / visual
1 toolbar compact: Topic | Level | Nghe | Nhớ | Ôn
Input
Tiếp theo
Feedback fixed-height
```

### Mobile <= 767px

Mục tiêu:

```text
☰  Timer  👤 ⚙
Mode compact
Prompt
visual nhỏ
Input
Tiếp theo
2 hàng tool compact
Feedback
```

- title lớn thu gọn khi học;
- input ưu tiên viewport + keyboard;
- touch target >= 48px;
- Memory Mức/Thời gian chỉ hiện khi active;
- Nghe lại chỉ hiện khi Listen active;
- không auto-open keyboard khi vừa vào Easy.

### Dashboard

- Desktop: summary cards + tabs.
- Mobile: full-screen sheet + tab/accordion.

### QA kích thước

```text
360×640
390×844
430×932
768×1024
1366×768
1440×900
1920×1080
```

thêm zoom 125%/150%.

---

## 9. Google TTS

Easy-only runtime:

```text
1. MP3 Google TTS local
2. Web Speech vi-*
3. báo thiếu audio
```

Default renderer:

```text
vi-VN-Chirp3-HD-Aoede
rate 0.82
MP3
```

MP3 thật chưa render vì chờ Google Cloud account người dùng.

---

## 10. Visual pipeline

Twemoji pinned `jdecked/twemoji@17.0.3`.

```text
semantic exact/contains
→ local SVG nếu có
→ CDN pinned
→ emoji fallback
```

Không match semantic → không hiện hình.

---

## 11. Thứ tự tiếp theo cho phiên làm việc sau

1. Pull/đợi deploy commit runtime **`3d63d67`** và handoff bookkeeping mới.
2. Test Vercel/local mode Easy với:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

3. Xác nhận `currentMode=easy`, `isBooting=false`, pending jobs về false sau vài frame.
4. Mobile: vào Easy **không tự bật keyboard**; tap input mới mở.
5. Nếu Easy vẫn chậm: đọc stage timing, **điều tra phần còn lại rồi fix luôn**, không hỏi lại giữa chừng.
6. Chỉ khi Easy đạt performance gate mới bắt đầu Phase 9 đợt 12 redesign UI PC/mobile.
7. Sau redesign chạy full PC/mobile QA.
8. Sau cùng hoàn thiện Google TTS binary/Twemoji local nếu muốn offline 100%.
