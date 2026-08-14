# HANDOFF — go-chu-ver2

## 1. Mục tiêu dự án

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi, hồ sơ riêng từng bé và hỗ trợ học gõ tiếng Việt.

### Nguyên tắc bắt buộc

- Không thêm backend khi chưa cần.
- Không refactor lớn nếu không cần thiết.
- Mỗi phase lớn đi qua branch/PR riêng và squash merge vào `main`.
- **Mọi thay đổi, kế hoạch, quyết định kỹ thuật, PR/commit và việc còn lại phải cập nhật vào `HANDOFF.md`.**
- Không thay đổi hành vi mode không liên quan.
- UI mới phải dùng tốt trên desktop + mobile.

## 2. Roadmap trạng thái

### Phase 0 — Khởi tạo ver2 ✅
- [x] Repo `maxskill115/go-chu-ver2`.
- [x] Baseline lên `main`.
- [x] HANDOFF bắt buộc.

### Phase 1 — Phản hồi lỗi ✅
- [x] Levenshtein căn sai/thừa/thiếu.
- [x] Không cascade lỗi khi thiếu ký tự.
- [x] Hotfix bỏ ô đỏ dày đặc và `SP`.

### Phase 2 — Random thông minh + ôn lỗi ✅
- [x] Prompt stats.
- [x] Weight prompt yếu.
- [x] **Ôn lại**.
- [x] Không lặp ngay liên tiếp.

### Phase 3 — Ảnh + chữ ✅
- [x] Mapping ảnh riêng.
- [x] Hơn 30 nhóm có minh họa.
- [x] Fallback emoji.

### Phase 4 — Nghe rồi gõ ✅
- [x] Web Speech API.
- [x] Chỉ voice `vi-*`.
- [x] Chọn voice Việt.
- [x] Nghe rồi gõ / Hiện chữ / Nghe lại.

### Phase 5 — Nhớ rồi gõ ✅
- [x] 2 / 3 / 4 từ.
- [x] 3 / 5 / 7 giây.
- [x] Che chữ rồi mới mở input.
- [x] Không chồng Listen Mode.

### Phase 6 — Chủ đề + cấp độ ✅
- [x] 10 lựa chọn chủ đề.
- [x] Auto / 1 / 2 / 3 / 4 từ.
- [x] Filter dùng chung normal / Listen / Memory.
- [x] Auto difficulty bảo thủ.

### Phase 7 — Hồ sơ + thống kê ✅
- [x] Nhiều hồ sơ bé.
- [x] Progress riêng từng bé.
- [x] Thời gian hôm nay/tổng.
- [x] Top prompt yếu + thống kê chủ đề.
- [x] Reset riêng hồ sơ.
- [x] Export/import JSON.

**Giới hạn:** adaptive prompt stats hiện tập trung ở Đơn giản + Listen/Memory. Nâng cao/Tự do chưa có adaptive prompt stats theo prompt.

### Phase 8 — Tiếng Việt + gợi ý bàn phím ✅
- [x] Progress trực quan theo **từng từ**, không dựng ô ký tự.
- [x] Từ đã đúng nhấn nhẹ, từ đang gõ underline, từ sai hiện underline đỏ nhẹ.
- [x] Nhận biết trường hợp **đúng chữ gốc nhưng sai dấu/chữ tiếng Việt**.
- [x] Ví dụ phản hồi: `meo → mèo`, `di → đi`.
- [x] Ghi `accentErrors` vào chính entry promptStats, không phá schema cũ.
- [x] Dashboard có thêm tổng **Lỗi dấu**.
- [x] Hướng dẫn tiếng Việt mặc định **Tắt**.
- [x] Tùy chọn **Telex / VNI / Tắt** trong Settings.
- [x] Gợi ý chỉ một dòng cho từ hiện tại, ví dụ `bé → bes` / `bé → be1`.
- [x] Không can thiệp bộ gõ/IME của hệ điều hành.
- [x] Tôn trọng composition events.
- [x] Gợi ý tự ẩn trong Listen/Memory để không lộ đáp án.
- [x] Responsive mobile.

## 3. PR / commit chính

- Phase 1: PR #1 → `1e8450b`.
- Phase 2: PR #2 → `11b5689`.
- Phase 3: PR #3 → `e0fe068`.
- Phase 4: PR #4 → `6cc6b00`.
- Hotfix UX/voice: PR #5 → `26cdb63`.
- Phase 5: PR #6 → `daecd42`.
- Phase 6: PR #7 → `18552e0`.
- Phase 7: PR #8 → `e281c40`.
- Phase 8: PR/commit sẽ cập nhật sau khi merge branch hiện tại.

## 4. Chi tiết kỹ thuật đang dùng

