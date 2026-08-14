# HANDOFF — go-chu-ver2

## 1. Mục tiêu dự án

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề và độ khó thích nghi.

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
- [x] Nút **Nghe rồi gõ / Hiện chữ** và **Nghe lại**.
- [x] Dùng chung random thông minh + lưu lỗi.

### Phase 5 — Đọc, nhớ, rồi gõ
- [x] Có chế độ phụ **Nhớ rồi gõ** trong Đơn giản.
- [x] Hiện prompt vài giây rồi tự ẩn.
- [x] Chỉ mở ô gõ sau khi hết thời gian ghi nhớ.
- [x] Mức 2 / 3 / 4 từ; thời gian 3 / 5 / 7 giây.
- [x] Giữ hình minh họa khi chữ bị che.
- [x] Dùng chung Phase 1 + Phase 2.
- [x] Loại trừ với Nghe rồi gõ.

### Phase 6 — Chủ đề và cấp độ
- [x] Có **Tất cả / Động vật / Gia đình / Đồ ăn / Thiên nhiên / Trường học / Đồ vật / Cơ thể / Màu sắc / Cảm xúc**.
- [x] Metadata chủ đề tách riêng, không đổi cấu trúc `easyWords`.
- [x] Chủ đề áp dụng cho học thường, Nghe rồi gõ và Nhớ rồi gõ.
- [x] Ôn lỗi chỉ lấy prompt thuộc filter chủ đề/cấp độ hiện tại.
- [x] Cấp độ **Auto / 1 / 2 / 3 / 4 từ**.
- [x] Auto tăng/giảm dựa trên số lượt + độ chính xác, không tăng quá nhanh.
- [x] Phụ huynh có thể khóa mức.
- [x] Lưu chủ đề/cấp độ bằng `localStorage`.
- [x] Responsive mobile.

### Phase 7 — Thống kê và hồ sơ bé
- [ ] Tổng câu, đúng/sai, tỷ lệ chính xác, thời gian học.
- [ ] Danh sách prompt hay sai.
- [ ] Thống kê theo chủ đề.
- [ ] Hồ sơ riêng từng bé.
- [ ] Chuyển hồ sơ không làm mất dữ liệu bé khác.

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
- Dùng Levenshtein căn chỉnh `Cần gõ` / `Bé gõ`.
- PR #1 squash merge, commit `1e8450b`.

### 2026-08-14 — Phase 2
- Tạo `smart-review.js`, `smart-review.css`.
- Key lưu prompt stats: `goChuVer2.promptStats.v1`.
- Một lượt prompt chỉ ghi tối đa 1 lần sai dù bé thử sai nhiều lần.
- Điểm yếu: `wrong * 2 - correct`.
- PR #2 squash merge, commit `11b5689`.

### 2026-08-14 — Phase 3
- Tạo `visual-data.js`, `visual-prompt.js`, `visual-prompt.css`.
- Mapping hơn 30 nhóm; Twemoji ghim `jdecked/twemoji@17.0.3`.
- PR #3 squash merge, commit `e0fe068`.

### 2026-08-14 — Phase 4
- Tạo `listen-mode.js`, `listen-mode.css`.
- PR #4 squash merge, commit `6cc6b00`.

### 2026-08-14 — Hotfix UX: báo lỗi + giọng đọc tiếng Việt
- Bỏ kiểu ô đỏ dày đặc và `SP`.
- Voice chỉ dùng `vi-*`, có select voice Việt trong Settings.
- Key voice: `goChuVer2.viVoice.v1`.
- PR #5 squash merge, commit `26cdb63`.

### 2026-08-14 — Phase 5: Nhớ rồi gõ
- Tạo `memory-mode.js`, `memory-mode.css`.
- Key: `goChuVer2.memoryWords.v1`, `goChuVer2.memorySeconds.v1`.
- Prompt 2/3/4 từ; thời gian 3/5/7 giây.
- Phase 5 PR #6 squash merge, commit `daecd42`.

### 2026-08-14 — Phase 6: Chủ đề và cấp độ

