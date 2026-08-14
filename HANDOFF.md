# HANDOFF — go-chu-ver2

## 1. Mục tiêu

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi, hồ sơ riêng từng bé và hỗ trợ gõ tiếng Việt.

### Quy tắc bắt buộc

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi phase lớn dùng branch/PR riêng, squash merge vào `main`.
- **Mọi thay đổi, plan, quyết định kỹ thuật, PR/commit và việc còn lại đều cập nhật `HANDOFF.md`.**
- Không phá mode không liên quan.
- UI mới phải dùng tốt desktop + mobile.
- Không đưa API key/credential vào HTML/JS runtime.

## 2. Roadmap trạng thái

- [x] **Phase 0** — Khởi tạo ver2.
- [x] **Phase 1** — Báo lỗi Levenshtein + hotfix UI không còn ô đỏ/SP.
- [x] **Phase 2** — Smart random + prompt yếu + Ôn lại.
- [x] **Phase 3** — Ảnh + chữ + fallback emoji.
- [x] **Phase 4** — Nghe rồi gõ, chỉ voice tiếng Việt.
- [x] **Phase 5** — Nhớ rồi gõ 2/3/4 từ, 3/5/7 giây.
- [x] **Phase 6** — 10 chủ đề + Auto/1/2/3/4 từ.
- [x] **Phase 7** — Nhiều hồ sơ bé + dashboard + backup JSON.
- [x] **Phase 8** — Progress theo từ + lỗi dấu + Telex/VNI guide.
- [~] **Phase 9** — Ổn định hóa, QA, offline, mở rộng stats.
  - [x] Đợt 1: smoke test + QA checklist.
  - [x] Đợt 2: audit wrapper + stats riêng Nâng cao/Tự do.
  - [x] Đợt 3: accessibility + keyboard navigation.
  - [x] Đợt 4: storage audit + no-op write dedupe.
  - [x] Đợt 5: asset reliability + UI fallback.
  - [x] Đợt 6: offline visual framework + CI/static verification.
  - [~] Đợt 7: deploy QA preparation + readiness report.
  - [ ] Vendor/commit SVG Twemoji thật.
  - [ ] Deploy QA thực tế.
- [~] **Phase 10** — Pre-rendered Google TTS MP3.
  - [x] Runtime MP3 local-first + Web Speech fallback.
  - [x] Google Cloud TTS renderer + Windows `.bat`.
  - [x] Manifest deterministic + resume/incremental render.
  - [x] QA/smoke/runtime docs.
  - [ ] Render MP3 thật bằng Google Cloud account của người dùng.
  - [ ] Commit `Audio/tts/*.mp3` + manifest đã render.

## 3. PR / commit chính

- Phase 1: PR #1 → `1e8450b`.
- Phase 2: PR #2 → `11b5689`.
- Phase 3: PR #3 → `e0fe068`.
- Phase 4: PR #4 → `6cc6b00`.
- Hotfix UX/voice: PR #5 → `26cdb63`.
- Phase 5: PR #6 → `daecd42`.
- Phase 6: PR #7 → `18552e0`.
- Phase 7: PR #8 → `e281c40`.
- Phase 8: PR #9 → `10d756e`.
- Phase 9 đợt 1: PR #10 → `36d16dc`.
- Phase 9 đợt 2: PR #12 → `7d598f2`.
- Phase 9 đợt 3: PR #13 → `94bb3ef`.
- Phase 9 đợt 4: PR #14 → `d750722`.
- Phase 9 đợt 5: PR #15 → `0e0ce0e`.
- Phase 10 Google TTS framework: PR #17 → `b7e52fd`.
- Handoff bookkeeping Phase 10: PR #18 → `bb6303a`.
- Phase 9 đợt 6 offline visual/CI: PR #19 → `58f295d`.
- Phase 9 đợt 7 deploy QA prep: branch `agent/deploy-qa-prep`, PR/commit cập nhật sau merge.

## 4. Hệ thống chính

### Smart Review

- `promptStats`: chỉ Easy / Listen / Memory.
- Weakness: `wrong * 2 - correct`.
- Hard/Free không tham gia adaptive Easy.

### Visual

- Twemoji pinned `jdecked/twemoji@17.0.3`.
- Runtime ưu tiên: **local SVG → CDN → emoji**.
- Local manifest: `twemoji-local-manifest.js`.
- Vendor tool: `tools/vendor_twemoji.py` / `tools/vendor_twemoji.bat`.
- Debug: `getGoChuVisualHealth()`.

### Listen

- Phase 4/hotfix: Web Speech chỉ dùng voice `vi-*`.
- Phase 10: MP3 local ưu tiên; Web Speech chỉ fallback.
- Listen và Memory loại trừ nhau.

### Profiles

- Registry: `goChuVer2.profiles.v1`.
- Active: `goChuVer2.activeProfile.v1`.
- Data: `goChuVer2.profile.<profileId>.v1`.
- Profile giữ `promptStats`, `modeStats.hard/free`, study time, topic/level, Memory preferences.

### Vietnamese input

- `goChuVer2.inputGuide.v1` = `off | telex | vni`.
- Progress theo từ, accent-only detection, Telex/VNI chỉ là guide.

## 5. Phase 9 — Ổn định hóa

### Đợt 1 — Smoke test + QA checklist ✅
PR #10 → `36d16dc`.

### Đợt 2 — Audit wrapper + stats Hard/Free ✅
PR #12 → `7d598f2`.

