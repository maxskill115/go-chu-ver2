# HANDOFF — go-chu-ver2

## 1. Mục tiêu dự án

`go-chu-ver2` là bản phát triển riêng của web luyện đọc và luyện gõ chữ cho bé.

Mục tiêu học tập chính:

1. Bé nhìn chữ và đọc được chữ/cụm từ/câu ngắn.
2. Bé gõ lại chính xác nội dung đã đọc.
3. Web chỉ rõ lỗi để bé tự sửa, không chỉ báo đúng/sai.
4. Nội dung tăng dần từ từ đơn → cụm từ → câu ngắn → ghi nhớ/nghe rồi gõ.
5. Giữ trải nghiệm đơn giản, dễ dùng trên PC và mobile.

## 2. Nguyên tắc kỹ thuật

- Giữ nền tảng **HTML + CSS + JavaScript thuần**.
- Chưa cần backend/database cho các tính năng học cơ bản.
- Dùng `localStorage`/`IndexedDB` khi lưu tiến độ, lỗi hay gặp và hồ sơ bé.
- Không refactor lớn nếu không cần thiết; ưu tiên thay đổi nhỏ, dễ kiểm tra và rollback.
- Mỗi tính năng lớn phải có **commit riêng**.
- **Mọi thay đổi, kế hoạch, quyết định và việc còn lại phải cập nhật vào file `HANDOFF.md`.**
- Khi sửa tính năng hiện có, tránh làm thay đổi hành vi không liên quan.
- Luôn kiểm tra desktop + mobile cho phần giao diện mới.

## 3. Baseline ver2

Nguồn ban đầu lấy từ bản web người dùng cung cấp ngày 2026-08-14.

Baseline đã có:

- Chế độ Đơn giản.
- Chế độ Nâng cao.
- Chế độ Tự do.
- Danh sách cụm từ ngắn phong phú.
- Chế độ Đơn giản random/xáo trộn thay vì chạy tuần tự.
- Âm thanh click, âm thanh trả lời đúng và nhạc nền.
- Bộ đếm thời gian học.
- Một số cài đặt âm lượng/chế độ hiển thị hiện có.

Ghi chú repo:

- File đóng gói `files.zip` của bản upload không đưa vào repo vì chỉ là bản sao của các file nguồn.
- Bản local có đủ 4 file âm thanh. Trong lần khởi tạo remote qua GitHub App, binary audio chưa được đưa vào commit code do giới hạn truyền file binary của connector; đường dẫn trong code vẫn được giữ nguyên.
- `index.html` đã bỏ các bản sao CSS/JS bị nhúng nhưng không chạy; CSS và dữ liệu JS được tách thành file nhỏ hơn để dễ bảo trì.
- Trang hiện vẫn tham chiếu icon/hình ở `../IMG/...`; đây là dependency ngoài thư mục project mà bản nguồn ban đầu cũng đang dùng.

## 4. Roadmap phát triển

### Phase 0 — Khởi tạo ver2
- [x] Tạo repo riêng `go-chu-ver2`.
- [x] Chuẩn bị baseline từ bản hiện tại.
- [x] Thiết lập quy tắc cập nhật `HANDOFF.md` cho mọi công việc.

### Phase 1 — Phản hồi lỗi khi gõ
- [x] Chỉ rõ ký tự bé gõ sai/thừa/thiếu.
- [x] Không làm phần phía sau bị đánh dấu sai hàng loạt khi thiếu một ký tự ở giữa.
- [x] Hiển thị responsive trên mobile.

### Phase 2 — Random thông minh + ôn lỗi
- [x] Ghi lại từ/câu bé thường gõ sai.
- [x] Tăng xác suất xuất hiện lại nội dung hay sai.
- [x] Có mục “Ôn lại từ hay sai”.
- [x] Tránh lặp lại cùng một câu ngay liên tiếp.

### Phase 3 — Ảnh + chữ
- [x] Hỗ trợ dữ liệu có ảnh minh họa cho từ/câu.
- [x] Ví dụ: ảnh con bò → `con bò` / `con bò ăn cỏ`.
- [x] Có fallback khi ảnh không tải được.
- [x] Prompt chưa có ảnh vẫn hiển thị như cũ, không chừa khung trống.
- [x] Responsive trên mobile và landscape thấp.

### Phase 4 — Nghe rồi gõ
- [ ] Dùng Web Speech API đọc tiếng Việt.
- [ ] Có nút nghe lại.
- [ ] Chế độ không hiện chữ, bé nghe rồi gõ.
- [ ] Fallback hợp lý nếu trình duyệt không có giọng tiếng Việt.

