# QA CHECKLIST — go-chu-ver2

Checklist này dùng sau mỗi phase lớn hoặc trước khi deploy bản mới.

## 1. Khởi động

- [ ] Trang mở không có lỗi JavaScript trong Console.
- [ ] Mặc định vào mode Đơn giản.
- [ ] Prompt xuất hiện và input focus được.
- [ ] Đồng hồ HUD chạy.
- [ ] Nút ☰ / 👤 / ⚙ không chồng nhau trên desktop và mobile.

## 2. Đơn giản — học thường

- [ ] Random không chạy tuần tự theo nhóm `con ...`.
- [ ] Topic + level filter đúng.
- [ ] Từ hiện tại underline nhẹ; từ đã đúng được đánh dấu nhẹ.
- [ ] Gõ đúng → âm đúng + prompt tiếp theo.
- [ ] Gõ sai → feedback gọn, không có hàng ô đỏ và không có `SP`.
- [ ] Thiếu một ký tự ở giữa không làm cả phần sau báo sai.
- [ ] Sai dấu kiểu `meo` thay vì `mèo` → có hint lỗi dấu.

## 3. Smart Review

- [ ] Sai một prompt nhiều lần trong cùng lượt chỉ tăng weak prompt theo rule Phase 2, không phình vô hạn.
- [ ] Thanh Ôn lại xuất hiện khi có prompt yếu.
- [ ] Vào Ôn lại chỉ lấy prompt phù hợp filter hiện tại.
- [ ] Hết lượt ôn quay về học thường.

## 4. Ảnh minh họa

- [ ] Prompt có mapping hiện hình.
- [ ] Prompt không mapping không chừa khoảng trống.
- [ ] Mất mạng/SVG lỗi → fallback emoji.
- [ ] Hình không đẩy input ra khỏi viewport mobile landscape thấp.

## 5. Nghe rồi gõ / Google TTS MP3

### Khi manifest còn rỗng

- [ ] Web vẫn chạy bằng Web Speech tiếng Việt như Phase 4/hotfix.
- [ ] Chỉ dùng voice `vi-*`; không fallback sang voice ngoại ngữ.

### Khi đã render MP3

- [ ] Prompt có mapping MP3 → ưu tiên phát `Audio/tts/*.mp3`, không phát Web Speech đồng thời.
- [ ] Status hiển thị `MP3 Google TTS` và voice từ manifest.
- [ ] Prompt thiếu MP3 → fallback đúng sang Web Speech voice Việt nếu máy có.
- [ ] Prompt thiếu MP3 + máy không có voice Việt → báo rõ, không đọc sai ngôn ngữ.
- [ ] File MP3 404/lỗi → chỉ đánh dấu missing trong session và fallback, không crash.
- [ ] `NotAllowedError` do autoplay không bị ghi nhầm thành file missing.
- [ ] `Nghe lại` dừng audio cũ rồi phát lại từ đầu, không chồng 2 nguồn.
- [ ] Prompt mới tự dừng prompt cũ rồi đọc prompt mới.
- [ ] Rời mode Đơn giản → MP3 local dừng ngay.
- [ ] Bật Memory → Listen tắt và MP3 local dừng.
- [ ] Thanh âm lượng và `Giảm âm thanh` thay đổi volume MP3 TTS đang phát.
- [ ] Settings ghi rõ Web Speech voice chỉ là dự phòng khi có MP3 local.
- [ ] Telex/VNI guide tự ẩn để không lộ đáp án.
- [ ] `getGoChuTtsHealth()` chạy không lỗi và `manifestCount` khớp `GO_CHU_TTS_META.count`.

## 6. Nhớ rồi gõ

- [ ] Chọn đúng 2 / 3 / 4 từ.
- [ ] Chọn 3 / 5 / 7 giây.
- [ ] Trong thời gian nhìn: input + Tiếp theo bị khóa.
- [ ] Hết giờ: chữ bị che, input mở và focus.
- [ ] Hình vẫn hiện.
- [ ] Memory và Listen không bật cùng lúc.
- [ ] Telex/VNI guide tự ẩn trong toàn bộ Memory mode.