- `RUNTIME_ARCHITECTURE.md` khóa load order + wrapper chain.
- `mode-stats.js` lưu stats Hard/Free riêng theo profile.

### Đợt 3 — Accessibility + keyboard ✅
PR #13 → `94bb3ef`.

- ARIA state/dialog, focus trap, focus restore, inert background.
- Focus-visible + reduced-motion.

### Đợt 4 — Storage audit ✅
PR #14 → `d750722`.

- `storage-health.js` compare-before-write cho profile/registry.
- Không đổi schema/key/version/cadence 15 giây.

### Đợt 5 — Asset reliability + UI fallback ✅
PR #15 → `0e0ce0e`.

- `../IMG` asset chính có fallback emoji/text.
- `ASSET_INVENTORY.md` phân loại asset ngoài repo.

### Đợt 6 — Offline visual framework + CI/static verification ✅
PR #19 → `58f295d`.

Scaffolding ban đầu đã vào `main` trước branch:

- `tools/vendor_twemoji.py` — `c35c53f`.
- `twemoji-local-manifest.js` — `a98d2c5`.
- `OFFLINE_VISUAL.md` — `853541d`.

Có một `BRANCH_MARKER.tmp` tạo nhầm rồi đã xóa ngay; không còn trong tree.

Runtime visual:

```text
1. local SVG theo manifest
2. CDN Twemoji pinned 17.0.3
3. emoji fallback
```

`getGoChuVisualHealth()` trả version, số code, local coverage và nguồn hình hiện tại.

Vendor tool chỉ tải code thực sự dùng và tự sinh lại manifest.

CI `.github/workflows/verify.yml` đã chạy PASS trên PR #19. CI compile Python tools + static verify + Twemoji/TTS dry-run, không gọi Google API và không tải asset mạng thật.

### Đợt 7 — Deploy QA preparation 🟡

Branch: `agent/deploy-qa-prep`.

Files mới:

- `tools/check_deploy_ready.py`.
- `tools/serve_local.bat`.
- `DEPLOY_QA.md`.

CI được mở rộng để compile/chạy deploy readiness report.

#### Local HTTP QA

Windows:

```bat
tools\serve_local.bat
```

Mặc định mở:

```text
http://127.0.0.1:8000/
```

Debug:

```text
http://127.0.0.1:8000/?debug=1
```

Mục đích: test bằng HTTP thật thay vì `file://`, nhất là media/path/cache.

#### Deploy readiness

```bat
py tools\check_deploy_ready.py
```

Report:

- TTS local coverage / tổng `easyWords`;
- Twemoji local coverage / tổng code dùng thực tế;
- 4 Music/UI audio binary;
- dependency `../IMG` của project cha;
- CI/static verifier.

Mặc định warnings không fail CI vì binary đang cố ý chờ người dùng.

Release gate strict:

```bat
py tools\check_deploy_ready.py --strict
```

Chỉ dùng `--strict` khi mục tiêu đã chuyển sang standalone/offline 100%.

Tài liệu `DEPLOY_QA.md` phân biệt:

1. code/runtime ready;
2. fallback-ready;
3. offline/standalone-ready.

## 6. Phase 10 — Pre-rendered Google TTS MP3

Framework đã merge qua PR #17 → `b7e52fd`. Phần còn lại là render và commit MP3 thật.

Runtime:

```text
1. MP3 Google TTS local
2. Web Speech voice tiếng Việt
3. báo thiếu audio
```

Files chính:

- `tts-manifest.js`.
- `tts-local.js`.
- `tools/render_google_tts.py`.
- `tools/setup_google_tts.bat`.
- `tools/render_google_tts.bat`.
- `TTS_RENDERING.md`.

Default renderer:

```text
language: vi-VN
voice: vi-VN-Chirp3-HD-Aoede
speaking rate: 0.82
encoding: MP3
```

MP3 thật chưa có trên remote vì cần Google Cloud project + ADC/billing/quota của người dùng.

## 7. Plan tiếp theo

### Assistant có thể tiếp tục không cần người dùng

1. Merge Phase 9 đợt 7 sau khi CI PASS.
2. Kiểm tra workflow/status sau merge.
3. Static audit mobile CSS/layout và duplicate/dead code risk.
4. Rà repo cho branch/file thừa và dependency docs.
5. Chuẩn bị release checklist cuối trước khi bật strict readiness.

### Việc chờ người dùng

1. Google TTS: chạy setup, nghe sample, chốt voice/rate, render MP3 thật.
2. Twemoji binary: chạy `tools\vendor_twemoji.bat` trên máy có mạng rồi commit SVG nếu muốn offline visual 100%.
3. Bổ sung 4 audio UI/background gốc nếu muốn standalone đầy đủ.

### Sau khi binary hoàn tất

1. `py tools\check_deploy_ready.py --strict` phải PASS.
2. QA `?debug=1` với MP3 + SVG local đầy đủ.
3. Test Network Offline.
4. Test 360×640 / 390×844 / 640×360.
5. Deploy QA thực tế.

## 8. Tồn đọng

- MP3 Google TTS chưa render thật trên remote.
- SVG Twemoji local chưa vendor/commit thật; hiện có local-first framework + CDN/emoji fallback.
- 4 audio binary gốc trong `Music/README.md` chưa có trên remote.
- `../IMG/...` vẫn là dependency ngoài repo, nhưng UI chính đã có fallback.
- Free dropdown thumbnail chưa probe toàn bộ; text option vẫn dùng được khi ảnh thiếu.
- Hai branch thử Phase 2 có thể xóa thủ công.
