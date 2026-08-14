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
- Dùng `localStorage`/`IndexedDB` khi bắt đầu lưu tiến độ, lỗi hay gặp và hồ sơ bé.
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
- Chế độ Đơn giản đã random/xáo trộn thay vì chạy tuần tự.
- Âm thanh click, âm thanh trả lời đúng và nhạc nền.
- Bộ đếm thời gian học.
- Một số cài đặt âm lượng/chế độ hiển thị hiện có.

Ghi chú repo:

- File đóng gói `files.zip` của bản upload không đưa vào repo vì chỉ là bản sao của `index.html`, `styles.css`, `script.js`.
- Bản local có đủ 4 file âm thanh. Trong lần khởi tạo remote qua GitHub App, binary audio chưa được đưa vào commit code do giới hạn truyền file binary của connector; đường dẫn trong code vẫn được giữ nguyên để bổ sung asset sau mà không đổi logic.
- `index.html` đã bỏ các bản sao CSS/JS bị nhúng ở `media="not all"` và `type="text/plain"` vì chúng không chạy; CSS và dữ liệu JS được tách thành file nhỏ hơn để dễ bảo trì.
- Trang hiện vẫn tham chiếu icon/hình ở `../IMG/...`; đây là dependency ngoài thư mục project mà bản nguồn ban đầu cũng đang dùng.

## 4. Roadmap phát triển

### Phase 0 — Khởi tạo ver2
- [x] Tạo repo riêng `go-chu-ver2`.
- [x] Chuẩn bị baseline từ bản hiện tại.
- [x] Thiết lập quy tắc cập nhật `HANDOFF.md` cho mọi công việc.

### Phase 1 — Phản hồi lỗi khi gõ
- [ ] Chỉ rõ ký tự bé gõ sai/thừa/thiếu.
- [ ] Không làm phần phía sau bị đánh dấu sai hàng loạt khi thiếu một ký tự ở giữa.
- [ ] Hiển thị tốt trên mobile.

### Phase 2 — Random thông minh + ôn lỗi
- [ ] Ghi lại từ/câu bé thường gõ sai.
- [ ] Tăng xác suất xuất hiện lại nội dung hay sai.
- [ ] Có mục “Ôn lại từ hay sai”.
- [ ] Tránh lặp lại cùng một câu ngay liên tiếp.

### Phase 3 — Ảnh + chữ
- [ ] Hỗ trợ dữ liệu có ảnh minh họa cho từ/câu.
- [ ] Ví dụ: ảnh con bò → `con bò` / `con bò ăn cỏ`.
- [ ] Có fallback khi chưa có ảnh.

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

Ưu tiên triển khai:

1. **Chỉ rõ ký tự gõ sai**.
2. **Random thông minh + lưu từ hay sai**.
3. **Ảnh + chữ**.
4. **Nghe rồi gõ**.
5. **Đọc → nhớ → gõ**.

Không triển khai nhiều feature cùng lúc. Hoàn tất, kiểm tra và ghi handoff từng feature trước khi sang feature kế tiếp.

## 6. Nhật ký công việc

### 2026-08-14 — Khởi tạo go-chu-ver2

- Người dùng tạo repo GitHub `maxskill115/go-chu-ver2`.
- Đã xác nhận ChatGPT GitHub App nhìn thấy repo và có quyền truy cập.
- Lần ghi đầu tiên bị GitHub trả `403 Resource not accessible by integration` vì quyền GitHub App chưa được cập nhật.
- Người dùng đã cấp lại quyền; kiểm tra ghi file thành công.
- Quy ước mới theo yêu cầu người dùng: **mọi công việc và cả plan phát triển phải cập nhật vào HANDOFF**.
- Baseline code đã được đưa lên `main`: `index.html`, dữ liệu Đơn giản/Nâng cao/Tự do, logic JS và CSS responsive.
- Đã kiểm tra cú pháp các file JavaScript sau khi tách bằng `node --check`: đạt.
- Audio binary vẫn là việc tồn đọng đã ghi ở phần Ghi chú repo.
- Feature tiếp theo ngay sau baseline: **Phase 1 — chỉ rõ ký tự gõ sai**.

## 7. Việc tiếp theo

1. Áp dụng Phase 1 — chỉ rõ ký tự gõ sai/thừa/thiếu.
2. Cập nhật Nhật ký + trạng thái Phase 1 trong `HANDOFF.md` trong cùng đợt thay đổi.
3. Kiểm tra cú pháp JavaScript và giao diện responsive.
4. Sau khi Phase 1 ổn định mới bắt đầu Phase 2.
5. Bổ sung lại audio binary vào remote khi có luồng upload binary phù hợp.
