# Runtime architecture — go-chu-ver2

Tài liệu này ghi **thứ tự nạp module và chuỗi wrapper runtime** để tránh regression khi tiếp tục phát triển.

## Nguyên tắc

- Không đổi thứ tự `<script>` nếu chưa audit lại chuỗi wrapper.
- Module mới không được ghi Hard/Free vào `promptStats` của Easy.
- Nếu cần bọc `showText`, `setMode`, `checkNext`, `setListenMode`, `setMemoryMode`, phải lưu base function trước rồi gọi base đúng một lần, trừ khi tài liệu này ghi rõ module **thay implementation** có chủ đích.
- Module cần hàm được khai báo trong `script.js` phải nạp **sau `script.js`**.
- Module storage chỉ được thay cách persistence tương đương, không đổi schema/cadence học.
- Module asset không thay asset gốc; chỉ probe/fallback khi asset lỗi.
- Module accessibility không được bọc logic học; chỉ quan sát DOM/trạng thái UI.
- Google credential/API key không được đưa vào browser/runtime.
- Debug/smoke-test nạp cuối cùng và không thay đổi hành vi học.

## Load order hiện tại

1. `data-easy.js`
2. `tts-manifest.js`
3. `data-poems.js`
4. `visual-data.js`
5. `twemoji-local-manifest.js`
6. `topic-data.js`
7. `script-core.js`
8. `smart-review.js`
9. `visual-prompt.js`
10. `listen-mode.js`
11. `ux-hotfix.js`
12. `tts-local.js`
13. `memory-mode.js`
14. `topic-level.js`
15. `profile-stats.js`
16. `vietnamese-input.js`
17. `vietnamese-dashboard.js`
18. `script.js`
19. `mode-stats.js`
20. `storage-health.js`
21. `asset-reliability.js`
22. `accessibility.js`
23. `debug-smoke.js`

## Chuỗi chức năng chính

### `showText`

- `script-core.js`: implementation gốc.
- `smart-review.js`: reset cờ sai của prompt + cập nhật thanh Ôn lại.
- `visual-prompt.js`: cập nhật ảnh minh họa.
- `listen-mode.js`: áp dụng trạng thái che chữ + đọc prompt nếu Listen đang bật.
- `memory-mode.js`: bắt đầu countdown/che chữ Memory.
- `topic-level.js`: cập nhật thanh chủ đề/cấp độ.
- `vietnamese-input.js`: reset accent guard + render progress theo từ + Telex/VNI guide.
- `mode-stats.js`: reset guard thống kê Hard cho prompt mới.

Phase 10 không bọc `showText`; nó thay `speakPrompt`, nên mọi lời gọi đọc từ wrapper Listen tự đi qua local MP3 first.

### `setMode`

- `script-core.js`: đổi Easy/Hard/Free và panel.
- `smart-review.js`: thoát Smart Review khi rời Easy.
- `listen-mode.js`: tắt Listen/Web Speech khi rời Easy.
- `tts-local.js`: bọc thêm để dừng MP3 local khi rời Easy.
- `memory-mode.js`: dọn timer/Memory khi rời Easy.
- `topic-level.js`: cập nhật UI chủ đề/cấp độ.
- `vietnamese-input.js`: refresh progress/guide.

### `checkNext`

- `script-core.js`: implementation baseline.
- `smart-review.js`: implementation chính hiện tại cho Easy/Hard; ghi `promptStats` **chỉ Easy**.
- `memory-mode.js`: chặn/điều khiển riêng khi Memory đang active; ngoài Memory gọi base.
- `mode-stats.js`: lớp cuối; với Hard chỉ ghi tổng `modeStats.hard`.

### `showTypingDiff`

- `script-core.js`: diff Levenshtein baseline.
- `ux-hotfix.js`: thay renderer, giữ thuật toán alignment nhưng bỏ ô đỏ/SP.
- `vietnamese-input.js`: gọi renderer hiện tại rồi thêm phản hồi accent-only nếu phù hợp.

## Visual — CDN / local / emoji

`visual-data.js` giữ mapping và CDN pinned `jdecked/twemoji@17.0.3`.

`twemoji-local-manifest.js` nạp **sau `visual-data.js` và trước `visual-prompt.js`**. Manifest mặc định rỗng để repo vẫn hoạt động trước khi vendor SVG.

`visual-prompt.js` dùng thứ tự:

```text
1. assets/twemoji/<code>.svg nếu local manifest có code
2. CDN pinned Twemoji 17.0.3
3. emoji fallback của rule
```

Nếu local file đã được khai báo nhưng lỗi/404, runtime chỉ thử CDN **một lần** rồi mới xuống emoji. Prompt không có mapping vẫn không chừa khoảng trống.

Build tool:

```text
tools/vendor_twemoji.py
tools/vendor_twemoji.bat
```

Tool:

- đọc các `code` duy nhất từ `visual-data.js`;
- không tải toàn bộ Twemoji;
- lưu `assets/twemoji/<code>.svg`;
- sinh lại `twemoji-local-manifest.js` từ các file thực sự tồn tại;
- file có sẵn được skip, `--force` để tải đè;
- `--dry-run` không cần network.

Debug runtime:

```js
getGoChuVisualHealth()
```

Tài liệu: `OFFLINE_VISUAL.md`.

## Listen / Memory / TTS

### Phase 4 + hotfix baseline

- `listen-mode.js` tạo `speakPrompt`, `setListenMode`, `updateListenModeBar`.
- `ux-hotfix.js` sửa Web Speech để chỉ dùng voice `vi-*`; không fallback sang giọng ngoại ngữ.

### Phase 10 — local MP3 first

`tts-local.js` nạp **sau `ux-hotfix.js` và trước `memory-mode.js`**.

Nó thay/bọc có chủ đích:

- `speakPrompt` → ưu tiên MP3 trong `tts-manifest.js`; thiếu MP3 mới gọi Web Speech tiếng Việt.
- `setListenMode` → cho phép bật Listen nếu có MP3 local hoặc Web Speech voice Việt.
- `updateListenModeBar` → hiển thị nguồn âm.
- `setMode` → dừng MP3 local khi rời Easy.
- `applyAudioLevels` → volume/giảm âm thanh áp dụng luôn cho MP3 TTS.

Invariant:

- Listen và Memory không active cùng lúc.
- Khi rời Easy, cả Web Speech và MP3 local phải dừng.
- Không phát chồng MP3 + Web Speech.
- MP3 lỗi file/404 → fallback Web Speech tiếng Việt nếu có.
- `NotAllowedError` autoplay không được coi là file missing.

Build tool: `tools/render_google_tts.py`.
Tài liệu: `TTS_RENDERING.md`.
Debug: `getGoChuTtsHealth()`.

## Profile/storage

- `profile-stats.js` route `promptStats`, topic/level, Memory settings và study time vào profile active.
- `vietnamese-dashboard.js` mở rộng dashboard với `accentErrors`.
- `mode-stats.js` mở rộng schema profile bằng `modeStats.hard/free`; không sửa `promptStats`.
- `storage-health.js` nạp sau `mode-stats.js`, vì serialization phải đi qua final `normalizeProfileData`.

## Hard / Free stats

- Hard: sai nhiều lần cùng prompt chỉ tính tối đa 1 sai; giải đúng tính 1 đúng.
- Free: sai nhiều lần cùng target chỉ tính tối đa 1 sai; hoàn thành đúng tính 1 đúng.
- Hard/Free không tham gia Smart Review, topic Auto level hay adaptive Easy.

## Storage health layer

`storage-health.js` dùng compare-before-write cho profile/registry, không đổi key/schema/version/cadence 15 giây.

Debug:

- `getGoChuStorageHealth()`;
- `printGoChuStorageHealth()`;
- `goChuStorageMetrics`.

## Asset reliability layer

`asset-reliability.js` chỉ probe các UI asset `../IMG/...` chính và fallback emoji/text nếu lỗi. Twemoji không đi qua module này vì có pipeline riêng local → CDN → emoji.

Debug:

- `getGoChuAssetHealth()`;
- `printGoChuAssetHealth()`.

Inventory: `ASSET_INVENTORY.md`.

## Accessibility layer

`accessibility.js` không ghi đè hàm học; chỉ đồng bộ ARIA, focus trap/restore, inert background, aria-live và reduced-motion.

## CI / static verification

`.github/workflows/verify.yml` chạy trên PR và push `main`:

1. compile Python tools;
2. `python tools/verify_repository.py`;
3. `python tools/vendor_twemoji.py --dry-run`;
4. `python tools/render_google_tts.py --dry-run --limit 5`.

`tools/verify_repository.py` không cần browser/network và kiểm tra:

- mọi `<script src>` local trong `index.html` tồn tại;
- load order các module quan trọng;
- Twemoji rule/code và local manifest;
- local manifest không trỏ tới SVG thiếu;
- TTS manifest có provider marker và không chứa chuỗi giống Google API key phổ biến;
- các build/verify tools bắt buộc tồn tại.

CI không gọi Google Cloud API và không tải Twemoji thật.

## Khi thêm module mới

Trước khi merge:

1. Xác định hàm nào bị bọc/thay.
2. Đặt module đúng load order.
3. Không gọi base hai lần trừ implementation replacement đã được tài liệu hóa.
4. Không tạo vòng `A -> B -> A`.
5. Chạy `runGoChuSmokeTests()`.
6. Chạy `python tools/verify_repository.py`.
7. Test Easy / Hard / Free / Listen / Memory / chuyển profile.
8. Test visual ở 3 trạng thái: local SVG, CDN fallback, emoji fallback.
9. Test Listen: MP3 local, Web Speech fallback, thiếu cả hai.
10. Test keyboard-only ở dashboard/game selector.
11. Test storage export/import/reset.
12. Cập nhật tài liệu này và `HANDOFF.md` nếu chuỗi/load order thay đổi.
