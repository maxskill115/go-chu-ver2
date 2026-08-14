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
  - [ ] Offline Twemoji SVG local + deploy QA: để sau, không chặn Phase 10.
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

## 4. Hệ thống chính

### Smart Review

- `promptStats`: chỉ Easy / Listen / Memory.
- Weakness: `wrong * 2 - correct`.
- Hard/Free không tham gia adaptive Easy.

### Visual

- Twemoji SVG pinned `jdecked/twemoji@17.0.3`.
- `visual-prompt.js` có `img.onerror` → emoji fallback.

### Listen

- Phase 4/hotfix: Web Speech chỉ dùng voice `vi-*`, không dùng giọng ngoại ngữ.
- Phase 10: nếu prompt có MP3 local thì **MP3 được ưu tiên**; Web Speech chỉ là fallback.
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
- Không bọc thêm logic học.

### Đợt 4 — Storage audit ✅
PR #14 → `d750722`.

- `storage-health.js` compare-before-write cho profile/registry.
- Không đổi schema/key/version/cadence 15 giây.
- Debug: `getGoChuStorageHealth()`, `printGoChuStorageHealth()`, `goChuStorageMetrics`.

### Đợt 5 — Asset reliability + UI fallback ✅
PR #15 → `0e0ce0e`.

- `ASSET_INVENTORY.md` phân loại `../IMG`, Twemoji CDN, audio binary và navigation project cha.
- `asset-reliability.js/css` giữ asset gốc nếu tải được; thiếu mới fallback emoji/text.
- Không thay audio gốc và không tạo asset giả.
- Debug: `getGoChuAssetHealth()`, `printGoChuAssetHealth()`.

## 6. Phase 10 — Pre-rendered Google TTS MP3

Framework đã merge qua PR #17 → `b7e52fd`. Phần còn lại của Phase 10 là render và commit MP3 thật.

### Mục tiêu

Chất lượng âm đọc chữ/cụm từ không còn phụ thuộc voice tiếng Việt có sẵn trên Windows/Chrome. Mỗi prompt Easy được render sẵn thành **một MP3 riêng**, sau đó web chỉ phát file local.

### Quyết định kiến trúc

Runtime ưu tiên:

```text
1. MP3 Google TTS local
2. Web Speech voice tiếng Việt
3. báo thiếu audio nếu cả hai đều không có
```

Google API chỉ chạy **build-time/local**, không chạy khi bé đang học.

Không lưu Google credential/API key trong repo hoặc browser.

### Files mới

- `tts-manifest.js` — map prompt → MP3; bản committed ban đầu rỗng.
- `tts-local.js` — local MP3 first + Web Speech fallback.
- `TTS_RENDERING.md` — hướng dẫn setup/render.
- `tools/render_google_tts.py` — renderer Google Cloud TTS.
- `tools/requirements-tts.txt`.
- `tools/setup_google_tts.bat`.
- `tools/render_google_tts.bat`.
- `Audio/tts/README.md`.

### Renderer

Nguồn: `data-easy.js` → `easyWords`.

Quy tắc:

- normalize Unicode NFC;
- loại prompt trùng nhưng giữ thứ tự đầu tiên;
- mỗi prompt → `Audio/tts/<sha1-16>.mp3`;
- tên file không dùng trực tiếp tiếng Việt để tránh vấn đề filesystem/URL;
- file có sẵn → SKIP để resume;
- `--force` để render đè;
- `--limit` / `--only` chỉ giới hạn request API của lần chạy;
- manifest sau cùng luôn quét **toàn bộ easyWords + MP3 đang tồn tại**, nên partial render không làm mất entry cũ;
- request lỗi không hủy toàn batch;
- `_sample.mp3` không vào manifest.

Default hiện tại:

```text
language: vi-VN
voice: vi-VN-Chirp3-HD-Aoede
speaking rate: 0.82
encoding: MP3
```

Có thể đổi bằng command line; khi đổi voice/tốc độ cho toàn bộ bộ audio thì dùng `--force`.

