# HANDOFF — go-chu-ver2

## 1. Mục tiêu

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, cấp độ, hồ sơ riêng, thống kê và hỗ trợ tiếng Việt.

### Quy tắc bắt buộc

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi phase lớn: branch riêng → PR → CI → squash merge `main`.
- Mọi thay đổi/plan/quyết định kỹ thuật/PR/commit phải cập nhật tại đây.
- Easy-only feature không được lộ sang Hard/Free.
- UI phải dùng tốt PC + mobile.
- Không đưa API key/credential vào browser/runtime.
- Với vấn đề hiệu năng: **điều tra/trace nguyên nhân trước, sau khi xác định thì tự fix luôn, không hỏi lại người dùng giữa chừng**.
- Không tối ưu cảm tính bằng CSS nếu chưa xác định hot-path/runtime/network/layout liên quan.

---

## 2. Roadmap hiện tại

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
- [~] **Đợt 11D — Easy boot state + transition gate (đang triển khai trên `agent/easy-entry-transition-gate`).**
- [ ] Browser/device performance gate trên Vercel/local thật.
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
- **Easy boot/transition 11D: branch `agent/easy-entry-transition-gate`, PR/commit cập nhật sau CI/merge.**

### Ghi chú tooling/cleanup

- Có branch rỗng `noop` tạo nhầm trước đây; không ảnh hưởng `main`.
- `EASY_ENTRY_FIX.tmp` từng được tạo nhầm trên `main` rồi đã xóa.
- `noop.tmp` và `TEMP_SHOULD_NOT_EXIST.tmp` từng được tạo nhầm trong lúc chuyển tool ở đợt 11D; cả hai đã xóa ngay, không còn trong tree hiện tại.
- Các commit tạo/xóa file tạm chỉ là lịch sử tooling, không thuộc runtime release.

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

## 5. Performance fixes đã merge / đang làm

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

Root cause cũ: `buildSmartEasyRound()` từng tính/filter topic + effective level lặp quá nhiều trên toàn kho Easy, gần O(n²) trong một số luồng.

Cache đã thêm:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
goChuTopicPoolCache
goChuLevelPoolCache
```

Các phần phụ đã lazy/defer khỏi first paint:

- visual semantic matching + image request;
- Web Speech voice enumeration;
- profile dashboard DOM/statistics;
- `../IMG` asset probe.

### 5.3 Startup network + lazy audio — PR #31

Audit phát hiện:

- `styles.css` là chuỗi 13 `@import`;
- khoảng 27 external JS classic script;
- 2 MP3 nền + 2 WAV bị tạo/preload quá sớm.

Fix:

- production `index.html` link trực tiếp stylesheet trong `<head>`;
- JS dùng `<script src="..." defer>` để tải song song nhưng giữ execute order;
- `audio-lazy-bootstrap.js` nạp trước `script-core.js`;
- `new Audio(url)` không gắn `src` ở startup;
- chỉ audio thực sự `play()` sau user activation mới tải.

Debug:

```js
getGoChuAudioBootstrapHealth()
```

CI:

```text
tools/verify_startup_loading.py
```

### 5.4 Easy entry fast-path — PR #33 → `b6876c0`

Audit đường:

```text
setMode("easy")
→ shuffleEasyWords()
→ buildSmartEasyRound()
→ topic/level filter
→ showText + UI wrappers
```

Root cause còn lãng phí:

```text
Toàn bộ easyWords
→ shuffle toàn bộ
→ chèn weak prompt
→ cuối cùng mới filter theo Chủ đề/Cấp độ
```

Fix 11C:

```text
getEffectiveLearningLevel() một lần
→ getLevelPool(selectedTopicId, effectiveLevel) từ cache
→ shuffle đúng pool đã lọc
→ chèn weak prompt phù hợp topic + level
→ show prompt
```

Không còn build toàn library rồi filter sau.

Weak prompt cache:

```js
goChuPromptStatsRevision
goChuWeakPromptCache
goChuWeakPromptCacheStatsRef
goChuWeakPromptCacheRevision
```

Smart Review/Topic UI được coalesce bằng rAF.

Timing:

```text
easy:buildFilteredRound
```

CI:

```text
tools/verify_easy_entry.py
```

### 5.5 Điều tra 11D — duplicate Easy initialization + layout/focus race

Sau PR #33 user vẫn yêu cầu tiếp tục điều tra trước khi fix.

#### Phát hiện 1 — Easy bị coi là active quá sớm

`script-core.js` baseline đang có:

```js
let currentMode = "easy";
```

Nhưng `script.js` cuối chuỗi lại tiếp tục gọi:

```js
setMode("easy");
```

Trong khoảng giữa hai thời điểm này, các module nạp theo thứ tự:

```text
Smart Review
Visual
Listen/TTS
Memory
Topic/Level
Profile
Vietnamese input
```

đã đọc `currentMode === "easy"` và một số module tự dựng/update workload Easy trước lần `setMode("easy")` chính thức.

=> **Easy có một lượt “phantom initialization” trong lúc load module, rồi một lượt activation thật sau đó.**

#### Phát hiện 2 — wrapper chain update Easy lặp khi setMode unwind

Trong `setMode("easy")`, base `setMode` gọi `showText()`.

`showText()` wrapper chain đã thực hiện/schedule:

- Smart Review UI;
- Visual;
- Listen status;
- Memory status;
- Topic status;
- Vietnamese word progress/guide.

Sau khi base `setMode` trả về, các wrapper `setMode` tương ứng lại update/schedule các phần trên thêm lần nữa.

=> Không phải O(n²) nữa, nhưng vẫn có **nhiều DOM/class/text update trùng trong cùng một transition**.

#### Phát hiện 3 — autofocus xảy ra giữa critical layout

Base `showText()` gọi:

```js
input.focus();
```

ngay trước khi toàn bộ wrapper Easy hoàn tất.

Trên mobile/touch, focus có thể:

```text
mở keyboard
→ resize visual viewport
→ kích layout/media-query
→ trong lúc Easy controls vẫn đang được show/hide/update
```

=> Đây là nguồn jank/độ trễ rất đáng kể trên mobile và có thể tạo cảm giác “vào mode bị treo”.

### 5.6 Fix 11D đang triển khai

Branch:

```text
agent/easy-entry-transition-gate
```

#### `easy-boot-state.js`

Nạp:

```text
script-core.js
→ easy-boot-state.js
→ smart-review.js / các module Easy-only
```

Nó chuyển tạm:

```js
currentMode = "__boot__";
```

Mục tiêu: module Easy-only chỉ dựng shell nhẹ trong lúc load, không chạy logic Easy cho đến `script.js → setMode("easy")`.

Debug:

```js
getGoChuBootState()
```

#### `easy-entry-transition.js`

Nạp:

```text
startup-runtime-instrument.js
→ easy-entry-transition.js
→ script.js
```

Gate bọc final `setMode` và coalesce các update trong lúc vào Easy:

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
set currentMode
build filtered round
show prompt
clear input/result
return
```

