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
- [x] **Đợt 11 — Easy CPU startup rewrite.**
- [x] **Đợt 11B — startup network parallel + lazy audio.**
- [ ] **Đợt 11C — browser/device performance gate trên Vercel/local thật.**
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

Cleanup note: có branch rỗng `noop` tạo nhầm trước đây; không ảnh hưởng `main`.

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

## 5. Performance fixes đã merge

### 5.1 Freeze/stability — PR #26

Đã bỏ:

- auto fullscreen trên `click/keydown/wheel`;
- Free resize/input chạy dồn;
- Free dropdown render lại hàng chục thumbnail mỗi lần mở.

Có diagnostics:

```js
printGoChuPerformanceHealth()
```

### 5.2 Easy CPU startup rewrite — PR #29

Root cause chính: `buildSmartEasyRound()` từng tính `getEffectiveLearningLevel()` theo **từng prompt**, kéo theo scan topic/level pool nhiều lần. Với hàng trăm prompt, hot path gần O(n²).

Đã thêm cache:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
goChuTopicPoolCache
goChuLevelPoolCache
```

`effectiveLevel` chỉ tính **một lần cho cả round**.

Các phần phụ đã lazy/defer khỏi Easy first paint:

- visual semantic matching + image request;
- Web Speech voice enumeration;
- profile dashboard DOM/statistics;
- `../IMG` asset probe.

Debug:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuTopicCacheHealth()
getGoChuLearningPoolHealth()
```

### 5.3 Startup network + lazy audio — PR #31

User báo **vào web vẫn rất lâu và lag** sau CPU fix. Audit phát hiện:

- `styles.css` chỉ là 13 `@import` → CSS discovery waterfall;
- `index.html` có khoảng 27 external JS classic script;
- `script-core.js` tạo 2 MP3 nền + 2 WAV, đặt preload auto và gọi background music lúc startup.

Fix đã merge:

#### CSS

Production `index.html` **không còn dùng `styles.css`**.

13 stylesheet được link trực tiếp trong `<head>` để browser phát hiện và tải song song.

#### JavaScript

`startup-performance.js` chạy sớm để đo.

Các module còn lại dùng:

```html
<script src="..." defer></script>
```

Browser tải song song nhưng defer vẫn giữ đúng thứ tự thực thi wrapper.

#### Audio

File mới:

```text
audio-lazy-bootstrap.js
```

Nạp trước `script-core.js`.

Behavior:

- `new Audio(url)` không gắn `src` lúc startup;
- chưa có user activation → `play()` trả `NotAllowedError` nhẹ;
- sau pointer/keyboard đầu tiên, **chỉ audio nào thật sự play mới gắn src**;
- không tải đồng loạt 2 MP3 nền + Click.wav + dung.wav ở click đầu.

Debug:

```js
getGoChuAudioBootstrapHealth()
```

CI guard mới:

```text
tools/verify_startup_loading.py
```

Fail nếu:

- production quay lại `styles.css/@import`;
- external JS production mất `defer`;
- load order wrapper sai;
- lazy audio nạp sau `script-core`;
- unlock interaction quay lại gắn src hàng loạt.

PR #31 CI PASS trước merge.

---

## 6. UI/visual hiện tại

### Visual semantic mapping

Ưu tiên:

```text
exact
→ contains whitelist
→ không chắc nghĩa thì không hiện hình
```

Không dùng keyword mơ hồ kiểu `cam`, `cây`, `nước`, `nhà` một cách tự do.

Runtime visual:

```text
local SVG
→ CDN Twemoji pinned 17.0.3
→ emoji fallback
```

### UI redesign — Phase 9 đợt 12

Chỉ bắt đầu sau khi startup performance gate ổn.

Mục tiêu:

```text
Prompt + input là trung tâm.
Tool phụ compact/collapsible.
Feedback không làm layout nhảy.
PC tận dụng chiều ngang.
Mobile ít cuộn, touch target >=48px.
```

PC: Topic / Level / Listen / Memory / Review gom thành toolbar 1–2 hàng.

Mobile: prompt + input + Next ở trên; tool phụ chuyển thành chip/popover/bottom sheet.

Dashboard: desktop dùng tab; mobile dùng full-screen sheet/accordion thay modal rất dài.

---

## 7. Google TTS

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

Chưa có MP3 thật trên remote vì chờ Google Cloud account của người dùng.

---

## 8. CI / QA

Workflow:

```text
.github/workflows/verify.yml
```

Hiện chạy:

- Python compile tools;
- `node --check` toàn bộ JS root;
- `verify_repository.py`;
- `verify_startup_loading.py`;
- deploy readiness report;
- Twemoji dry-run;
- Google TTS dry-run.

Local QA:

```bat
tools\serve_local.bat
```

Performance QA:

```text
PERFORMANCE_QA.md
```

Mục tiêu gate:

```text
Desktop first input ready < 150 ms
Mobile tầm trung < 300 ms
showText không Long Task > 50 ms
network không block input
```

---

## 9. Việc tiếp theo

### Ngay sau PR #31

1. Đợi Vercel deploy `3b13a7a` hoặc `git pull` local.
2. Hard refresh / Incognito để tránh cache bản cũ.
3. Test lần mở đầu tiên và reload lần 2.
4. Console:

```js
printGoChuStartupPerformance()
printGoChuPerformanceHealth()
getGoChuAudioBootstrapHealth()
```

5. Nếu startup đã ổn → bắt đầu Phase 9 đợt 12 UI redesign.
6. Nếu vẫn chậm → bước tiếp theo là **production bundle 1 CSS + 1 JS / split core-deferred**, không tiếp tục chồng thêm module nhỏ.

### Chờ người dùng

- Google TTS sample/render MP3 thật.
- Twemoji local 100% nếu muốn offline hoàn toàn.
- 4 Music/UI binary gốc nếu muốn đưa lên remote đầy đủ.

---

## 10. Tồn đọng

- Browser/device performance gate chưa xác nhận sau PR #31.
- MP3 Google TTS chưa render thật.
- Twemoji SVG local chưa vendor 100%.
- `../IMG/...` vẫn là dependency project cha; UI chính có fallback.
- Responsive UI redesign chưa bắt đầu.
