# Runtime architecture — go-chu-ver2

Tài liệu này ghi **thứ tự nạp module và chuỗi wrapper runtime** để tránh regression khi tiếp tục phát triển.

## Nguyên tắc

- Không đổi thứ tự `<script>` nếu chưa audit lại chuỗi wrapper.
- Module mới không được ghi Hard/Free vào `promptStats` của Easy.
- Nếu cần bọc `showText`, `setMode`, `checkNext`, `setListenMode`, `setMemoryMode`, phải lưu base function trước rồi gọi base đúng một lần, trừ khi tài liệu này ghi rõ module **thay implementation** có chủ đích.
- Module cần hàm được khai báo trong `script.js` (ví dụ `submitFreeAnswer`, `setFreeTarget`) phải nạp **sau `script.js`**.
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
5. `topic-data.js`
6. `script-core.js`
7. `smart-review.js`
8. `visual-prompt.js`
9. `listen-mode.js`
10. `ux-hotfix.js`
11. `tts-local.js`
12. `memory-mode.js`
13. `topic-level.js`
14. `profile-stats.js`
15. `vietnamese-input.js`
16. `vietnamese-dashboard.js`
17. `script.js`
18. `mode-stats.js`
19. `storage-health.js`
20. `asset-reliability.js`
21. `accessibility.js`
22. `debug-smoke.js`

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

`mode-stats.js` không bọc `setMode` vì Hard/Free chỉ cần thống kê khi submit.

### `checkNext`

- `script-core.js`: implementation baseline.
- `smart-review.js`: implementation chính hiện tại cho Easy/Hard; ghi `promptStats` **chỉ Easy**.
- `memory-mode.js`: chặn/điều khiển riêng khi Memory đang active; ngoài Memory gọi base.
- `mode-stats.js`: lớp cuối; với Hard chỉ ghi tổng `modeStats.hard`, sau đó/đồng thời vẫn dùng behavior hiện có.

`vietnamese-input.js` không bọc `checkNext`; nó bọc `showTypingDiff` để nhận diện lỗi dấu.

### `showTypingDiff`

- `script-core.js`: diff Levenshtein baseline.
- `ux-hotfix.js`: thay renderer, giữ thuật toán alignment nhưng bỏ ô đỏ/SP.
- `vietnamese-input.js`: gọi renderer hiện tại rồi thêm phản hồi accent-only nếu phù hợp.

## Listen / Memory / TTS

### Phase 4 + hotfix baseline

- `listen-mode.js` tạo `speakPrompt`, `setListenMode`, `updateListenModeBar`.
- `ux-hotfix.js` sửa Web Speech để chỉ dùng voice `vi-*`; không fallback sang giọng ngoại ngữ.

### Phase 10 — local MP3 first

`tts-local.js` nạp **sau `ux-hotfix.js` và trước `memory-mode.js`**.

Nó thay/bọc có chủ đích:

- `speakPrompt` → ưu tiên MP3 trong `tts-manifest.js`; thiếu MP3 mới gọi implementation Web Speech của UX hotfix.
- `setListenMode` → cho phép bật Listen nếu có **MP3 local hoặc Web Speech voice Việt**; không còn phụ thuộc bắt buộc vào Web Speech khi manifest có dữ liệu.
- `updateListenModeBar` → hiển thị nguồn đang dùng: `MP3 Google TTS` / `Web Speech dự phòng` / thiếu audio.
- `setMode` → dừng MP3 local khi rời Easy.
- `applyAudioLevels` → volume/giảm âm thanh hiện tại áp dụng luôn cho MP3 TTS.

Sau đó:

- `memory-mode.js` bọc `setListenMode`: bật Listen thì tắt Memory và ngược lại.
- `vietnamese-input.js` bọc `setListenMode`: refresh Telex/VNI guide.
- `memory-mode.js` tạo/bọc `setMemoryMode`; `vietnamese-input.js` bọc tiếp để refresh guide.

Invariant bắt buộc:

- Listen và Memory không được active cùng lúc.
- Khi rời Easy, cả Web Speech và MP3 local phải dừng.
- `speakPrompt` không được phát chồng MP3 + Web Speech.
- MP3 lỗi file/404 → đánh dấu missing trong session rồi fallback Web Speech voice Việt nếu có.
- `NotAllowedError` do autoplay không được coi là file MP3 bị thiếu.

### TTS manifest/build

`tts-manifest.js` được nạp sớm sau `data-easy.js` và mặc định có map rỗng.

Build-time tool:

```text
tools/render_google_tts.py
```

