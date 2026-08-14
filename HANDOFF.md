# HANDOFF — go-chu-ver2

## 1. Mục tiêu

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi, hồ sơ riêng và hỗ trợ tiếng Việt.

### Quy tắc phát triển

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi phase lớn: branch riêng → PR → CI → squash merge `main`.
- Mọi plan, thay đổi, quyết định kỹ thuật, PR/commit và việc còn lại đều cập nhật tại đây.
- Không phá mode không liên quan.
- UI phải dùng tốt desktop + mobile.
- Không đưa API key/credential vào browser/runtime.

---

## 2. Roadmap

- [x] Phase 0 — Khởi tạo ver2.
- [x] Phase 1 — Levenshtein diff + hotfix UI bỏ ô đỏ/SP.
- [x] Phase 2 — Smart random + prompt yếu + Ôn lại.
- [x] Phase 3 — Ảnh + chữ + emoji fallback.
- [x] Phase 4 — Nghe rồi gõ, voice Việt.
- [x] Phase 5 — Nhớ rồi gõ.
- [x] Phase 6 — Chủ đề + cấp độ.
- [x] Phase 7 — Hồ sơ bé + dashboard + backup.
- [x] Phase 8 — Progress theo từ + lỗi dấu + Telex/VNI.

### Phase 9 — Stabilization / QA / responsive

- [x] Đợt 1 — smoke test + QA checklist.
- [x] Đợt 2 — wrapper audit + Hard/Free stats.
- [x] Đợt 3 — accessibility + keyboard.
- [x] Đợt 4 — storage audit.
- [x] Đợt 5 — asset reliability + fallback.
- [x] Đợt 6 — offline visual framework + CI/static verify.
- [x] Đợt 7 — deploy QA prep + readiness report.
- [x] Đợt 8 — UI scope + visual accuracy + regression guards.
- [x] Đợt 9 — visual mapping round 2.
- [x] Đợt 10 — freeze/stability audit + runtime diagnostics.
- [~] **Đợt 11 — Easy startup performance rewrite.**
- [ ] **Đợt 12 — Responsive UI redesign PC/mobile.**
- [ ] Vendor/commit SVG Twemoji thật nếu muốn offline visual 100%.
- [ ] Deploy QA thực tế sau khi binary hoàn tất.

### Phase 10 — Pre-rendered Google TTS MP3

- [x] Runtime MP3 local-first + Web Speech fallback.
- [x] Google Cloud TTS renderer + Windows `.bat`.
- [x] Manifest deterministic + resume/incremental.
- [x] QA/static checks/docs.
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
- Handoff Phase 10: PR #18 → `bb6303a`
- Phase 9 đợt 6: PR #19 → `58f295d`
- Phase 9 đợt 7: PR #20 → `24f6673`
- Phase 9 đợt 8: PR #22 → `14d04bd`
- Handoff đợt 8: PR #23 → `6b73ff8`
- Phase 9 đợt 9: PR #24 → `ed76406`
- Phase 9 đợt 10: PR #26 → `25d2727`
- Plan performance + responsive: PR #28 → `1cd65bc`
- Phase 9 đợt 11: branch `agent/easy-startup-performance`, PR/commit cập nhật sau merge.

Tooling scaffolding trước đợt 6:

- `tools/vendor_twemoji.py` → `c35c53f`
- `twemoji-local-manifest.js` → `a98d2c5`
- `OFFLINE_VISUAL.md` → `853541d`

---

## 4. Mode scope — invariant

### Easy-only

Chỉ Easy được hiển thị/chạy:

- Topic / Level.
- Smart Review / Ôn lại.
- Visual prompt.
- Listen / Nghe rồi gõ.
- Memory / Nhớ rồi gõ.
- Adaptive prompt stats.

### Hard

- Prompt nâng cao + input/check + Hard stats.
- Không được thấy Listen / Memory / Topic-Level / Review / Visual.

### Free

- Setup/custom text/typing Free + Free stats.
- Không được thấy control Easy.

---

## 5. UI/visual fixes đã hoàn tất

### PR #22 → `14d04bd`

- Easy-only controls ẩn hoàn toàn ngoài Easy.
- `.hidden-by-mode { display:none !important; }` làm regression guard.
- Listen/Memory inactive được thu gọn.
- mobile/landscape giảm padding/min-height.

### Visual semantic mapping

Mapping dùng:

```text
exact: [...]      // match toàn prompt
contains: [...]   // phrase whitelist rõ nghĩa
```

Không chắc nghĩa → **không hiện hình**, không ép hình gần nghĩa.