### Phase 5 — Đọc, nhớ, rồi gõ
- [ ] Hiện nội dung trong vài giây.
- [ ] Tự ẩn nội dung.
- [ ] Bé gõ lại theo trí nhớ.
- [ ] Chia mức 2 / 3 / 4 từ trước khi mở rộng câu dài.

### Phase 6 — Chủ đề và cấp độ
- [ ] Động vật.
- [ ] Gia đình.
- [ ] Đồ ăn.
- [ ] Thiên nhiên.
- [ ] Trường học.
- [ ] Đồ vật.
- [ ] Cơ thể.
- [ ] Màu sắc.
- [ ] Cảm xúc.
- [ ] Có chế độ “Tất cả chủ đề”.
- [ ] Tự tăng độ khó dựa trên kết quả học.

### Phase 7 — Thống kê và hồ sơ bé
- [ ] Tổng số câu đã gõ.
- [ ] Số câu đúng/sai.
- [ ] Tỷ lệ chính xác.
- [ ] Thời gian học.
- [ ] Danh sách từ hay sai.
- [ ] Hồ sơ riêng cho từng bé bằng `localStorage`.

### Phase 8 — Hỗ trợ học tiếng Việt và bàn phím
- [ ] Highlight từng từ khi đọc.
- [ ] Hỗ trợ nhận biết dấu tiếng Việt.
- [ ] Gợi ý phím cần gõ.
- [ ] Tùy chọn hướng dẫn Telex/VNI nếu cần.

## 5. Thứ tự ưu tiên hiện tại

1. ~~Chỉ rõ ký tự gõ sai~~ ✅
2. ~~Random thông minh + lưu từ hay sai~~ ✅
3. ~~Ảnh + chữ~~ ✅
4. **Nghe rồi gõ** ← bước tiếp theo
5. **Đọc → nhớ → gõ**

Không triển khai nhiều feature cùng lúc. Hoàn tất, kiểm tra và ghi handoff từng feature trước khi sang feature kế tiếp.

## 6. Nhật ký công việc

### 2026-08-14 — Khởi tạo go-chu-ver2

- Người dùng tạo repo GitHub `maxskill115/go-chu-ver2`.
- Đã xác nhận ChatGPT GitHub App nhìn thấy repo và có quyền truy cập.
- Lần ghi đầu tiên bị GitHub trả `403 Resource not accessible by integration`; người dùng cấp lại quyền và ghi file thành công.
- Quy ước bắt buộc: **mọi công việc và cả plan phát triển phải cập nhật vào HANDOFF**.
- Baseline code đã được đưa lên `main`.
- Đã kiểm tra cú pháp các file JavaScript sau khi tách bằng `node --check`: đạt.
- Audio binary vẫn là việc tồn đọng đã ghi ở phần Ghi chú repo.

### 2026-08-14 — Phase 1: Chỉ rõ ký tự gõ sai

- Thay thông báo chung `❌ Chưa đúng!` bằng phần so sánh trực quan giữa **Cần gõ** và **Bé gõ**.
- Ký tự sai, thừa hoặc thiếu được tô đỏ.
- Ký tự thiếu hiển thị bằng ô `□`; khoảng trắng sai hiển thị ký hiệu `␠`.
- Dùng căn chỉnh Levenshtein để một ký tự thiếu/thừa ở giữa không làm toàn bộ phần phía sau bị đánh dấu sai.
- Tôn trọng cài đặt phân biệt hoa/thường hiện có.
- CSS có layout riêng cho desktop và mobile.
- Phase 1 đã squash merge vào `main` qua PR #1, commit `1e8450b`.

### 2026-08-14 — Phase 2: Random thông minh + ôn lỗi

- Tạo module riêng `smart-review.js` để không trộn logic học thích nghi vào `script-core.js`.
- Dùng key `goChuVer2.promptStats.v1` trong `localStorage` để lưu thống kê theo từng prompt.
- Mỗi prompt lưu `correct`, `wrong`, `lastCorrectAt`, `lastWrongAt`.
- Một prompt bị bé thử sai nhiều lần trong cùng một lượt chỉ tính **1 lần sai**.
- Điểm cần ôn dùng công thức `wrong * 2 - correct`; khi bé gõ đúng đủ số lần, prompt tự ra khỏi nhóm yếu.
- Random thông minh chèn thêm tối đa 24 prompt yếu vào vòng học nhưng giữ khoảng cách an toàn và tránh lặp ngay.
- Thêm thanh **Ôn lại**; mỗi lượt ôn tối đa 20 prompt yếu nhất.
- Dữ liệu lỗi nằm hoàn toàn trên trình duyệt; nếu `localStorage` bị chặn, web vẫn chạy bình thường.
- Phase 2 đã squash merge vào `main` qua PR #2, commit `11b5689`.
- Trong lúc tạo branch qua connector đã phát sinh hai branch thử chưa dùng: `agent/phase2-smart-review` và `agent/phase2-smart-review-2`.