UI phụ flush sau **double requestAnimationFrame** để browser có một paint cho prompt/input trước.

Visual được gọi cuối; bản thân visual lại dùng rAF nên network/image work bị đẩy thêm một frame khỏi critical path.

#### Autofocus policy 11D

Trong lúc `setMode("easy")`:

- input tạm `disabled` để base `input.focus()` trở thành no-op;
- sau core transition input được khôi phục;
- desktop: focus được defer sau 2 frame với `preventScroll`;
- mobile/coarse pointer: **không tự focus**, để bé chạm input rồi keyboard mới mở.

#### Diagnostics 11D

```js
getGoChuEasyEntryTransitionHealth()
```

Trả:

- `easyEntries`;
- `bootFramesCancelled`;
- `deferredCalls`;
- `auxFlushes`;
- `lastSyncEntryMs`;
- `lastAuxFlushMs`;
- mobile/desktop autofocus counters;
- pending UI jobs.

Startup measures mới:

```text
easy:entrySyncGate
easy:auxUiFlush
```

#### QA/CI 11D

`PERFORMANCE_QA.md` đã bổ sung test boot/transition/mobile autofocus.

CI mới:

```text
tools/verify_easy_transition.py
```

Guard:

- `script-core → easy-boot-state → smart-review`;
- `startup-runtime-instrument → easy-entry-transition → script.js`;
- boot state phải là `__boot__`;
- transition phải có double rAF;
- phải defer Easy auxiliary UI;
- mobile autofocus không được chạy vô điều kiện.

---

## 6. Runtime diagnostics hiện có

Console:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuAudioBootstrapHealth()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
```

Khi điều tra Easy, ưu tiên lấy cùng lúc:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
getGoChuEasyEntryTransitionHealth()
```

Các stage cần nhìn:

```text
setMode:easy
showText:easy
easy:buildFilteredRound
easy:entrySyncGate
easy:auxUiFlush
```

---

## 7. Responsive UI redesign — Phase 9 đợt 12

Chỉ bắt đầu khi Easy entry đã ổn định trên browser/device thật.

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

Không còn 3–4 khung tool lớn xếp dọc như UI hiện tại.

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

- title lớn thu gọn khi bắt đầu học;
- input ưu tiên viewport + bàn phím;
- touch target >= 48px;
- Memory Mức/Thời gian chỉ hiện khi active;
- Nghe lại chỉ hiện khi Listen active.

### Dashboard

Desktop: summary cards + tabs.

Mobile: full-screen sheet + tab/accordion, không dùng modal dài hàng nghìn px.

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

## 8. Google TTS

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

## 9. Visual pipeline

Twemoji pinned `jdecked/twemoji@17.0.3`.

```text
semantic exact/contains
→ local SVG nếu có
→ CDN pinned
→ emoji fallback
```

Không match semantic → không hiện hình.

---

## 10. Thứ tự tiếp theo

1. Hoàn tất 11D trên `agent/easy-entry-transition-gate`.
2. Chạy CI toàn bộ JS/Python/startup/Easy guards.
3. Nếu CI fail: sửa trên branch, không merge mù.
4. Nếu CI PASS: squash merge `main`, cập nhật PR/commit thật vào HANDOFF.
5. Test Vercel/local với `getGoChuEasyEntryTransitionHealth()` + startup report.
6. Nếu Easy ổn → bắt đầu Phase 9 đợt 12 UI redesign.
7. Nếu vẫn chậm → dùng stage timing 11D để xác định phần còn lại rồi **điều tra → fix luôn**, không hỏi lại giữa chừng.
8. Sau UI redesign chạy full PC/mobile QA.
9. Sau cùng hoàn thiện Google TTS binary/Twemoji local nếu muốn offline 100%.