### Windows workflow

Setup một lần:

```bat
tools\setup_google_tts.bat
```

Nghe sample:

```bat
tools\render_google_tts.bat --sample "bé đi học"
```

Liệt kê voice:

```bat
tools\render_google_tts.bat --list-voices
```

Render toàn bộ:

```bat
tools\render_google_tts.bat
```

Hoặc test trước 10 câu:

```bat
tools\render_google_tts.bat --limit 10
```

Sau khi render:

```bat
git add Audio\tts tts-manifest.js
git commit -m "audio: render giọng đọc Google TTS"
git push
```

### Runtime `tts-local.js`

- `speakPrompt()` ưu tiên MP3 manifest.
- Nếu file lỗi/404 → đánh dấu missing trong session và fallback Web Speech voice Việt.
- Guard chống `error` + `play()` rejection gọi fallback hai lần.
- `NotAllowedError` do autoplay không bị coi là file missing.
- Chuyển prompt dừng nguồn âm cũ ngay trước khi lên lịch phát prompt mới.
- `setListenMode()` có thể bật chỉ với MP3 local, không bắt buộc máy phải có Web Speech voice Việt.
- Rời Easy → dừng MP3.
- Bật Memory → Listen bị tắt thông qua wrapper hiện có → MP3 dừng.
- `applyAudioLevels()` được bọc để master volume / giảm âm thanh áp dụng cho MP3.
- Status cho biết `MP3 Google TTS` hoặc `Web Speech dự phòng`.
- Settings voice trình duyệt vẫn giữ để làm fallback.

Debug:

```js
getGoChuTtsHealth()
```

### Load order quan trọng

```text
data-easy.js
→ tts-manifest.js
→ ...
→ listen-mode.js
→ ux-hotfix.js
→ tts-local.js
→ memory-mode.js
→ ...
```

Chi tiết wrapper: `RUNTIME_ARCHITECTURE.md`.

### Trạng thái binary

**Chưa có MP3 Google TTS thật trên remote trong commit Phase 10 framework.**

Lý do: renderer cần Google Cloud project + Cloud TTS API + ADC/billing/quota của tài khoản người dùng. Assistant không đưa credential bí mật vào repo.

Khi manifest rỗng, web vẫn chạy bằng Web Speech tiếng Việt như trước nên merge framework không làm hỏng Listen mode.

## 7. Plan tiếp theo

### Ưu tiên ngay — hoàn thiện Google TTS

1. Người dùng chạy `tools\setup_google_tts.bat` trên Windows.
2. Chạy `--list-voices` và nghe sample 2–3 voice nếu muốn so sánh.
3. Chốt voice + speaking rate phù hợp cho bé.
4. Render thử 10 câu, mở web kiểm tra Listen/Nghe lại/volume/Memory.
5. Render toàn bộ `easyWords`.
6. Commit `Audio/tts/*.mp3` + `tts-manifest.js`.
7. Chạy `?debug=1` và `QA_CHECKLIST.md` với manifest đầy đủ.
8. Sau khi coverage MP3 đạt 100%, vẫn giữ Web Speech fallback ít nhất một phase để an toàn.

### Sau TTS

1. Offline Twemoji: chỉ kéo các SVG thực sự dùng trong `promptVisualRules`, không tải cả bộ.
2. Bổ sung 4 audio UI/background gốc nếu có binary nguồn.
3. QA deploy thực tế trên desktop/mobile.
4. Sau khi ổn định mới mở feature roadmap mới.

## 8. Tồn đọng

- MP3 Google TTS chưa render thật trên remote.
- 4 audio binary gốc trong `Music/README.md` chưa có trên remote.
- `../IMG/...` vẫn là dependency ngoài repo, nhưng UI chính đã có fallback.
- Free dropdown thumbnail chưa probe toàn bộ; text option vẫn dùng được khi ảnh thiếu.
- Twemoji vẫn dùng CDN; có emoji fallback nhưng chưa offline SVG 100%.
- Hai branch thử Phase 2 có thể xóa thủ công.