- Tạo `topic-data.js`, `topic-level.js`, `topic-level.css`.
- Chủ đề dùng keyword/phrase mapping; một prompt có thể thuộc nhiều chủ đề nếu nội dung phù hợp.
- `Tất cả` luôn chứa toàn bộ `easyWords`, kể cả prompt chưa phân loại được.
- Rule đã tránh một số collision rõ ràng: `mặt trời` không bị kéo vào Cơ thể chỉ vì từ `mặt`; `màu cam` không bị coi là Đồ ăn chỉ vì `cam`.
- Key chủ đề: `goChuVer2.topic.v1`.
- Key cấp độ: `goChuVer2.level.v1`.
- Cấp độ khóa: chính xác 1 / 2 / 3 / 4 từ.
- Auto mặc định bắt đầu ở 2 từ.
- Auto xuống 1 từ nếu đã có ít nhất 8 lượt và độ chính xác dưới 65%.
- Auto lên 3 từ nếu có ít nhất 15 lượt và độ chính xác từ 88%.
- Auto lên 4 từ nếu có ít nhất 40 lượt và độ chính xác từ 92%.
- Auto chỉ áp mức mới khi build vòng học mới; không đổi prompt đột ngột giữa vòng.
- Nếu topic không có dữ liệu ở mức Auto mục tiêu, chọn mức gần nhất có dữ liệu.
- Nếu level khóa đã lưu nhưng topic mới không có mức đó, tự trả về Auto thay vì tạo danh sách rỗng.
- Khi phụ huynh chọn level khóa không có dữ liệu, giữ level cũ và báo nhẹ.
- `buildSmartEasyRound` được filter theo topic + level; weighting prompt yếu vẫn giữ.
- `getWeakPromptRecords` được filter theo topic/level trong học thường; khi Memory active thì level riêng của Memory được ưu tiên nhưng topic vẫn giữ.
- `buildMemoryRound` được filter topic, nên Nhớ rồi gõ dùng đúng chủ đề.
- Nghe rồi gõ dùng cùng `texts` đã filter nên tự kế thừa topic/cấp độ.
- UI dùng 2 select gọn: **Chủ đề** + **Cấp độ**, có status số nội dung; mobile 2 cột, màn hình rất nhỏ 1 cột.
- Phạm vi Phase 6: `topic-data.js`, `topic-level.js`, `topic-level.css`, `styles.css`, `index.html`, `HANDOFF.md`.

## 5. Kế hoạch Phase 7 — Thống kê và hồ sơ bé

Mục tiêu: phụ huynh nhìn được tiến độ, đồng thời tách dữ liệu cho từng bé trên cùng thiết bị.

Plan:

1. Tạo hồ sơ mặc định **Bé 1** và cho phép thêm/đổi tên/xóa hồ sơ (không cho xóa hồ sơ cuối cùng).
2. Mỗi hồ sơ có namespace `localStorage` riêng cho prompt stats, thời gian, topic/level và các cài đặt học liên quan.
3. Khi chuyển bé: lưu trạng thái bé hiện tại → nạp trạng thái bé mới → refresh UI/pool mà không reload trang nếu có thể.
4. Dashboard phụ huynh hiển thị: tổng lượt, đúng, sai, accuracy, thời gian học hôm nay/tổng, số prompt cần ôn.
5. Hiển thị Top prompt hay sai (ví dụ top 10).
6. Thống kê theo chủ đề: số lượt + accuracy từng topic.
7. Không tạo leaderboard/áp lực điểm số cho bé; dashboard ưu tiên phụ huynh.
8. Có nút reset thống kê của **hồ sơ hiện tại** với xác nhận rõ; không xóa dữ liệu bé khác.
9. Có export/import JSON local để backup tiến độ trước khi có backend.
10. UI dashboard có thể mở/đóng, không chiếm chỗ màn học bình thường.
11. Cập nhật HANDOFF trong cùng PR.

## 6. Việc còn tồn đọng

- Audio binary remote chưa được bổ sung.
- Dependency `../IMG/...` của UI gốc chưa gom vào repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Phase 3 đang dùng CDN; nếu cần offline 100%, tải SVG về repo và đổi base URL sang local.