- đọc `easyWords`;
- loại prompt trùng;
- render Google Cloud TTS thành `Audio/tts/<sha1-16>.mp3`;
- sinh lại `tts-manifest.js`;
- credential chỉ tồn tại ở môi trường build/local qua Google ADC;
- browser không gọi Google API.

Tài liệu: `TTS_RENDERING.md`.

Debug: `getGoChuTtsHealth()`.

### Profile/storage

- `profile-stats.js` route `promptStats`, topic/level, Memory settings và study time vào profile active.
- `vietnamese-dashboard.js` chỉ mở rộng dashboard với `accentErrors`.
- `mode-stats.js` mở rộng schema profile bằng `modeStats.hard/free`; không sửa `promptStats`.
- `storage-health.js` nạp sau `mode-stats.js`, vì serialization phải đi qua final `normalizeProfileData` đã biết `modeStats`.

## Hard / Free stats

`mode-stats.js` nạp sau `script.js` vì Free functions được khai báo trong `script.js`.

- Hard: sai nhiều lần cùng prompt chỉ tính tối đa **1 sai**; giải đúng tính **1 đúng**.
- Free: sai nhiều lần cùng target chỉ tính tối đa **1 sai**; hoàn thành đúng tính **1 đúng**.
- Hard/Free không tham gia `getPromptWeakness`, Smart Review, topic Auto level hay adaptive Easy.
- Dashboard tổng quan cộng Easy + Hard + Free; phần **Cần ôn** và **Lỗi dấu** vẫn là dữ liệu Easy.

## Storage health layer

`storage-health.js` chỉ thay implementation persistence của `saveProfileData` và `saveProfilesRegistry` bằng compare-before-write.

Quy tắc an toàn:

- vẫn gọi final `normalizeProfileData`;
- luôn đọc current `localStorage` trước khi skip, không dùng stale memory cache;
- không thay cadence study timer 15 giây;
- không debounce prompt result save;
- không đổi key/schema/version.

Debug:

- `getGoChuStorageHealth()`;
- `printGoChuStorageHealth()`;
- `goChuStorageMetrics`.

## Asset reliability layer

`asset-reliability.js` không bọc logic học và không thay đường dẫn asset gốc.

Nó chỉ probe các UI asset `../IMG/...` đang quan trọng/đang hiển thị:

- title icon;
- 3 mode icons;
- Free action icon;
- icon bài Tự do đang hiển thị ở selector/practice.

Behavior:

- tải được → giữ background image gốc;
- lỗi → `.go-chu-asset-missing` + fallback emoji/text từ `asset-reliability.css`;
- cache probe theo URL để tránh request trùng;
- với Free poem icon, MutationObserver theo dõi URL thay đổi;
- async probe có token để response URL cũ không ghi đè state URL mới;
- không probe toàn bộ 57 thumbnail bài Free cùng lúc.

Twemoji Phase 3 không đi qua module này vì `visual-prompt.js` đã có `img.onerror` → emoji fallback.

Debug:

- `getGoChuAssetHealth()`;
- `printGoChuAssetHealth()`.

Inventory chi tiết: `ASSET_INVENTORY.md`.

## Accessibility layer

`accessibility.js` nạp sau các module UI chính và không ghi đè hàm học.

Nó chỉ:

- đồng bộ `aria-expanded`, `aria-hidden`, `aria-controls`;
- gắn role/dialog semantics cho game selector;
- tạo focus trap cho profile dashboard và game selector;
- trả focus về nút mở khi dialog đóng;
- đặt background `inert` khi modal mở;
- bổ sung `aria-live` cho result/status;
- hỗ trợ `prefers-reduced-motion` qua `accessibility.css`.

## Khi thêm module mới

Trước khi merge:

1. Xác định hàm nào bị bọc/thay.
2. Đặt module ở đúng vị trí load order.
3. Không gọi base hai lần trừ implementation replacement đã được tài liệu hóa.
4. Không tạo vòng `A -> B -> A`.
5. Chạy `runGoChuSmokeTests()`.
6. Test Easy / Hard / Free / Listen / Memory / chuyển profile.
7. Test Listen ở cả 3 trạng thái: có MP3, thiếu MP3 nhưng có voice Việt, không có cả hai.
8. Test volume/giảm âm thanh với MP3 đang phát.
9. Test keyboard-only: Tab/Shift+Tab/Escape ở dashboard + game selector.
10. Với storage: test export/import/reset profile và no-op write skip.
11. Với asset: test cả khi `../IMG` có và không có; fallback không được làm đổi layout lớn.
12. Cập nhật tài liệu này và `HANDOFF.md` nếu chuỗi/load order thay đổi.