PR #24 mở rộng mapping đúng cho nhiều động vật: sư tử, hổ, gấu, sói, cáo, nai/hươu, rùa, rắn, ếch, cua, tôm, cá mập, cá heo, cánh cụt, đại bàng, cú, ong, bướm...

---

## 6. Phase 9 đợt 10 — Freeze/stability ✅

PR #26 → `25d2727`.

Đã sửa:

- bỏ auto-fullscreen từng chạy trên `click/keydown/wheel`;
- throttle Free resize/input bằng `requestAnimationFrame`;
- Free dropdown render một lần, không tải hàng chục thumbnail mỗi lần mở;
- cleanup timer/audio khi `pagehide`;
- `performance-health.js` theo dõi Long Task/runtime error/unhandled rejection.

Debug:

```js
getGoChuPerformanceHealth()
printGoChuPerformanceHealth()
```

---

## 7. Phase 9 đợt 11 — Easy startup performance 🟡

Branch:

```text
agent/easy-startup-performance
```

### Root cause đã xác định

Easy không chỉ lag vì animation. Hot path lớn nằm ở `topic-level.js`.

Trước fix, mỗi prompt trong một Smart Easy round gọi `promptMatchesLearningFilters()`. Hàm này lại gọi `getEffectiveLearningLevel()` cho **từng prompt**. `getEffectiveLearningLevel()` tiếp tục dựng topic/level pool bằng cách scan toàn bộ `easyWords` và chạy topic-term matching.

Dạng tải thực tế gần:

```text
N prompt
× calculate effective level
× scan N prompt
× normalize + topic matching
```

Với hàng trăm prompt đây là hot path gần O(n²), phù hợp với triệu chứng **mở Easy gần treo tab/máy**.

### 7.1 Cache dữ liệu tĩnh ✅

`topic-data.js` thêm:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
```

- normalize string một lần;
- topic membership cache;
- word count cache;
- normalized topic terms compile một lần.

Debug:

```js
getGoChuTopicCacheHealth()
```

### 7.2 Cache topic/level pool + cắt O(n²) ✅

`topic-level.js` thêm:

```js
goChuTopicPoolCache
goChuLevelPoolCache
```

Critical fix:

```js
const effectiveLevel = getEffectiveLearningLevel();
```

chỉ tính **một lần cho cả round**, không một lần mỗi prompt.

`getWeakPromptRecords()` cũng tính effective level một lần trước khi filter.

Debug:

```js
getGoChuLearningPoolHealth()
```

### 7.3 Smart Review reuse Easy Set ✅

Không tạo lại `new Set(easyWords)` trong mỗi `getWeakPromptRecords()` nếu `GO_CHU_EASY_PROMPT_SET` đã có.

### 7.4 Visual deferred + cache ✅

`visual-prompt.js`:

- compile visual exact/contains rules một lần;
- cache prompt → visual result;
- visual/network chỉ chạy ở `requestAnimationFrame` sau prompt/input;
- image lazy + async decode + low priority;
- stale image request không được ghi đè prompt mới.

### 7.5 Web Speech lazy ✅

Khi Listen tắt:

- không `getVoices()` trên mỗi `showText`;
- không enumerate voice ngay startup;
- voice selector chỉ dựng khi mở Settings;
- voice runtime chỉ initialize khi thật sự bật Listen hoặc cần debug/settings.

### 7.6 Dashboard lazy ✅

Profile startup chỉ load registry/data + preferences.

Không còn:

```text
startup → ensureProfileDashboard → render toàn bộ dashboard
```

Dashboard DOM/statistics chỉ dựng khi bấm 👤.

Existing profile cũng không bị stringify/write lại vô điều kiện ở mỗi startup.

Accessibility đã được sửa để tự bind modal profile khi modal được tạo lazy.

### 7.7 Asset probing idle ✅

`asset-reliability.js` probe `../IMG` bằng:

```text
requestIdleCallback(timeout 1200)
hoặc setTimeout 700ms
```

Không chen vào critical Easy first paint.

### 7.8 Startup diagnostics ✅

Files mới:

```text
startup-performance.js
startup-runtime-instrument.js
```

Debug:

```js
getGoChuStartupPerformance()
printGoChuStartupPerformance()
```

Markers:

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

### 7.9 Regression guard ✅

`tools/verify_repository.py` sẽ fail nếu:

- cache topic/word-count/pool bị xóa;
- `buildSmartEasyRound` quay lại effective-level per prompt;
- visual không còn deferred/cache;
- dashboard quay lại eager startup;
- voice enumeration quay lại startup;
- asset probing quay lại critical path;
- startup marker scripts/load order bị mất.

### Performance gate

Mục tiêu:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText không có Long Task > 50 ms
network không block input
```

