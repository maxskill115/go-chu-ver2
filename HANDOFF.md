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

### Ghi chú lịch sử tooling

Trước khi mở branch Phase 9 đợt 6 có 3 scaffolding commit trực tiếp vào `main`:

- `tools/vendor_twemoji.py` → `c35c53f`
- `twemoji-local-manifest.js` → `a98d2c5`
- `OFFLINE_VISUAL.md` → `853541d`

Có một `BRANCH_MARKER.tmp` tạo nhầm khi chuyển tool và đã xóa ngay; hiện không còn trong repo.

---

## 4. Kiến trúc học

### Easy / Smart Review

- `promptStats` chỉ phục vụ Easy / Listen / Memory.
- Weakness hiện dùng `wrong * 2 - correct`.
- Prompt yếu được ưu tiên nhưng tránh lặp liên tục.
- Hard/Free không tham gia adaptive Easy.

### Hard / Free

- Có `modeStats.hard` và `modeStats.free` riêng theo profile.
- Một prompt/target sai nhiều lần trong cùng lượt chỉ tăng tối đa 1 `wrong` theo rule hiện tại.
- Dashboard tổng quan cộng Easy + Hard + Free; `Cần ôn` và lỗi dấu vẫn chỉ dựa trên Easy.

### Hồ sơ bé

Keys:

```text
goChuVer2.profiles.v1
goChuVer2.activeProfile.v1
goChuVer2.profile.<profileId>.v1
```

Mỗi profile giữ:

- `promptStats`
- `modeStats.hard/free`
- study time
- topic/level
- Memory preferences
- accent stats

---

## 5. Vietnamese input

- Progress theo từng từ.
- Accent-only detection (`meo → mèo`, `di → đi`).
- Guide Telex/VNI chỉ là hướng dẫn, không tự sửa input.
- Key:

```text
goChuVer2.inputGuide.v1 = off | telex | vni
```

Guide tự ẩn trong Listen/Memory để không lộ đáp án.

---

## 6. Visual pipeline

Twemoji pinned:

```text
jdecked/twemoji@17.0.3
```

Runtime hiện tại:

```text
1. local SVG nếu có trong twemoji-local-manifest.js
2. CDN pinned Twemoji
3. emoji fallback
```

Files:

```text
visual-data.js
visual-prompt.js
twemoji-local-manifest.js
OFFLINE_VISUAL.md
tools/vendor_twemoji.py
tools/vendor_twemoji.bat
```

Vendor tool:

- đọc code duy nhất từ `visual-data.js`;
- không tải cả bộ Twemoji;
- lưu `assets/twemoji/<code>.svg`;
- file có sẵn được skip;
- `--force` tải đè;
- `--dry-run` không cần network;
- tự sinh lại local manifest từ file thực sự tồn tại.

Debug:

```js
getGoChuVisualHealth()
```

Hiện binary SVG local **chưa được vendor/commit thật**. Web vẫn dùng CDN hoặc emoji fallback bình thường.

---

## 7. Listen / Google TTS

Runtime:

```text
1. MP3 Google TTS local
2. Web Speech voice tiếng Việt
3. báo thiếu audio
```

Files:

```text
tts-manifest.js
tts-local.js
TTS_RENDERING.md
tools/render_google_tts.py
tools/requirements-tts.txt
tools/setup_google_tts.bat
tools/render_google_tts.bat
Audio/tts/README.md
```

Default renderer:

```text
language: vi-VN
voice: vi-VN-Chirp3-HD-Aoede
speaking rate: 0.82
encoding: MP3
```

Quy tắc:

- browser không gọi Google API;
- credential chỉ dùng build-time qua Google ADC;
- mỗi prompt Easy → MP3 tên SHA-1 rút gọn;
- skip file đã có;
- `--only` / `--limit` không làm mất manifest cũ;
- MP3 lỗi runtime → fallback Web Speech tiếng Việt;
- không fallback sang voice ngoại ngữ;
- Listen và Memory không active cùng lúc;
- rời Easy phải dừng MP3/Web Speech;
- volume/giảm âm thanh áp dụng cho MP3 TTS.

Debug:

```js
getGoChuTtsHealth()
```

Hiện MP3 Google TTS thật **chưa có trên remote** vì chờ người dùng setup Google Cloud và render.

---

## 8. Asset / storage / accessibility

### Asset UI

`../IMG/...` vẫn là dependency project cha.