## 7. Chủ đề + cấp độ

- [ ] `mặt trời` thuộc Thiên nhiên, không bị vào Cơ thể.
- [ ] `màu cam` thuộc Màu sắc, không bị vào Đồ ăn.
- [ ] `quả cam` thuộc Đồ ăn.
- [ ] Topic mới không có level đã khóa → fallback Auto.
- [ ] Auto level không vượt 1–4 từ.
- [ ] Mobile select không tràn chiều ngang.

## 8. Hồ sơ bé

- [ ] Lần đầu nâng cấp tự tạo Bé 1 và giữ stats cũ.
- [ ] Thêm Bé 2 → stats rỗng, không copy nhầm Bé 1.
- [ ] Đổi tên hồ sơ.
- [ ] Chuyển hồ sơ → topic/level/Memory preferences đổi theo bé.
- [ ] Prompt weak của Bé 1 không xuất hiện trong stats Bé 2.
- [ ] Hard/Free stats của Bé 1 không xuất hiện trong Bé 2.
- [ ] Không xóa được hồ sơ cuối cùng.
- [ ] Reset chỉ xóa tiến độ hồ sơ đang active.
- [ ] Thời gian hôm nay/tổng tăng đúng hồ sơ active.
- [ ] Export JSON chứa cả `promptStats` và `modeStats`.
- [ ] Import JSON có confirm và phục hồi đủ hồ sơ.

## 9. Dashboard

- [ ] Tổng đúng/sai/accuracy = Easy + Hard + Free.
- [ ] Mục **Theo chế độ** hiển thị riêng Đơn giản / Nâng cao / Tự do.
- [ ] `Cần ôn` vẫn chỉ dựa trên Easy.
- [ ] Top 10 weak prompt hiển thị đúng.
- [ ] Topic stats không lỗi khi prompt thuộc nhiều topic.
- [ ] `Lỗi dấu` tăng khi sai accent-only.
- [ ] Dashboard scroll được trên mobile.
- [ ] Đóng bằng × / click nền / Escape.

## 10. Telex / VNI

- [ ] Mặc định Tắt.
- [ ] Telex: `bé → bes`.
- [ ] Telex: `mèo → meof`.
- [ ] Telex: `tiếng → tieengs`.
- [ ] VNI: `bé → be1`.
- [ ] VNI: `chữ → chu74`.
- [ ] Khi dùng IME thật, composition không làm progress nhấp nháy/sai liên tục.
- [ ] Guide không tự sửa text input.

## 11. Nâng cao / Tự do

- [ ] Chuyển Nâng cao không còn UI phụ chỉ dành Easy.
- [ ] Nâng cao vẫn gõ/check đúng như baseline.
- [ ] Một prompt Nâng cao sai nhiều lần chỉ tăng tối đa 1 `wrong`; đúng tăng 1 `correct`.
- [ ] Tự do vẫn chọn bài/custom text, nộp bài và next bình thường.
- [ ] Một target Tự do sai nhiều lần chỉ tăng tối đa 1 `wrong`; hoàn thành đúng tăng 1 `correct`.
- [ ] Hard/Free không xuất hiện trong Smart Review hoặc Auto level Easy.
- [ ] Profile/dashboard không làm vỡ Free mode.

## 12. Accessibility / keyboard

- [ ] Nút ⚙ có `aria-controls=settingsPanel` và `aria-expanded` đúng trạng thái.
- [ ] Nút ☰ có `aria-controls=game-selector-overlay` và `aria-expanded` đúng trạng thái.
- [ ] Nút 👤 có `aria-controls=profileDashboardOverlay` và `aria-expanded` đúng trạng thái.
- [ ] `result` có `aria-live="polite"`.
- [ ] Game selector và profile dashboard có `role="dialog"` + `aria-modal="true"`.
- [ ] Mở dashboard → focus vào nút đóng.
- [ ] Mở game selector → focus vào nút đầu tiên.
- [ ] Tab / Shift+Tab không thoát khỏi modal đang mở.
- [ ] Đóng modal → focus quay về nút đã mở modal.
- [ ] Background không nhận focus khi modal mở (`inert`).
- [ ] Escape vẫn đóng được dashboard / game selector.
- [ ] `prefers-reduced-motion: reduce` làm animation/transition gần như tắt.

