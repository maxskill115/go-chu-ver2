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
- [x] **Đợt 11 — Easy startup performance rewrite — code + CI hoàn tất.**
- [ ] **Đợt 11B — browser/device performance gate.**
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
- **Phase 9 đợt 11 Easy performance: PR #29 → `b27de10`**

Tooling scaffolding trước đợt 6:

- `tools/vendor_twemoji.py` → `c35c53f`
- `twemoji-local-manifest.js` → `a98d2c5`
- `OFFLINE_VISUAL.md` → `853541d`

Ghi chú cleanup: có branch rỗng `noop` tạo nhầm khi chuyển tool; không chứa code và không ảnh hưởng `main`, có thể xóa khi dọn branch.

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

Mapping dùng `exact` + `contains` whitelist. Không chắc nghĩa → **không hiện hình**, không ép hình gần nghĩa.

PR #24 mở rộng mapping đúng cho nhiều động vật như sư tử, hổ, gấu, sói, cáo, nai/hươu, rùa, rắn, ếch, cua, tôm, cá mập, cá heo, cánh cụt, đại bàng, cú, ong, bướm...

---

## 6. Phase 9 đợt 10 — Freeze/stability ✅

PR #26 → `25d2727`.

- bỏ auto-fullscreen trên `click/keydown/wheel`;
- throttle Free resize/input bằng rAF;
- Free dropdown render một lần;
- cleanup timer/audio khi `pagehide`;
- thêm Long Task/runtime diagnostics.

Debug:

```js
printGoChuPerformanceHealth()
```

---

## 7. Phase 9 đợt 11 — Easy startup performance ✅ code/CI

PR #29 → `b27de10`.

### Root cause chính

`topic-level.js` cũ tính `getEffectiveLearningLevel()` **cho từng prompt** trong Smart Easy round. Mỗi lần lại có thể scan toàn bộ `easyWords` và topic terms.

Với hàng trăm prompt, hot path gần:

```text
N prompt
× effective-level calculation
× scan N prompt
× normalize/topic matching
```

=> gần O(n²), phù hợp triệu chứng mở Easy gần treo máy.

### Fix đã merge

#### Cache dữ liệu tĩnh

`topic-data.js`:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
```

#### Cache topic/level pool

`topic-level.js`:

```js
goChuTopicPoolCache
goChuLevelPoolCache
```

`effectiveLevel` chỉ tính **một lần cho cả round**, không per-prompt.

#### Smart Review

Tái sử dụng `GO_CHU_EASY_PROMPT_SET`, không tạo lại Set hàng trăm phần tử mỗi lần.

#### Visual

- compile semantic rule một lần;
- cache prompt → visual;
- render visual ở frame sau prompt/input;
- image lazy + async decode + low priority;
- stale request không ghi đè prompt mới.

#### Listen/Web Speech

- không enumerate voice khi Listen tắt;
- không `getVoices()` trên mỗi `showText`;
- voice selector chỉ dựng khi Settings mở;
- voice chỉ resolve khi bật Listen/fallback/debug.

#### Profile/dashboard

- startup không dựng dashboard DOM;
- dashboard chỉ dựng khi bấm 👤;
- existing profile không bị stringify/write lại vô điều kiện lúc load;
- accessibility tự bind profile modal lazy.

#### Hard/Free mode stats

Fix thêm lỗi dữ liệu:

- hydrate `modeStats` từ raw profile storage;
- hydrate trước dashboard render khi đổi profile;
- không startup-save rỗng làm mất thống kê Nâng cao/Tự do.

#### Asset probe

`../IMG` probing chạy idle bằng `requestIdleCallback` hoặc timer fallback, không chen vào critical first paint.

### Startup diagnostics

Files:

```text
startup-performance.js
startup-runtime-instrument.js
PERFORMANCE_QA.md
```

Console:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
```

Markers chính:

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

### CI

PR #29 CI PASS sau review fixes.

Static verifier khóa regression nếu:

- cache bị xóa;
- effective-level quay lại per-prompt;
- visual quay lại eager;
- dashboard quay lại eager;
- voice enumeration quay lại startup;
- asset probe quay lại critical path;
- startup scripts/load order bị mất.

### Đợt 11B — browser performance gate còn phải kiểm tra

Mục tiêu:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText không Long Task > 50 ms
network không block input
```

CI không thể chứng minh latency thật của thiết bị/browser. Dùng `PERFORMANCE_QA.md` để đo trên local/Vercel.

**Chỉ bắt đầu UI redesign sau khi xác nhận Easy không còn gần treo.**

---

## 8. Phase 9 đợt 12 — Responsive UI redesign PC/mobile

### Nguyên tắc

```text
Prompt + input là trung tâm.
Tool phụ compact/collapsible.
Feedback không làm layout nhảy mạnh.
PC tận dụng chiều ngang.
Mobile ít cuộn, touch target lớn.
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

- title lớn thu gọn;
- input 52–60px tối thiểu;
- touch target >= 48px;
- Memory Mức/Thời gian chỉ hiện khi active;
- Nghe lại chỉ hiện khi Listen active.

### Feedback mới

PC:

```text
❌ Sai · Cần: [chị] em · Bé gõ: [12]
```

Mobile:

```text
❌ Chưa đúng
Cần: chị em
Gõ: 12
```

Feedback zone giữ chiều cao ổn định.

### Dashboard mới

Desktop: summary cards + tabs `Tổng quan | Hay sai | Chủ đề | Chế độ | Dữ liệu`.

Mobile: full-screen sheet + tabs/accordion, tránh modal dài hàng nghìn px.

### Breakpoints/QA

```text
<=480
481–767
768–1023
>=1024
>=1440
```

Test:

```text
360×640
390×844
430×932
768×1024
1366×768
1440×900
1920×1080
```

thêm zoom 125%/150% và Windows display scaling.

---

## 9. Google TTS

Easy-only runtime:

```text
1. MP3 Google TTS local
2. Web Speech vi-*
3. báo thiếu audio
```

Default renderer: `vi-VN-Chirp3-HD-Aoede`, rate `0.82`, MP3.

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

## 11. Thứ tự tiếp theo

1. Người dùng `git pull` / đợi Vercel deploy `b27de10`.
2. Chạy theo `PERFORMANCE_QA.md`.
3. Console:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
```

4. Nếu Easy hết treo và gate hợp lý → bắt đầu Phase 9 đợt 12 UI redesign.
5. Nếu còn long task lớn → truy đúng marker/hot path trước khi redesign.
6. Sau UI redesign chạy full cross-device QA.

---

## 12. Việc chờ người dùng

- Google TTS sample/render MP3 thật.
- Twemoji local 100% nếu muốn: `tools\vendor_twemoji.bat`.
- 4 Music/UI audio binary gốc chưa có remote.

---

## 13. Release gate cuối

1. `python tools/verify_repository.py` PASS.
2. Browser Easy startup performance gate PASS.
3. `python tools/check_deploy_ready.py --strict` PASS khi binary đủ.
4. `?debug=1` smoke PASS.
5. Network Offline test.
6. Desktop/mobile responsive QA.
7. Easy / Hard / Free / Listen / Memory / profile/dashboard.
8. Local MP3 + local Twemoji thật.
9. Deploy QA thực tế.