UI chính đã có fallback:

```text
Title → ⌨️
Easy → 🔤
Hard → 🧠
Free → ✍️
Free poem → 📖
```

Debug:

```js
getGoChuAssetHealth()
printGoChuAssetHealth()
```

### Storage

`storage-health.js` dùng compare-before-write cho profile/registry.

Không đổi schema/key/version/cadence study-time.

Debug:

```js
getGoChuStorageHealth()
printGoChuStorageHealth()
goChuStorageMetrics
```

### Accessibility

- ARIA state/dialog.
- focus trap/restore.
- background `inert` khi modal mở.
- keyboard Tab / Shift+Tab / Escape.
- `prefers-reduced-motion`.

---

## 9. CI / static verification

Workflow:

```text
.github/workflows/verify.yml
```

Đã PASS trên PR #19 và PR #20.

CI chạy:

1. compile Python tools;
2. `tools/verify_repository.py`;
3. `tools/check_deploy_ready.py`;
4. `tools/vendor_twemoji.py --dry-run`;
5. `tools/render_google_tts.py --dry-run --limit 5`.

CI không gọi Google API và không tải Twemoji thật.

`verify_repository.py` kiểm tra:

- script refs local trong `index.html` tồn tại;
- load order runtime chính;
- Twemoji rule/manifest/path/file consistency;
- TTS provider marker;
- không có chuỗi giống Google API key phổ biến trong manifest;
- build tools bắt buộc tồn tại.

---

## 10. Deploy QA

Files:

```text
DEPLOY_QA.md
tools/serve_local.bat
tools/check_deploy_ready.py
```

Local HTTP QA:

```bat
tools\serve_local.bat
```

Mặc định:

```text
http://127.0.0.1:8000/
http://127.0.0.1:8000/?debug=1
```

Readiness report:

```bat
py tools\check_deploy_ready.py
```

Report gồm:

- TTS local coverage / tổng Easy prompt;
- Twemoji local coverage / tổng code dùng;
- 4 Music/UI audio binary;
- dependency `../IMG`;
- trạng thái verifier.

Mặc định chỉ WARN để CI vẫn PASS khi binary cố ý chưa có.

Khi chuẩn bị release standalone/offline 100%:

```bat
py tools\check_deploy_ready.py --strict
```

`DEPLOY_QA.md` phân biệt 3 mức:

1. code/runtime ready;
2. fallback-ready;
3. offline/standalone-ready.

---

## 11. Việc assistant có thể tiếp tục mà không cần người dùng

1. Static audit CSS/mobile/layout và dead/duplicate code risk.
2. Rà repo cho file/branch thừa và docs dependency.
3. Chuẩn bị release checklist cuối.
4. Tiếp tục QA static/runtime diagnostics không cần binary.

---

## 12. Việc đang chờ người dùng

### Google TTS

1. `git pull`
2. chạy `tools\setup_google_tts.bat`
3. `tools\render_google_tts.bat --list-voices`
4. nghe sample
5. chốt voice/rate
6. render toàn bộ
7. commit `Audio/tts/*.mp3` + `tts-manifest.js`

### Twemoji local nếu muốn offline visual 100%

```bat
tools\vendor_twemoji.bat
```

Sau đó commit:

```text
assets/twemoji/*.svg
twemoji-local-manifest.js
```

### Binary còn thiếu

4 file Music/UI audio gốc vẫn chưa có trên remote.

---

## 13. Release gate cuối

Sau khi binary hoàn tất:

1. `python tools/verify_repository.py` PASS.
2. `python tools/check_deploy_ready.py --strict` PASS.
3. `?debug=1` smoke tests PASS.
4. Test Network Offline.
5. Test desktop.
6. Test mobile:
   - 360×640 portrait
   - 390×844 portrait
   - 640×360 landscape
7. Test Easy / Hard / Free / Listen / Memory / profile/dashboard.
8. Test local MP3 và local Twemoji thật.
9. Deploy QA thực tế.

---

## 14. Tồn đọng hiện tại

- Google TTS MP3 chưa render/commit thật.
- Twemoji SVG local chưa vendor/commit thật.
- 4 Music/UI audio binary gốc chưa có remote.
- `../IMG/...` vẫn là dependency project cha; UI chính có fallback.
- Free dropdown thumbnail chưa probe toàn bộ; text option vẫn dùng được.
- Một số branch thử cũ có thể dọn sau khi audit.