### Smart review
- Legacy key: `goChuVer2.promptStats.v1`.
- Entry: `correct`, `wrong`, `lastCorrectAt`, `lastWrongAt`.
- Phase 8 bổ sung không phá tương thích: `accentErrors`, `lastAccentErrorAt`.
- Weakness: `wrong * 2 - correct`.

### Voice
- `goChuVer2.viVoice.v1`.
- Chỉ nhận voice `lang` bắt đầu bằng `vi`.
- Rate hiện tại `0.76`.

### Memory
- Legacy/global trước profile: `goChuVer2.memoryWords.v1`, `goChuVer2.memorySeconds.v1`.
- Sau Phase 7 các giá trị này được route vào preferences hồ sơ active.

### Topic/level
- Legacy/global: `goChuVer2.topic.v1`, `goChuVer2.level.v1`.
- Auto:
  - mặc định 2 từ;
  - >= 8 lượt, accuracy < 65% → 1 từ;
  - >= 15 lượt, accuracy >= 88% → 3 từ;
  - >= 40 lượt, accuracy >= 92% → 4 từ.
- Nếu mức không có dữ liệu → mức gần nhất.

### Profiles
- Registry: `goChuVer2.profiles.v1`.
- Active: `goChuVer2.activeProfile.v1`.
- Data: `goChuVer2.profile.<profileId>.v1`.
- Lần đầu tự tạo **Bé 1** và migrate stats/topic/level/Memory cũ.
- Hồ sơ lưu `promptStats`, study time và learning preferences.
- Voice/volume/hoa-thường vẫn là cài đặt thiết bị.
- Phase 7: PR #8 → squash `e281c40`.

### Phase 8 — Vietnamese input

Files:
- `vietnamese-input.js`.
- `vietnamese-input.css`.
- `vietnamese-dashboard.js`.

Key setting thiết bị:
- `goChuVer2.inputGuide.v1` = `off | telex | vni`.

Quy tắc:
- Progress theo word chỉ bật ở Easy; Hard/Free giữ cách hiển thị hiện tại.
- Listen/Memory vẫn che toàn bộ chữ kể cả màu của span progress.
- Accent-only detection bỏ combining marks và coi `đ/d` cùng base để nhận diện lỗi tiếng Việt đặc thù.
- Chỉ ghi tối đa 1 `accentErrors` cho một lượt prompt dù bé bấm sai lặp lại.
- Metadata accent nằm trong promptStats của hồ sơ nên tự đi theo profile và backup JSON.
- Telex/VNI chỉ là **hướng dẫn**, không sửa giá trị input.
- Telex hỗ trợ: `ă aw`, `â aa`, `ê ee`, `ô oo`, `ơ ow`, `ư uw`, `đ dd`, dấu `s/f/r/x/j`.
- VNI hỗ trợ: `ă a8`, `â a6`, `ê e6`, `ô o6`, `ơ o7`, `ư u7`, `đ d9`, dấu `1/2/3/4/5`.
- Đã test mapping với `bé`, `mèo`, `đường`, `tiếng`, `trường`, `cảm`, `ơn`, `người`, `học`, `chữ`.

## 5. Kế hoạch tiếp theo — Phase 9: Ổn định hóa + hoàn thiện offline

Sau khi Phase 8 merge, ưu tiên không thêm quá nhiều feature mới ngay. Phase 9 tập trung chất lượng:

1. Rà soát desktop/mobile các tổ hợp: normal, review, Listen, Memory, topic, profile.
2. Kiểm tra các wrapper `showText/setMode/checkNext` để phát hiện xung đột giữa module sau nhiều phase.
3. Thêm smoke-test JS thuần cho các hàm không phụ thuộc DOM: topic mapping, Auto level, Telex/VNI, accent detection.
4. Thêm trang/chế độ debug chỉ dành phụ huynh/dev nếu cần, mặc định ẩn.
5. Mở rộng thống kê Nâng cao/Tự do mà không làm nhiễu adaptive stats Đơn giản.
6. Gom dependency `../IMG/...` vào repo hoặc tạo fallback local.
7. Đưa audio binary cần thiết vào repo khi có luồng upload phù hợp.
8. Nếu muốn offline 100%, tải Twemoji SVG đang dùng về local thay vì CDN.
9. Rà soát accessibility: focus, aria, keyboard navigation.
10. Rà soát hiệu năng `localStorage`, tránh write quá dày khi dữ liệu lớn.
11. Cập nhật HANDOFF trong mọi đợt sửa.

## 6. Việc còn tồn đọng

- Audio binary remote chưa được bổ sung.
- Dependency `../IMG/...` của UI gốc chưa gom vào repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Phase 3 đang dùng Twemoji CDN; chưa offline 100%.
- Nâng cao/Tự do chưa có adaptive prompt stats như Đơn giản.
