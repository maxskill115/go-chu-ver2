# HANDOFF — go-chu-ver2

## 1. Mục tiêu dự án

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**.

Nguyên tắc bắt buộc:

- Không thêm backend khi chưa cần.
- Không refactor lớn nếu không cần thiết.
- Mỗi phase lớn đi qua branch/PR riêng và squash merge vào `main`.
- **Mọi thay đổi, kế hoạch, quyết định kỹ thuật, việc còn lại và commit/PR phải cập nhật vào `HANDOFF.md`.**
- Không làm thay đổi hành vi của mode không liên quan.
- UI mới phải xem tốt trên desktop + mobile.

## 2. Baseline

Nguồn ban đầu: bản người dùng cung cấp ngày 2026-08-14.

Baseline có:

- Đơn giản / Nâng cao / Tự do.
- Kho từ/cụm/câu ngắn.
- Random Đơn giản.
- Âm click, âm đúng, nhạc nền.
- Bộ đếm thời gian.
- Cài đặt âm lượng, hoa/thường.

Tồn đọng baseline:

- Binary audio gốc chưa được đưa lên remote bằng connector; code vẫn giữ nguyên đường dẫn.
- Một số icon UI gốc vẫn tham chiếu `../IMG/...` ngoài repo.

## 3. Roadmap

### Phase 0 — Khởi tạo ver2
- [x] Repo `maxskill115/go-chu-ver2`.
- [x] Baseline lên `main`.
- [x] Quy ước HANDOFF bắt buộc.

### Phase 1 — Phản hồi lỗi khi gõ
- [x] Chỉ rõ ký tự sai/thừa/thiếu.
- [x] Thiếu 1 ký tự không làm phần sau sai hàng loạt.
- [x] Responsive mobile.
- [x] Hotfix UI: bỏ kiểu ô đỏ dày đặc, không hiện `SP`, chỉ nhấn nhẹ phần sai/missing.

### Phase 2 — Random thông minh + ôn lỗi
- [x] Lưu đúng/sai theo prompt bằng `localStorage`.
- [x] Prompt yếu xuất hiện lại nhiều hơn.
- [x] Nút **Ôn lại**.
- [x] Tránh lặp ngay liên tiếp.

### Phase 3 — Ảnh + chữ
- [x] Mapping ảnh riêng, không sửa `easyWords`.
- [x] Hơn 30 nhóm prompt có minh họa.
- [x] Fallback emoji khi ảnh lỗi/mất mạng.
- [x] Prompt không có hình vẫn hiển thị như cũ.
- [x] Responsive mobile/landscape.

### Phase 4 — Nghe rồi gõ
- [x] Dùng Web Speech API đọc prompt.
- [x] Chỉ dùng voice tiếng Việt (`vi-*`), không fallback sang giọng sai ngôn ngữ.
- [x] Có lựa chọn **Giọng đọc tiếng Việt** trong cài đặt nếu thiết bị có nhiều voice.
- [x] Nếu thiết bị chưa có voice Việt: không đọc, báo rõ cho phụ huynh.
- [x] Nút **Nghe rồi gõ / Hiện chữ**.
- [x] Nút **Nghe lại**.
- [x] Khi bật: ẩn chữ, giữ hình minh họa.
- [x] Mỗi prompt mới tự đọc.
- [x] Hủy speech queue cũ trước khi đọc mới.
- [x] Dùng chung random thông minh + lưu lỗi.
- [x] Responsive mobile.

### Phase 5 — Đọc, nhớ, rồi gõ
- [x] Có chế độ phụ **Nhớ rồi gõ** trong Đơn giản.
- [x] Hiện prompt vài giây rồi tự ẩn.
- [x] Chỉ mở ô gõ sau khi hết thời gian ghi nhớ.
- [x] Mức 1 / 2 / 3 tương ứng đúng 2 / 3 / 4 từ.
- [x] Phụ huynh chọn 3 / 5 / 7 giây.
- [x] Giữ hình minh họa khi chữ đã bị che.
- [x] Dùng chung Phase 1 báo lỗi và Phase 2 lưu prompt yếu.
- [x] Nhớ rồi gõ và Nghe rồi gõ loại trừ nhau.
- [x] Responsive mobile/landscape thấp.

