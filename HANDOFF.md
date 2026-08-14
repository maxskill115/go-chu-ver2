# HANDOFF — go-chu-ver2

## 1. Mục tiêu project

`go-chu-ver2` là web HTML/CSS/JS thuần cho bé luyện:

**đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi, hồ sơ riêng từng bé và hỗ trợ tiếng Việt.

### Quy tắc phát triển

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi phase lớn: branch riêng → PR → CI → squash merge `main`.
- Mọi plan, thay đổi, quyết định kỹ thuật, PR/commit và việc còn lại phải ghi trong `HANDOFF.md`.
- Không phá mode không liên quan.
- UI phải dùng tốt desktop + mobile.
- Không đưa API key/credential vào browser/runtime.

---

## 2. Roadmap

### Hoàn tất

- [x] **Phase 0** — Khởi tạo ver2.
- [x] **Phase 1** — Levenshtein diff + hotfix UI bỏ ô đỏ/SP.
- [x] **Phase 2** — Smart random + prompt yếu + Ôn lại.
- [x] **Phase 3** — Ảnh + chữ + emoji fallback.
- [x] **Phase 4** — Nghe rồi gõ, chỉ voice tiếng Việt.
- [x] **Phase 5** — Nhớ rồi gõ 2/3/4 từ, 3/5/7 giây.
- [x] **Phase 6** — Chủ đề + Auto/1/2/3/4 từ.
- [x] **Phase 7** — Nhiều hồ sơ bé + dashboard + backup JSON.
- [x] **Phase 8** — Progress theo từ + lỗi dấu + Telex/VNI guide.

### Phase 9 — Stabilization / QA / offline

- [x] Đợt 1 — smoke test + QA checklist.
- [x] Đợt 2 — audit wrapper + stats Hard/Free.
- [x] Đợt 3 — accessibility + keyboard.
- [x] Đợt 4 — storage audit + no-op write dedupe.
- [x] Đợt 5 — asset reliability + UI fallback.
- [x] Đợt 6 — offline visual framework + CI/static verification.
- [x] Đợt 7 — deploy QA preparation + readiness report.
- [x] **Đợt 8 — UI scope + visual accuracy + regression fixes.**
- [ ] Vendor/commit SVG Twemoji thật nếu muốn offline visual 100%.
- [ ] Deploy QA thực tế sau khi binary hoàn tất.

### Phase 10 — Pre-rendered Google TTS MP3

- [x] Runtime MP3 local-first + Web Speech fallback.
- [x] Google Cloud TTS renderer + Windows `.bat`.
- [x] Manifest deterministic + incremental/resume.
- [x] QA/static checks/docs.
- [ ] Người dùng render MP3 thật bằng Google Cloud account.
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
- Phase 10 TTS framework: PR #17 → `b7e52fd`
- Handoff Phase 10: PR #18 → `bb6303a`
- Phase 9 đợt 6 offline visual/CI: PR #19 → `58f295d`
- Phase 9 đợt 7 deploy QA prep: PR #20 → `24f6673`
- Phase 9 đợt 8 UI scope/visual fix: PR #22 → `14d04bd`

### Ghi chú tooling lịch sử

Trước branch Phase 9 đợt 6 có 3 scaffolding commit trực tiếp vào `main`:

- `tools/vendor_twemoji.py` → `c35c53f`
- `twemoji-local-manifest.js` → `a98d2c5`
- `OFFLINE_VISUAL.md` → `853541d`

Có một `BRANCH_MARKER.tmp` tạo nhầm rồi đã xóa ngay; không còn trong repo.

---

## 4. Kiến trúc học / phạm vi mode

### Easy

Các tính năng **chỉ dành cho Easy**:

- Topic / Level.
- Smart Review / Ôn lại.
- Visual prompt.
- Listen / Nghe rồi gõ.
- Memory / Nhớ rồi gõ.
- Adaptive prompt stats.
- Telex/VNI guide liên quan prompt.

### Hard