## 13. Storage / backup

- [ ] `getGoChuStorageHealth()` chạy không lỗi và trả `totalKB`, `largestKeys`, metrics.
- [ ] Hai `saveProfileData` giống nhau liên tiếp → lần sau tăng `profileWriteSkips`.
- [ ] `saveProfilesRegistry()` khi registry không đổi → tăng `registryWriteSkips`.
- [ ] Gõ đúng/sai vẫn ghi stats ngay, không bị dedupe nhầm.
- [ ] Study time vẫn flush khoảng 15 giây như trước.
- [ ] Reset/import không bị stale cache phục hồi dữ liệu cũ.
- [ ] Export → reset/import → `promptStats`, `modeStats`, study và preferences phục hồi đủ.
- [ ] `goChuStorageMetrics.writeErrors` giữ 0 trong sử dụng bình thường.

## 14. Asset reliability / offline fallback

- [ ] Khi `../IMG` tồn tại: title/mode/free icons giữ nguyên ảnh gốc, không hiện emoji đè lên.
- [ ] Khi `../IMG` không tồn tại: title fallback `⌨️`, Easy `🔤`, Hard `🧠`, Free `✍️`.
- [ ] Nút dùng đoạn tự nhập fallback `✍️` nếu icon gốc thiếu.
- [ ] Icon bài Tự do đang chọn fallback `📖` khi `gochu_tudo (...).png` thiếu.
- [ ] Đổi bài Tự do nhiều lần không để response asset cũ ghi đè icon mới.
- [ ] Không tạo hàng chục request cho toàn bộ 57 thumbnail khi chỉ mở trang.
- [ ] `getGoChuAssetHealth()` trả `ok + missing + pending = total`.
- [ ] Mọi UI probe có fallback không rỗng.
- [ ] Twemoji CDN mất mạng → visual prompt chuyển emoji như Phase 3.
- [ ] Audio thiếu không làm crash logic đúng/sai.
- [ ] Không sửa các link navigation `../main.html`, `../toán chơi.html`, ... trong đợt asset.

## 15. Google TTS renderer — build-time

- [ ] `py tools\render_google_tts.py --dry-run` đọc được toàn bộ `easyWords`, không cần credential.
- [ ] Prompt trùng được loại khỏi batch.
- [ ] Tên MP3 là SHA-1 rút gọn, ổn định giữa các lần chạy.
- [ ] `--limit 10` chỉ gọi API cho 10 câu nhưng manifest vẫn giữ mọi MP3 cũ đang tồn tại.
- [ ] `--only "con mèo"` không làm mất các entry cũ trong manifest.
- [ ] File có sẵn được SKIP khi không có `--force`.
- [ ] `--force` render đè đúng tập đang chọn.
- [ ] `--sample` chỉ tạo `_sample.mp3`, không đưa sample vào manifest.
- [ ] `tts-manifest.js` không chứa credential/API key.
- [ ] `GO_CHU_TTS_META.count` bằng số entry manifest.
- [ ] Sau khi thêm prompt mới vào `data-easy.js`, chạy renderer lại chỉ tạo prompt mới nếu file cũ còn nguyên.

## 16. Mobile

Kiểm tra tối thiểu:

- [ ] 360×640 portrait.
- [ ] 390×844 portrait.
- [ ] 640×360 landscape.
- [ ] Không có horizontal scroll ngoài ý muốn.
- [ ] Input không bị control mới đẩy khỏi vùng nhìn.
- [ ] Các nút chính có vùng bấm đủ lớn.
- [ ] Focus outline không bị cắt khỏi viewport/modal.
- [ ] Emoji fallback không làm mode button/title nhảy chiều cao lớn.

## 17. Smoke test dev

Mở URL với `?debug=1`, ví dụ:

```text
index.html?debug=1
```

hoặc Console:

```js
runGoChuSmokeTests()
```

Kỳ vọng: tất cả test PASS. Nếu có FAIL, không merge feature mới trước khi xác định nguyên nhân.