**CI chỉ kiểm tra regression tĩnh. Số ms thật phải đo bằng browser/device thật.**

Trạng thái branch hiện tại: implementation code đã xong phần chính, đang chờ CI/smoke review trước merge.

---

## 8. Phase 9 đợt 12 — Responsive UI redesign PC/mobile

**Chỉ bắt đầu sau khi đợt 11 merge và Easy không còn gần treo.**

### Nguyên tắc

```text
Prompt + input là trung tâm.
Tool phụ compact/collapsible.
Không để feedback làm layout nhảy mạnh.
PC tận dụng chiều ngang.
Mobile ưu tiên ít cuộn, touch target lớn.
```

### PC >= 1024px

```text
┌ Menu | Profile | Timer | Settings ┐
│         Bé tập gõ chữ             │
│   Đơn giản | Nâng cao | Tự do     │
│                                   │
│        PROMPT / VISUAL            │
│                                   │
│ Chủ đề | Level | Nghe | Nhớ | Ôn  │
│                                   │
│             INPUT                 │
│          [ Tiếp theo ]            │
│                                   │
│       feedback fixed-height       │
└───────────────────────────────────┘
```

Easy tools đổi từ nhiều panel dọc thành control strip 1–2 hàng.

### Mobile <= 767px

```text
☰       00:01:20       👤 ⚙

[Đơn giản ▾]

PROMPT
visual nhỏ nếu có

INPUT
[ Tiếp theo ]

[Chủ đề] [Cấp độ]
[🔊 Nghe] [🧠 Nhớ] [📌 Ôn]

Feedback
```

- title lớn thu gọn trên mobile;
- input 52–60px tối thiểu;
- button touch target >= 48px;
- tool chi tiết dùng popover/bottom sheet;
- Memory Mức/Thời gian chỉ mở khi active;
- Nghe lại chỉ hiện khi Listen active.

### Feedback mới

Không dùng card vàng cao như hiện tại.

PC:

```text
❌ Sai · Cần: [chị] em · Bé gõ: [12]
```

Mobile:

```text
❌ Chưa đúng
Cần: chị em
Gõ:  12
```

Feedback zone giữ chiều cao ổn định để prompt/input không nhảy.

### Dashboard

Desktop:

```text
Profile header
4 summary cards
Tabs: Tổng quan | Hay sai | Chủ đề | Chế độ | Dữ liệu
```

Mobile: full-screen sheet + tabs/accordion, không một modal dài hàng nghìn px.

### Breakpoints

```text
<=480        phone nhỏ
481–767      phone lớn
768–1023     tablet
>=1024       desktop
>=1440       wide desktop
```

QA:

```text
360×640
390×844
430×932
768×1024
1366×768
1440×900
1920×1080
```

Test thêm zoom 125%/150% và Windows display scaling.

---

## 9. Listen / Google TTS

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
→ local SVG
→ CDN pinned
→ emoji fallback
```

Không match semantic → không hiện hình.

---

## 11. CI / diagnostics

CI hiện chạy:

1. Python compile.
2. `node --check` toàn bộ JS root.
3. `tools/verify_repository.py`.
4. deploy readiness report.
5. Twemoji dry-run.
6. Google TTS dry-run.

Runtime debug chính:

```js
runGoChuSmokeTests()
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
```

---

## 12. Thứ tự tiếp theo

1. Mở PR Phase 9 đợt 11.
2. CI phải PASS.
3. Review diff + merge nếu sạch.
4. Người dùng `git pull` và đo `printGoChuStartupPerformance()` trên Vercel/local.
5. Nếu Easy đã hết treo → bắt đầu Phase 9 đợt 12 UI redesign.
6. Nếu vẫn có Long Task → dùng startup/performance diagnostics truy đúng hot path trước khi redesign.

---

## 13. Việc chờ người dùng

### Google TTS

- setup Google Cloud;
- nghe sample;
- chốt voice/rate;
- render MP3;
- commit `Audio/tts/*.mp3` + `tts-manifest.js`.

### Twemoji local 100%

```bat
tools\vendor_twemoji.bat
```

### Binary khác

4 Music/UI audio gốc vẫn chưa có remote.

---

## 14. Release gate cuối

1. `python tools/verify_repository.py` PASS.
2. Easy startup browser performance gate PASS.
3. `python tools/check_deploy_ready.py --strict` PASS khi binary đủ.
4. `?debug=1` smoke PASS.
5. Network Offline test.
6. Desktop/mobile responsive QA.
7. Easy / Hard / Free / Listen / Memory / profile/dashboard.
8. Local MP3 + local Twemoji thật.
9. Deploy QA thực tế.
