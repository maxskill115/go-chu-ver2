# HANDOFF — go-chu-ver2

## 1. Mục tiêu dự án

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi và hồ sơ riêng từng bé.

### Nguyên tắc bắt buộc

- Không thêm backend khi chưa cần.
- Không refactor lớn nếu không cần thiết.
- Mỗi phase lớn đi qua branch/PR riêng và squash merge vào `main`.
- **Mọi thay đổi, kế hoạch, quyết định kỹ thuật, PR/commit và việc còn lại phải cập nhật vào `HANDOFF.md`.**
- Không thay đổi hành vi mode không liên quan.
- UI mới phải dùng tốt trên desktop + mobile.

## 2. Baseline

Nguồn ban đầu: bản người dùng cung cấp ngày 2026-08-14.

Baseline có Đơn giản / Nâng cao / Tự do, kho từ/câu, random, âm click/đúng/nhạc nền, bộ đếm thời gian và settings.

Tồn đọng baseline:

- Binary audio gốc chưa được đưa lên remote bằng connector; code vẫn giữ đường dẫn.
- Một số icon UI gốc vẫn tham chiếu `../IMG/...` ngoài repo.

## 3. Roadmap

### Phase 0 — Khởi tạo ver2 ✅
- [x] Repo `maxskill115/go-chu-ver2`.
- [x] Baseline lên `main`.
- [x] Quy ước HANDOFF bắt buộc.

### Phase 1 — Phản hồi lỗi khi gõ ✅
- [x] Levenshtein căn đúng sai/thừa/thiếu.
- [x] Thiếu 1 ký tự không làm phần sau sai hàng loạt.
- [x] Hotfix: bỏ ô đỏ dày đặc, bỏ `SP`, chỉ nhấn nhẹ phần sai.

### Phase 2 — Random thông minh + ôn lỗi ✅
- [x] Prompt stats bằng `localStorage`.
- [x] Prompt yếu xuất hiện lại nhiều hơn.
- [x] Nút **Ôn lại**.
- [x] Không lặp prompt ngay liên tiếp.

### Phase 3 — Ảnh + chữ ✅
- [x] Mapping ảnh riêng.
- [x] Hơn 30 nhóm có minh họa.
- [x] Fallback emoji khi SVG lỗi/mất mạng.
- [x] Responsive.

### Phase 4 — Nghe rồi gõ ✅
- [x] Web Speech API.
- [x] Chỉ dùng voice `vi-*`, không fallback sang ngôn ngữ sai.
- [x] Chọn giọng Việt trong Settings.
- [x] **Nghe rồi gõ / Hiện chữ / Nghe lại**.

### Phase 5 — Nhớ rồi gõ ✅
- [x] Prompt 2 / 3 / 4 từ.
- [x] Thời gian nhìn 3 / 5 / 7 giây.
- [x] Khóa input khi đang nhìn; hết giờ mới cho gõ.
- [x] Giữ hình làm gợi ý ngữ cảnh.
- [x] Loại trừ với Nghe rồi gõ.

### Phase 6 — Chủ đề và cấp độ ✅
- [x] Tất cả / Động vật / Gia đình / Đồ ăn / Thiên nhiên / Trường học / Đồ vật / Cơ thể / Màu sắc / Cảm xúc.
- [x] Filter dùng chung học thường / Listen / Memory.
- [x] Auto / 1 / 2 / 3 / 4 từ.
- [x] Auto tăng giảm bảo thủ theo kết quả học.
- [x] Phụ huynh có thể khóa mức.
- [x] Topic/level lưu localStorage.