### Phase 6 — Chủ đề và cấp độ
- [ ] Động vật / Gia đình / Đồ ăn / Thiên nhiên / Trường học / Đồ vật / Cơ thể / Màu sắc / Cảm xúc.
- [ ] Tất cả chủ đề.
- [ ] Chủ đề áp dụng được cho học thường, Nghe rồi gõ và Nhớ rồi gõ.
- [ ] Tự tăng độ khó theo kết quả học.

### Phase 7 — Thống kê và hồ sơ bé
- [ ] Tổng câu, đúng/sai, tỷ lệ chính xác, thời gian học.
- [ ] Danh sách prompt hay sai.
- [ ] Hồ sơ riêng từng bé.

### Phase 8 — Hỗ trợ tiếng Việt và bàn phím
- [ ] Highlight từng từ khi đọc.
- [ ] Nhận biết dấu tiếng Việt.
- [ ] Gợi ý phím.
- [ ] Telex/VNI tùy chọn.

## 4. Nhật ký

### 2026-08-14 — Khởi tạo

- Tạo repo `go-chu-ver2`.
- GitHub App ban đầu bị 403 do thiếu quyền Contents; người dùng cấp lại quyền và ghi thành công.
- Baseline được tách thành các file dữ liệu/logic/CSS dễ bảo trì hơn.
- Quy ước HANDOFF bắt buộc được áp dụng.

### 2026-08-14 — Phase 1

- Dùng Levenshtein để căn chỉnh `Cần gõ` / `Bé gõ`.
- Sai/thừa/thiếu được chỉ rõ theo vị trí.
- PR #1 squash merge, commit `1e8450b`.

### 2026-08-14 — Phase 2

- Tạo `smart-review.js`, `smart-review.css`.
- Key lưu: `goChuVer2.promptStats.v1`.
- Mỗi prompt lưu `correct`, `wrong`, `lastCorrectAt`, `lastWrongAt`.
- Một lượt prompt chỉ ghi tối đa 1 lần sai dù bé thử sai nhiều lần.
- Điểm yếu: `wrong * 2 - correct`.
- Chèn thêm tối đa 24 prompt yếu vào vòng học, giữ khoảng cách an toàn.
- Ôn tối đa 20 prompt yếu/lượt.
- PR #2 squash merge, commit `11b5689`.
- Có 2 branch thử không dùng: `agent/phase2-smart-review`, `agent/phase2-smart-review-2`.

### 2026-08-14 — Phase 3

- Tạo `visual-data.js`, `visual-prompt.js`, `visual-prompt.css`.
- Mapping hơn 30 nhóm: động vật, trái cây, đồ vật, thiên nhiên.
- Chỉ áp dụng mode Đơn giản.
- Asset: Twemoji SVG, ghim `jdecked/twemoji@17.0.3` trên jsDelivr.
- Fallback emoji nếu SVG lỗi/mất mạng.
- Thêm `THIRD_PARTY.md` attribution CC BY 4.0.
- PR #3 squash merge, commit `e0fe068`.

### 2026-08-14 — Phase 4

- Tạo `listen-mode.js`, `listen-mode.css`.
- Dùng `window.speechSynthesis` + `SpeechSynthesisUtterance`.
- Thêm nút **🎧 Nghe rồi gõ**, **🔊 Nghe lại**.
- Random thông minh, ghi lỗi và Ôn lại tiếp tục hoạt động.
- PR #4 squash merge, commit `6cc6b00`.

### 2026-08-14 — Hotfix UX: báo lỗi + giọng đọc tiếng Việt

