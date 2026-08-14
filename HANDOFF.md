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
  - [ ] Tiếp theo: offline visual tùy chọn + deploy QA.

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
- Phase 9 đợt 5 asset reliability: branch `agent/phase9-asset-reliability`, PR/commit cập nhật sau merge.

## 4. Hệ thống chính

### Smart Review
- `promptStats`: chỉ Easy / Listen / Memory.
- Weakness: `wrong * 2 - correct`.
- Hard/Free không tham gia adaptive Easy.

### Visual
- Twemoji SVG pinned `jdecked/twemoji@17.0.3`.
- `visual-prompt.js` đã có `img.onerror` → emoji fallback.

### Listen
- Chỉ voice `vi-*`, speech rate `0.76`.
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
- Không dùng stale memory cache để quyết định skip.
- Debug: `getGoChuStorageHealth()`, `printGoChuStorageHealth()`, `goChuStorageMetrics`.

### Đợt 5 — Asset reliability + UI fallback ✅
Branch: `agent/phase9-asset-reliability`.

Files:

- `asset-reliability.js`.
- `asset-reliability.css`.
- `ASSET_INVENTORY.md`.
- `styles.css`.
- `index.html`.
- `debug-smoke.js`.
- `QA_CHECKLIST.md`.
- `RUNTIME_ARCHITECTURE.md`.
- `HANDOFF.md`.

#### Audit asset

`../IMG/...` hiện là dependency của project cha, chưa nằm trong repo này:

- favicon `Icon_133.png`;
- title `Icon_135.png`;
- mode icons `Icon_62.png`, `Icon_70.png`, `Icon_66.png`;
- Free action `gochu_tudo (58).png`;
- Free poem icons `gochu_tudo (1..57).png`.

Audio binary cũng chưa có trong repo; `Music/README.md` ghi lại 4 file gốc và code giữ nguyên đường dẫn.

Twemoji CDN là nhóm khác: Phase 3 đã có emoji fallback nên không cần probe lại.

Inventory đầy đủ: `ASSET_INVENTORY.md`.

#### Runtime fallback

`asset-reliability.js` nạp sau storage layer, trước accessibility/debug và **không bọc logic học**.

Probe UI chính:

- title;
- Easy / Hard / Free mode icons;
- Free action icon;
- icon bài Tự do đang hiển thị.

Nếu asset tải được → giữ nguyên ảnh gốc.

Nếu lỗi → CSS hiện fallback:

- title `⌨️`;
- Easy `🔤`;
- Hard `🧠`;
- Free `✍️`;
- Free poem `📖`.

Quyết định kỹ thuật:

- không tạo ảnh thay thế giả;
- không đổi đường dẫn asset gốc;
- không probe toàn bộ 57 thumbnail cùng lúc;
- cache probe Promise theo URL để tránh request trùng;
- probe async dùng token để kết quả icon cũ không ghi đè icon mới khi đổi bài;
- favicon thiếu không ảnh hưởng chức năng nên chưa can thiệp;
- navigation `../main.html`, `../toán chơi.html`, ... không sửa vì đó là integration project cha, không phải asset.

Debug:

```js
getGoChuAssetHealth()
printGoChuAssetHealth()
```

Smoke tests kiểm tra:

- asset health API;
- số probe được đăng ký;
- `ok + missing + pending = total`;
- mọi UI probe có fallback;
- mọi Twemoji rule có `code` + emoji fallback.

## 6. Plan tiếp theo

1. Nếu muốn **offline 100% visual**, lấy danh sách `code` duy nhất từ `promptVisualRules` và chỉ đưa các SVG đang dùng về repo; không tải cả Twemoji.
2. Audio: chờ binary gốc/upload phù hợp; không thay bằng nhạc khác.
3. Nếu có URL deploy thực tế, chạy `?debug=1` + `QA_CHECKLIST.md` trên deploy.
4. Kiểm tra layout fallback trên 360×640 / 390×844 / 640×360.
5. Sau khi Phase 9 ổn định mới mở roadmap feature mới để tránh chồng module không cần thiết.

## 7. Tồn đọng

- 4 audio binary gốc chưa có trên remote.
- `../IMG/...` vẫn là dependency ngoài repo, nhưng UI chính đã có fallback.
- Free dropdown thumbnail chưa probe toàn bộ; text option vẫn dùng được khi ảnh thiếu.
- Twemoji vẫn dùng CDN, nhưng đã có emoji fallback; chưa offline SVG 100%.
- Hai branch thử Phase 2 có thể xóa thủ công.