### Phase 7 — Thống kê và hồ sơ bé ✅
- [x] Hồ sơ mặc định **Bé 1**.
- [x] Thêm / đổi tên / xóa hồ sơ; không xóa hồ sơ cuối cùng.
- [x] Prompt stats riêng từng bé.
- [x] Chủ đề/cấp độ/Memory settings riêng từng bé.
- [x] Thời gian học hôm nay + tổng thời gian riêng từng bé.
- [x] Dashboard tổng lượt, đúng/sai, accuracy, cần ôn.
- [x] Top 10 prompt hay sai.
- [x] Thống kê theo chủ đề.
- [x] Reset chỉ hồ sơ hiện tại.
- [x] Export/import JSON backup toàn bộ hồ sơ.
- [x] Chuyển hồ sơ không reload trang.
- [x] Dashboard đóng/mở, không chiếm màn học bình thường.
- [x] Responsive desktop/mobile.

**Giới hạn Phase 7 hiện tại:** prompt stats được Phase 2 ghi cho luồng **Đơn giản**, bao gồm Listen/Memory. Nâng cao và Tự do chưa được đưa vào adaptive prompt stats; dashboard prompt/accuracy hiện dựa trên dữ liệu này. Thời gian học vẫn được ghi chung khi hồ sơ đang active.

### Phase 8 — Hỗ trợ tiếng Việt và bàn phím
- [ ] Highlight tiến độ theo từng từ khi đọc/gõ.
- [ ] Nhận biết lỗi dấu tiếng Việt rõ hơn.
- [ ] Gợi ý phím cần gõ.
- [ ] Hướng dẫn Telex/VNI tùy chọn.
- [ ] Không biến thành bàn phím ảo rối mắt.

## 4. Nhật ký kỹ thuật

### 2026-08-14 — Khởi tạo
- Tạo repo `go-chu-ver2`.
- GitHub App ban đầu 403; người dùng cấp lại Contents write và ghi thành công.

### Phase 1
- PR #1 → squash `1e8450b`.
- Levenshtein diff.

### Phase 2
- PR #2 → squash `11b5689`.
- Key legacy stats: `goChuVer2.promptStats.v1`.
- Prompt: `correct`, `wrong`, `lastCorrectAt`, `lastWrongAt`.
- Weakness: `wrong * 2 - correct`.

### Phase 3
- PR #3 → squash `e0fe068`.
- `visual-data.js`, `visual-prompt.js/css`.
- Twemoji pinned `jdecked/twemoji@17.0.3`, attribution trong `THIRD_PARTY.md`.

### Phase 4
- PR #4 → squash `6cc6b00`.
- `listen-mode.js/css`.

### Hotfix UX + voice
- PR #5 → squash `26cdb63`.
- `ux-hotfix.js/css`.
- Key voice: `goChuVer2.viVoice.v1`.
- Speech rate 0.76.

### Phase 5
- PR #6 → squash `daecd42`.
- `memory-mode.js/css`.
- Keys: `goChuVer2.memoryWords.v1`, `goChuVer2.memorySeconds.v1` (legacy/global trước Phase 7).

### Phase 6
- PR #7 → squash `18552e0`.
- `topic-data.js`, `topic-level.js/css`.
- Keys legacy/global trước Phase 7: `goChuVer2.topic.v1`, `goChuVer2.level.v1`.
- Auto:
  - mặc định 2 từ;
  - >= 8 lượt và accuracy < 65% → 1 từ;
  - >= 15 lượt và accuracy >= 88% → 3 từ;
  - >= 40 lượt và accuracy >= 92% → 4 từ.
- Nếu mức không có dữ liệu → chọn mức gần nhất; level khóa không hợp topic mới → Auto.
- Đã tránh collision rõ như `mặt trời`/Cơ thể và `màu cam`/Đồ ăn.

### 2026-08-14 — Phase 7: Hồ sơ + thống kê

- Tạo `profile-stats.js`, `profile-stats.css`.
- Registry hồ sơ: `goChuVer2.profiles.v1`.
- Hồ sơ active: `goChuVer2.activeProfile.v1`.
- Data từng hồ sơ: `goChuVer2.profile.<profileId>.v1`.
- Schema hồ sơ:
  - `promptStats`;
  - `study.totalSeconds` + `study.days[YYYY-MM-DD]`;
  - `preferences.topicId`;
  - `preferences.levelMode`;
  - `preferences.memoryWordCount`;
  - `preferences.memorySeconds`.