- Bỏ kiểu mỗi ký tự là một ô đỏ; chỉ tô nhẹ phần sai/thiếu.
- Không còn hiển thị `SP`; dấu cách giữ như khoảng trắng thật.
- Dòng Bé gõ không còn tạo placeholder cho toàn bộ phần chưa nhập.
- Voice chỉ chấp nhận `lang` bắt đầu bằng `vi`; không fallback giọng sai ngôn ngữ.
- Thêm chọn **Giọng đọc tiếng Việt** trong Settings, key `goChuVer2.viVoice.v1`.
- Nếu không có voice Việt, web không đọc và báo rõ.
- Tốc độ đọc mặc định giảm còn `0.76`.
- PR #5 squash merge, commit `26cdb63`.

### 2026-08-14 — Phase 5: Nhớ rồi gõ

- Tạo `memory-mode.js`, `memory-mode.css`.
- Thêm thanh **🧠 Nhớ rồi gõ** trong mode Đơn giản.
- Lọc `easyWords` theo số từ chính xác: 2 / 3 / 4 từ.
- Lưu lựa chọn bằng `goChuVer2.memoryWords.v1` và `goChuVer2.memorySeconds.v1`.
- Khi prompt mới xuất hiện: chữ hiện trong 3 / 5 / 7 giây; input và nút Tiếp theo bị khóa trong thời gian nhìn.
- Hết thời gian: chữ đổi thành `🧠 Nhớ lại rồi gõ`, input được mở và tự focus.
- Hình Phase 3 không bị ẩn nên vẫn đóng vai trò gợi ý ngữ cảnh.
- Prompt yếu của Phase 2 vẫn được chèn thêm vào vòng Memory nếu cùng mức số từ.
- Kết quả đúng/sai của Memory tiếp tục ghi vào thống kê prompt Phase 2.
- Khi bật Memory, chế độ Nghe rồi gõ tự tắt; nếu bật Nghe rồi gõ thì Memory tự tắt.
- Khi Memory bật, thanh Ôn lại được ẩn để tránh hai luồng bài tập chồng nhau; weighting prompt yếu vẫn hoạt động tự động.
- Responsive: mobile chuyển controls thành 2 cột; landscape thấp giảm chiều cao control.
- Phạm vi Phase 5: `memory-mode.js`, `memory-mode.css`, `styles.css`, `index.html`, `HANDOFF.md`.

## 5. Kế hoạch Phase 6 — Chủ đề và cấp độ

Mục tiêu: cho bé chọn nhóm nội dung quen thuộc và bắt đầu cá nhân hóa độ khó.

Plan:

1. Tách metadata chủ đề ra file riêng, không thay toàn bộ `easyWords` thành object ngay lập tức.
2. Chủ đề đầu tiên: **Tất cả / Động vật / Gia đình / Đồ ăn / Thiên nhiên / Trường học / Đồ vật / Cơ thể / Màu sắc / Cảm xúc**.
3. Dùng keyword/mapping rõ ràng; prompt không phân loại được vẫn nằm trong **Tất cả**.
4. Khi chọn chủ đề, random thông minh chỉ random trong pool chủ đề đó.
5. Ôn lỗi chỉ lấy prompt thuộc chủ đề đang chọn khi đang học theo chủ đề; thống kê gốc vẫn giữ chung.
6. Nghe rồi gõ và Nhớ rồi gõ tiếp tục dùng cùng filter chủ đề.
7. Thêm cấp độ tự động ban đầu dựa trên số từ + tỷ lệ đúng, nhưng không tự tăng quá nhanh.
8. Cho phụ huynh có thể khóa một mức thay vì để Auto.
9. Lưu chủ đề/cấp độ bằng `localStorage`.
10. UI chủ đề phải gọn trên mobile, ưu tiên select/dropdown thay vì 9 nút lớn.
11. Cập nhật HANDOFF trong cùng PR.

## 6. Việc còn tồn đọng

- Audio binary remote chưa được bổ sung.
- Dependency `../IMG/...` của UI gốc chưa gom vào repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Phase 3 đang dùng CDN; nếu cần offline 100%, tải SVG về repo và đổi base URL sang local.