- Chỉ prompt nâng cao + input + check + stats Hard.
- Không được hiển thị Listen / Memory / Topic-Level / Smart Review / Visual của Easy.

### Free

- Chỉ setup bài / custom text / typing Free + stats Free.
- Không được hiển thị control Easy.

### Smart Review

- `promptStats` chỉ phục vụ Easy / Listen / Memory.
- Weakness: `wrong * 2 - correct`.
- Hard/Free không tham gia adaptive Easy.

### Hồ sơ bé

Keys:

```text
goChuVer2.profiles.v1
goChuVer2.activeProfile.v1
goChuVer2.profile.<profileId>.v1
```

Profile giữ `promptStats`, `modeStats.hard/free`, study time, topic/level, Memory preferences và accent stats.

---

## 5. Phase 9 đợt 8 — UI scope + visual accuracy

Đã merge qua PR #22 → `14d04bd`.

CI của PR #22 PASS toàn bộ, gồm:

- Python tool compile.
- `node --check` toàn bộ JS root.
- static repository verification.
- deploy readiness report.
- Twemoji dry-run.
- Google TTS dry-run.

### Lỗi được báo

1. Listen được phát triển cho Easy nhưng vẫn hiển thị ở Nâng cao.
2. Smart Review cũng có thể vẫn hiện ngoài Easy.
3. Hình minh họa đôi khi không khớp chữ do keyword quá rộng.
4. Easy có quá nhiều thanh control xếp chồng, gây nặng UI trên mobile/landscape.

### Fix đã merge

#### Listen scope

`listen-mode.js`:

- `listenModeBar` thêm `hidden-by-mode` khi `currentMode !== "easy"`.
- ngoài Easy: `aria-hidden=true`, nút disable, status rỗng.
- `toggleListenMode()` không tự chuyển Hard/Free về Easy.
- rời Easy vẫn hủy speech timer/Web Speech.

`tts-local.js`:

- local MP3 layer tôn trọng scope Easy.
- ngoài Easy: bar ẩn, toggle/replay disable, status rỗng.
- `setListenMode(true)` ngoài Easy không tự đổi mode.
- local audio dừng khi rời Easy.

#### Smart Review scope

`smart-review.js`:

- `smartReviewBar` ẩn hoàn toàn ngoài Easy.
- `startSmartReview()` ngoài Easy return.
- Hard/Free không thấy text/status Ôn lại.

#### Memory / Topic-Level

Hai module đã có `hidden-by-mode`; `ui-scope-fixes.css` thêm regression guard `display:none !important` để chống cascade làm hiện trở lại.

#### Visual accuracy

Nguyên nhân cũ: `normalized.includes(keyword)` với keyword mơ hồ như `cam`, `cây`, `nước`, `nhà`, `sách`.

Mapping mới trong `visual-data.js`:

```text
exact: [...]      // match toàn prompt
contains: [...]   // chỉ phrase đủ rõ nghĩa
```

Ví dụ đã loại lỗi:

- `màu cam` không còn tự ra quả cam.
- `trái cây` không bị match rule cây.
- cụm chứa `nước` không tự ra giọt nước nếu nghĩa không rõ.

`visual-prompt.js`:

- exact trước, contains chỉ whitelist phrase.
- mapping không chắc → ẩn hình.
- Visual chỉ chạy Easy.
- chuyển mode refresh visual ngay, không giữ ảnh Easy sang Hard/Free.

#### UI polish

File mới `ui-scope-fixes.css`, import cuối `styles.css`.

- Easy toolbar dùng cùng max-width/spacing.
- Listen chưa bật chỉ hiện nút `Nghe rồi gõ`.
- Memory chưa bật chỉ hiện nút `Nhớ rồi gõ`.
- khi active mới mở replay/status/select chi tiết.
- landscape thấp giảm padding/min-height.
- mobile full-width nhưng gọn hơn.

#### Regression guard

CI thêm:

```text
node --check toàn bộ JS
```

`tools/verify_repository.py` kiểm tra thêm:

- `ui-scope-fixes.css` được import.
- `.hidden-by-mode` có `display:none !important`.
- Listen/TTS/SmartReview/Visual có Easy-only guard.
- `visual-data.js` không được quay lại property `keywords:` rộng.
- visual mapping phải có `exact`/`contains`.

### Invariant

```text
Hard/Free không được nhìn thấy UI Easy-specific.
Visual sai còn tệ hơn không có visual → không chắc thì ẩn.
Listen/Memory inactive phải gọn, không chiếm màn hình.
```

---

## 6. Vietnamese input

- Progress theo từng từ.
- Accent-only detection (`meo → mèo`, `di → đi`).
- Guide Telex/VNI chỉ hướng dẫn, không tự sửa input.
- Key: `goChuVer2.inputGuide.v1 = off | telex | vni`.
- Guide tự ẩn trong Listen/Memory.

---

## 7. Visual pipeline

Twemoji pinned `jdecked/twemoji@17.0.3`.

Runtime:

```text
1. semantic rule match
2. local SVG nếu manifest có
3. CDN pinned Twemoji
4. emoji fallback
```

Nếu semantic rule không match thì không hiện hình.

Files:

```text
visual-data.js
visual-prompt.js
twemoji-local-manifest.js
OFFLINE_VISUAL.md
tools/vendor_twemoji.py
tools/vendor_twemoji.bat
```

Debug: `getGoChuVisualHealth()`.

---

## 8. Listen / Google TTS

Runtime **Easy-only**:

```text
1. MP3 Google TTS local
2. Web Speech voice tiếng Việt
3. báo thiếu audio
```

Files chính:

```text
tts-manifest.js
tts-local.js
TTS_RENDERING.md
tools/render_google_tts.py
tools/setup_google_tts.bat
tools/render_google_tts.bat
```

Default renderer:

```text
vi-VN-Chirp3-HD-Aoede
speaking rate 0.82
MP3
```

MP3 thật chưa render/commit vì chờ Google Cloud account của người dùng.

---

## 9. CI / QA / deploy

Workflow `.github/workflows/verify.yml` đã PASS PR #19, #20 và #22.

CI:

1. compile Python tools;
2. check JavaScript syntax;
3. `tools/verify_repository.py`;
4. `tools/check_deploy_ready.py`;
5. Twemoji dry-run;
6. Google TTS dry-run.

Local QA:

```bat
tools\serve_local.bat
```

Debug URL:

```text
http://127.0.0.1:8000/?debug=1
```

Readiness:

```bat
py tools\check_deploy_ready.py
py tools\check_deploy_ready.py --strict
```

---

## 10. Việc assistant tiếp tục

1. Audit thêm desktop/mobile CSS sau UI scope merge.
2. Rà ARIA/state khi chuyển Easy ↔ Hard ↔ Free.
3. Rà wrapper chain để tìm state bị giữ lại sau chuyển mode.
4. Rà visual whitelist còn cụm nào mơ hồ/thiếu rõ ràng.
5. Rà branch/file thừa và docs dependency.
6. Chuẩn bị release checklist cuối.

---

## 11. Việc chờ người dùng

### Google TTS

- setup Google Cloud;
- nghe sample;
- chốt voice/rate;
- render MP3;
- commit `Audio/tts/*.mp3` + `tts-manifest.js`.

### Offline Twemoji 100%

```bat
tools\vendor_twemoji.bat
```

### Binary khác

4 Music/UI audio gốc vẫn chưa có remote.

---

## 12. Release gate cuối

Sau khi binary hoàn tất:

1. `python tools/verify_repository.py` PASS.
2. `python tools/check_deploy_ready.py --strict` PASS.
3. `?debug=1` smoke PASS.
4. Network Offline test.
5. Desktop test.
6. Mobile 360×640 / 390×844 / 640×360.
7. Easy / Hard / Free / Listen / Memory / profile/dashboard.
8. Local MP3 + local Twemoji thật.
9. Deploy QA thực tế.
