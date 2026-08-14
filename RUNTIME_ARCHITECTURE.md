# Runtime architecture — go-chu-ver2

Tài liệu này ghi **thứ tự nạp module và chuỗi wrapper runtime** để tránh regression khi tiếp tục phát triển.

## Nguyên tắc

- Không đổi thứ tự `<script>` nếu chưa audit lại chuỗi wrapper.
- Module mới không được ghi Hard/Free vào `promptStats` của Easy.
- Nếu cần bọc `showText`, `setMode`, `checkNext`, `setListenMode`, `setMemoryMode`, phải lưu base function trước rồi gọi base đúng một lần.
- Module cần hàm được khai báo trong `script.js` (ví dụ `submitFreeAnswer`, `setFreeTarget`) phải nạp **sau `script.js`**.
- Module storage chỉ được thay cách persistence tương đương, không đổi schema/cadence học.
- Module accessibility không được bọc logic học; chỉ quan sát DOM/trạng thái UI.
- Debug/smoke-test nạp cuối cùng và không thay đổi hành vi học.

## Load order hiện tại

1. `data-easy.js`
2. `data-poems.js`
3. `visual-data.js`
4. `topic-data.js`
5. `script-core.js`
6. `smart-review.js`
7. `visual-prompt.js`
8. `listen-mode.js`
9. `ux-hotfix.js`
10. `memory-mode.js`
11. `topic-level.js`
12. `profile-stats.js`
13. `vietnamese-input.js`
14. `vietnamese-dashboard.js`
15. `script.js`
16. `mode-stats.js`
17. `storage-health.js`
18. `accessibility.js`
19. `debug-smoke.js`

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

Mỗi wrapper gọi base đúng **một lần**.

### `setMode`

- `script-core.js`: đổi Easy/Hard/Free và panel.
- `smart-review.js`: thoát Smart Review khi rời Easy.
- `listen-mode.js`: tắt speech khi rời Easy.
- `memory-mode.js`: dọn timer/Memory khi rời Easy.
- `topic-level.js`: cập nhật UI chủ đề/cấp độ.
- `vietnamese-input.js`: refresh progress/guide.

`mode-stats.js` không bọc `setMode` vì Hard/Free chỉ cần thống kê khi submit.

### `checkNext`

- `script-core.js`: implementation baseline.
- `smart-review.js`: implementation chính hiện tại cho Easy/Hard; ghi `promptStats` **chỉ Easy**.
- `memory-mode.js`: chặn/điều khiển riêng khi Memory đang active; ngoài Memory gọi base.
- `mode-stats.js`: lớp cuối; với Hard chỉ ghi tổng `modeStats.hard`, sau đó/đồng thời vẫn dùng behavior hiện có.

`vietnamese-input.js` **không bọc `checkNext`**; nó bọc `showTypingDiff` để nhận diện lỗi dấu.

### `showTypingDiff`

- `script-core.js`: diff Levenshtein baseline.
- `ux-hotfix.js`: thay renderer, giữ thuật toán alignment nhưng bỏ ô đỏ/SP.
- `vietnamese-input.js`: gọi renderer hiện tại rồi thêm phản hồi accent-only nếu phù hợp.

### Listen / Memory

- `listen-mode.js` tạo `setListenMode`.
- `ux-hotfix.js` bọc `setListenMode` để yêu cầu voice `vi-*`.
- `memory-mode.js` bọc `setListenMode`: bật Listen thì tắt Memory.
- `vietnamese-input.js` bọc `setListenMode`: refresh guide.
- `memory-mode.js` tạo/bọc `setMemoryMode`; `vietnamese-input.js` bọc tiếp để refresh guide.

Invariant bắt buộc: **Listen và Memory không được active cùng lúc**.

### Profile/storage

- `profile-stats.js` route `promptStats`, topic/level, Memory settings và study time vào profile active.
- `vietnamese-dashboard.js` chỉ mở rộng dashboard với `accentErrors`.
- `mode-stats.js` mở rộng schema profile bằng `modeStats.hard/free`; không sửa `promptStats`.
- `storage-health.js` nạp sau `mode-stats.js`, vì serialization phải đi qua **final `normalizeProfileData`** đã biết `modeStats`.

## Hard / Free stats

`mode-stats.js` nạp sau `script.js` vì Free functions được khai báo trong `script.js`.

- Hard: sai nhiều lần cùng prompt chỉ tính tối đa **1 sai**; giải đúng tính **1 đúng**.
- Free: sai nhiều lần cùng target chỉ tính tối đa **1 sai**; hoàn thành đúng tính **1 đúng**.
- Hard/Free không tham gia `getPromptWeakness`, Smart Review, topic Auto level hay adaptive Easy.
- Dashboard tổng quan cộng Easy + Hard + Free; phần **Cần ôn** và **Lỗi dấu** vẫn là dữ liệu Easy.

## Storage health layer

`storage-health.js` chỉ thay implementation persistence của:

- `saveProfileData(profileId, data)`;
- `saveProfilesRegistry()`.

Behavior dữ liệu giữ nguyên, nhưng trước `localStorage.setItem` sẽ so sánh serialized value hiện có:

- giống hệt → skip write;
- khác → write bình thường.

Quy tắc an toàn:

- vẫn gọi final `normalizeProfileData`, nên `promptStats`, `modeStats`, study và preferences không mất field;
- không cache quyết định write trong memory — luôn đọc current `localStorage` trước khi skip, nên import/reset/remove key không bị stale cache;
- không thay cadence study timer 15 giây;
- không debounce prompt result save;
- không đổi key/schema/version.

Debug helpers:

- `getGoChuStorageHealth()` — trả số key, profile, dung lượng UTF-8 ước tính và top key lớn nhất;
- `printGoChuStorageHealth()` — in report ra Console;
- `goChuStorageMetrics` — đếm writes/skips/errors kể từ khi module load.

## Accessibility layer

`accessibility.js` nạp sau các module UI chính và **không ghi đè hàm học**.

Nó chỉ:

- đồng bộ `aria-expanded`, `aria-hidden`, `aria-controls`;
- gắn role/dialog semantics cho game selector;
- tạo focus trap cho profile dashboard và game selector;
- trả focus về nút mở khi dialog đóng;
- đặt background `inert` khi modal đang mở;
- bổ sung `aria-live` cho result/status;
- hỗ trợ `prefers-reduced-motion` qua `accessibility.css`.

## Khi thêm module mới

Trước khi merge:

1. Xác định hàm nào bị bọc/thay.
2. Đặt module ở đúng vị trí load order.
3. Không gọi base hai lần.
4. Không tạo vòng `A -> B -> A`.
5. Chạy `runGoChuSmokeTests()`.
6. Test Easy / Hard / Free / Listen / Memory / chuyển profile.
7. Test keyboard-only: Tab/Shift+Tab/Escape ở dashboard + game selector.
8. Với storage: test export/import/reset profile và no-op write skip.
9. Cập nhật tài liệu này và `HANDOFF.md` nếu chuỗi wrapper thay đổi.