- Lần đầu Phase 7 chạy: tự tạo **Bé 1** và migrate `goChuVer2.promptStats.v1` + topic/level/Memory hiện tại vào hồ sơ này để không mất tiến độ cũ.
- Sau Phase 7, `savePromptStats`, `saveTopicLevelSetting`, `saveMemoryNumber` được route vào data của hồ sơ active thay vì trộn chung giữa các bé.
- Voice/âm lượng/hoa-thường vẫn là **cài đặt thiết bị**, không tách theo bé.
- Bộ đếm HUD vẫn là thời gian phiên hiện tại; dashboard lưu riêng **hôm nay** và **tổng thời gian** cho từng bé.
- Thời gian profile được flush mỗi 15 giây và khi tab bị ẩn/đóng.
- Chuyển hồ sơ: flush hồ sơ cũ → dừng Listen/Memory/Review tạm → nạp stats/preferences bé mới → rebuild pool Easy → cập nhật UI, không reload trang.
- Dashboard mở bằng nút 👤 trên HUD.
- Dashboard có tổng quan, Top 10 prompt yếu, thống kê theo 9 chủ đề, quản lý hồ sơ, reset hiện tại, export/import JSON.
- Không cho xóa hồ sơ cuối cùng.
- Import backup có xác nhận vì thay toàn bộ dữ liệu profile trên thiết bị.
- Backup format: `{ app: "go-chu-ver2", version: 1, profiles, data }`.
- Phạm vi Phase 7: `profile-stats.js`, `profile-stats.css`, `styles.css`, `index.html`, `HANDOFF.md`.

## 5. Kế hoạch Phase 8 — Tiếng Việt + bàn phím

Mục tiêu: giúp bé hiểu **sai ở âm/chữ/dấu nào** và học cách gõ tiếng Việt, nhưng giữ UI rất đơn giản.

Plan:

1. Thêm progress theo từng **từ**: từ đang gõ đúng được nhấn nhẹ, từ kế tiếp là focus.
2. Không tô từng ký tự thành hàng ô như UI cũ; chỉ dùng underline/highlight nhẹ.
3. Khi sai dấu (`a/á/à/ả/ã/ạ`, `ă`, `â`, `ê`, `ô`, `ơ`, `ư`, `đ`), phản hồi riêng kiểu: **“Đúng chữ, sai dấu”** nếu xác định được.
4. Tạo module bàn phím tiếng Việt riêng, mặc định **tắt**.
5. Tùy chọn **Telex / VNI / Không hướng dẫn**.
6. Telex gợi ý ở mức chuỗi phím đơn giản, ví dụ `á → as`, `ă → aw`, `đ → dd`; không can thiệp IME của hệ điều hành.
7. VNI tương tự, chỉ là gợi ý; không tự biến đổi input.
8. Chỉ hiển thị 1–3 phím cần thiết cho ký tự/từ hiện tại, không dựng full keyboard trên màn hình.
9. Tôn trọng composition event (`e.isComposing`) để không phá bộ gõ tiếng Việt đang dùng.
10. Thêm thống kê lỗi dấu như metadata bổ sung nhưng không phá schema promptStats hiện tại.
11. Mobile: gợi ý phím nằm dưới input và tự ẩn khi không cần.
12. Cập nhật HANDOFF trong cùng PR.

## 6. Việc còn tồn đọng

- Audio binary remote chưa được bổ sung.
- Dependency `../IMG/...` của UI gốc chưa gom vào repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Phase 3 đang dùng CDN; nếu cần offline 100%, tải SVG về repo và đổi base URL sang local.
- Nâng cao/Tự do chưa có adaptive prompt stats như Đơn giản.
