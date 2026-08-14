# HANDOFF — go-chu-ver2

## 1. Mục tiêu dự án

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe/nhớ**.

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
- [x] Ưu tiên giọng `vi-VN`, fallback giọng mặc định.
- [x] Nút **Nghe rồi gõ / Hiện chữ**.
- [x] Nút **Nghe lại**.
- [x] Khi bật: ẩn chữ, giữ hình minh họa.
- [x] Mỗi prompt mới tự đọc.
- [x] Hủy speech queue cũ trước khi đọc mới.
- [x] Dùng chung random thông minh + lưu lỗi.
- [x] Responsive mobile.

### Phase 5 — Đọc, nhớ, rồi gõ
- [ ] Hiện prompt trong vài giây.
- [ ] Tự ẩn prompt.
- [ ] Bé gõ lại theo trí nhớ.
- [ ] Chia mức 2 / 3 / 4 từ.
- [ ] Cho phép chỉnh thời gian ghi nhớ.

### Phase 6 — Chủ đề và cấp độ
- [ ] Động vật / Gia đình / Đồ ăn / Thiên nhiên / Trường học / Đồ vật / Cơ thể / Màu sắc / Cảm xúc.
- [ ] Tất cả chủ đề.
- [ ] Tự tăng độ khó.

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
- Sai/thừa/thiếu tô đỏ; thiếu dùng `□`, khoảng trắng sai dùng `␠`.
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
- `node --check visual-data.js` và `visual-prompt.js`: đạt.
- PR #3 squash merge, commit `e0fe068`.

### 2026-08-14 — Phase 4

- Tạo `listen-mode.js`, `listen-mode.css`.
- Dùng `window.speechSynthesis` + `SpeechSynthesisUtterance`.
- Ưu tiên voice có `lang=vi-VN`, sau đó voice bắt đầu bằng `vi`, cuối cùng để browser chọn giọng mặc định.
- Utterance đặt `lang="vi-VN"`, tốc độ `0.82`, pitch `1`.
- Âm lượng speech tôn trọng `masterVolume` và tùy chọn giảm âm lượng hiện có.
- Trước khi đọc mới gọi `speechSynthesis.cancel()` để không xếp chồng nhiều câu.
- Lắng nghe `voiceschanged` vì danh sách giọng có thể tải muộn.
- Thêm nút **🎧 Nghe rồi gõ**, **🔊 Nghe lại**; khi bật thì chữ prompt bị che bằng `🔊 Hãy nghe rồi gõ` nhưng hình Phase 3 vẫn còn.
- Nếu trình duyệt không có Speech Synthesis, nút bị disable và hiện thông báo nhẹ.
- Khi chuyển sang Nâng cao/Tự do, listen mode tự tắt và dừng speech.
- Random thông minh, ghi lỗi và Ôn lại của Phase 2 tiếp tục hoạt động nguyên vẹn.
- `node --check listen-mode.js`: đạt.
- Phạm vi Phase 4: `listen-mode.js`, `listen-mode.css`, `styles.css`, `index.html`, `HANDOFF.md`.

## 5. Kế hoạch Phase 5 — Đọc, nhớ, rồi gõ

Mục tiêu: thêm bài tập trí nhớ ngắn sau khi bé đã quen nhìn/gõ và nghe/gõ.

Plan:

1. Tạo chế độ phụ **Nhớ rồi gõ** trong Đơn giản.
2. Hiện chữ 3–5 giây rồi tự che; hình có thể giữ lại.
3. Có đồng hồ đếm ngược nhỏ, không tạo áp lực điểm số.
4. Mức 1: 2 từ; mức 2: 3 từ; mức 3: 4 từ.
5. Không đưa câu dài vào Memory Mode ở giai đoạn đầu.
6. Cho phụ huynh chỉnh 3 / 5 / 7 giây.
7. Gõ sai vẫn dùng Phase 1; prompt yếu vẫn dùng Phase 2.
8. Mobile không để timer/controls đẩy input khỏi màn hình.
9. Mọi code + quyết định tiếp tục cập nhật HANDOFF trong cùng PR.

## 6. Việc còn tồn đọng

- Audio binary remote chưa được bổ sung.
- Dependency `../IMG/...` của UI gốc chưa gom vào repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Phase 3 đang dùng CDN; nếu cần offline 100%, tải SVG về repo và đổi base URL sang local.