### 2026-08-14 — Phase 3: Ảnh + chữ

- Tách mapping hình ra file `visual-data.js`; không sửa trực tiếp mảng `easyWords`.
- Tạo `visual-prompt.js` để tìm hình dựa trên keyword của prompt rồi hiển thị phía trên chữ.
- Phạm vi hiện tại gồm hơn 30 nhóm quen thuộc: mèo, chó, heo, bò, gà, vịt, cá, chim, thỏ, ngựa, khỉ, voi, kiến, dê; táo, chuối, cam, dưa hấu; sách, bút, xe đạp, xe hơi, nhà, bóng, sữa, nước, trường; mặt trời, mưa, mây, hoa, cây.
- Phase 3 chỉ bật hình trong chế độ **Đơn giản**; Nâng cao và Tự do không đổi.
- Prompt có keyword phù hợp dùng SVG Twemoji. Asset URL được ghim ở phiên bản `jdecked/twemoji@17.0.3`, không dùng `latest`.
- Nếu SVG tải lỗi hoặc không có mạng, web hiển thị emoji Unicode tương ứng làm fallback.
- Prompt không có mapping sẽ ẩn hoàn toàn vùng hình, không tạo khoảng trắng thừa.
- Hình có `alt` để hỗ trợ accessibility.
- CSS responsive: desktop dùng hình lớn vừa phải; mobile giảm kích thước; landscape thấp giảm thêm để không đẩy input khỏi màn hình.
- Thêm `THIRD_PARTY.md` ghi attribution Twemoji và giấy phép graphics CC BY 4.0.
- `index.html` nạp module theo thứ tự `visual-data.js` → `script-core.js` → `smart-review.js` → `visual-prompt.js` → `script.js`.
- Đã chạy `node --check visual-data.js` và `node --check visual-prompt.js`: đạt.
- Phạm vi Phase 3: `visual-data.js`, `visual-prompt.js`, `visual-prompt.css`, `styles.css`, `index.html`, `THIRD_PARTY.md`, `HANDOFF.md`.

## 7. Kế hoạch Phase 4 — Nghe rồi gõ

Mục tiêu: chuyển từ “nhìn rồi gõ” sang luyện nghe tiếng Việt và nhớ từ/câu.

Kế hoạch triển khai:

1. Tạo nút **Nghe** và lựa chọn chế độ **Nghe rồi gõ** mà không phá 3 mode hiện tại.
2. Dùng Web Speech API (`speechSynthesis`) để đọc `currentPrompt`.
3. Ưu tiên giọng có `lang = vi-VN`; nếu không có thì dùng giọng tiếng Việt gần nhất hoặc báo nhẹ rằng thiết bị chưa có giọng phù hợp.
4. Trong Nghe rồi gõ, ẩn chữ prompt nhưng vẫn có thể giữ hình minh họa để bé hiểu ngữ cảnh ở mức dễ.
5. Có nút nghe lại; chặn việc spam tạo nhiều speech queue cùng lúc bằng `speechSynthesis.cancel()` trước khi đọc mới.
6. Random thông minh và lưu lỗi tiếp tục dùng chung, để từ nghe sai nhiều cũng quay lại ôn.
7. Responsive trên mobile, nút nghe đủ lớn cho trẻ bấm.
8. Cập nhật `HANDOFF.md` trong cùng PR.

## 8. Việc còn tồn đọng

- Bổ sung lại các file audio binary vào remote khi có luồng upload binary phù hợp.
- Dependency `../IMG/...` của giao diện gốc chưa được gom vào repo `go-chu-ver2`.
- Hai branch thử của Phase 2 có thể xóa thủ công sau nếu muốn giữ danh sách branch gọn; chúng không chứa thay đổi dùng cho `main`.
- Phase 3 hiện dùng SVG CDN để tránh phải upload binary; nếu sau này cần chạy hoàn toàn offline thì tải các SVG cần thiết về repo và đổi `GO_CHU_VISUAL_ASSET_BASE` sang đường dẫn local.
