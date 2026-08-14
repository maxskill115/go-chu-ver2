# HANDOFF — go-chu-ver2

## 1. Mục tiêu

`go-chu-ver2` là web HTML/CSS/JS thuần để bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi, hồ sơ riêng từng bé và hỗ trợ gõ tiếng Việt.

### Quy tắc bắt buộc

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi phase lớn dùng branch/PR riêng, squash merge vào `main`.
- **Mọi thay đổi, plan, quyết định kỹ thuật, PR/commit và việc còn lại đều cập nhật `HANDOFF.md`.**
- Không phá mode không liên quan.
- UI mới phải dùng tốt desktop + mobile.

## 2. Roadmap trạng thái

- [x] **Phase 0** — Khởi tạo ver2.
- [x] **Phase 1** — Báo lỗi Levenshtein + hotfix UI không còn ô đỏ/SP.
- [x] **Phase 2** — Smart random + prompt yếu + Ôn lại.
- [x] **Phase 3** — Ảnh + chữ + fallback emoji.
- [x] **Phase 4** — Nghe rồi gõ, chỉ voice tiếng Việt.
- [x] **Phase 5** — Nhớ rồi gõ 2/3/4 từ, 3/5/7 giây.
- [x] **Phase 6** — 10 chủ đề + Auto/1/2/3/4 từ.
- [x] **Phase 7** — Nhiều hồ sơ bé + dashboard + backup JSON.
- [x] **Phase 8** — Progress theo từ + lỗi dấu + Telex/VNI guide.
- [~] **Phase 9** — Ổn định hóa, QA, offline, mở rộng stats.
  - [x] Đợt 1: smoke test + QA checklist.
  - [x] Đợt 2: audit wrapper + stats riêng Nâng cao/Tự do.
  - [x] Đợt 3: accessibility + keyboard navigation.
  - [x] Đợt 4: storage audit + no-op write dedupe.
  - [ ] Đợt tiếp: asset/offline reliability.

## 3. PR / commit chính

- Phase 1: PR #1 → `1e8450b`.
- Phase 2: PR #2 → `11b5689`.
- Phase 3: PR #3 → `e0fe068`.
- Phase 4: PR #4 → `6cc6b00`.
- Hotfix UX/voice: PR #5 → `26cdb63`.
- Phase 5: PR #6 → `daecd42`.
- Phase 6: PR #7 → `18552e0`.
- Phase 7: PR #8 → `e281c40`.
- Phase 8: PR #9 → `10d756e`.
- Phase 9 stabilization đợt 1: PR #10 → `36d16dc`.
- Phase 9 stabilization đợt 2: PR #12 → `7d598f2`.
- Phase 9 accessibility đợt 3: PR #13 → `94bb3ef`.
- Phase 9 storage audit đợt 4: branch `agent/phase9-storage-audit`, PR/commit cập nhật sau merge.

## 4. Các hệ thống hiện có

### Phase 1 — Feedback lỗi
- Levenshtein căn sai/thừa/thiếu.
- Hotfix UI không còn hàng ô đỏ và `SP`.

### Phase 2 — Smart Review
- Legacy key: `goChuVer2.promptStats.v1`.
- Entry: `correct`, `wrong`, `lastCorrectAt`, `lastWrongAt`, Phase 8 thêm `accentErrors`, `lastAccentErrorAt`.
- Weakness: `wrong * 2 - correct`.
- **Chỉ Easy / Listen / Memory ghi vào `promptStats`.**

### Phase 3 — Visual
- `visual-data.js`, `visual-prompt.js/css`.
- Twemoji SVG pinned `jdecked/twemoji@17.0.3`.
- SVG lỗi/mất mạng → emoji fallback.

### Phase 4 — Listen
- Web Speech API, chỉ voice `vi-*`.
- Key voice: `goChuVer2.viVoice.v1`.
- Speech rate `0.76`.
- Listen và Memory loại trừ nhau.

### Phase 5 — Memory
- 2 / 3 / 4 từ; 3 / 5 / 7 giây.
- Hết thời gian mới mở input.

### Phase 6 — Topic / Level
- 10 lựa chọn chủ đề.
- Auto / 1 / 2 / 3 / 4 từ.
- Auto: mặc định 2; >=8 lượt accuracy <65% → 1; >=15 lượt accuracy >=88% → 3; >=40 lượt accuracy >=92% → 4.

### Phase 7 — Profiles / Dashboard
- Registry: `goChuVer2.profiles.v1`.
- Active: `goChuVer2.activeProfile.v1`.
- Data: `goChuVer2.profile.<profileId>.v1`.
- Profile giữ `promptStats`, `modeStats.hard/free`, study time, topic/level và Memory preferences.
- Voice/volume/hoa-thường là setting thiết bị.

### Phase 8 — Vietnamese input
- `goChuVer2.inputGuide.v1` = `off | telex | vni`.
- Progress theo từng từ chỉ ở Easy.
- Accent-only detection nhận `meo → mèo`, `di → đi`.
- Telex/VNI chỉ gợi ý, không sửa IME/input.

## 5. Phase 9 — Ổn định hóa

### Đợt 1 — Smoke test + QA checklist ✅
PR #10 → `36d16dc`.

- `debug-smoke.js`, `QA_CHECKLIST.md`.
- Chạy bằng `?debug=1` hoặc `runGoChuSmokeTests()`.

### Đợt 2 — Audit wrapper + stats Nâng cao/Tự do ✅
PR #12 → `7d598f2`.

- `RUNTIME_ARCHITECTURE.md` khóa/tài liệu hóa load order + wrapper chain.
- `mode-stats.js` giữ Hard/Free tách khỏi adaptive Easy.
- Dashboard có tổng và breakdown theo mode.

### Đợt 3 — Accessibility + keyboard navigation ✅
PR #13 → `94bb3ef`.

- `accessibility.js/css` không bọc logic học.
- ARIA state/dialog semantics, focus trap, focus restore, `inert` background.
- `aria-live`, focus-visible, reduced-motion.
- Smoke + QA + runtime docs cập nhật.

### Đợt 4 — Storage audit + no-op write dedupe ✅
Branch: `agent/phase9-storage-audit`.

Files/phạm vi:

- `storage-health.js`.
- `index.html`.
- `debug-smoke.js`.
- `QA_CHECKLIST.md`.
- `RUNTIME_ARCHITECTURE.md`.
- `HANDOFF.md`.

#### Mục tiêu

Giảm write `localStorage` dư mà **không đổi schema, không debounce kết quả học, không đổi cadence study timer**.

#### Thay đổi

`storage-health.js` nạp sau `mode-stats.js`, trước accessibility/debug để serialization dùng final `normalizeProfileData` có cả `modeStats`.

Override tương đương:

- `saveProfileData(profileId, data)`;
- `saveProfilesRegistry()`.

Trước `localStorage.setItem`, code đọc current value và so với JSON mới:

- giống → skip write;
- khác → write như trước.

Quyết định an toàn:

- **Không dùng memory cache để quyết định skip**, tránh stale state sau import/reset/remove key.
- Vẫn normalize profile trước serialize.
- Không đổi key/version/schema.
- Study time vẫn flush khoảng 15 giây như Phase 7.
- Prompt result, accent error, Hard/Free result và preferences vẫn save ngay theo logic hiện có.

Debug API:

```js
getGoChuStorageHealth()
printGoChuStorageHealth()
goChuStorageMetrics
```

Report gồm:

- số key `goChuVer2.*`;
- số profile/profile key;
- dung lượng UTF-8 ước tính;
- 10 key lớn nhất;
- số write / write skip / error từ lúc module load.

Smoke tests bổ sung:

- storage health API tồn tại;
- report hợp lệ và nhìn thấy profile;
- hai profile save giống nhau liên tiếp tạo `profileWriteSkips`;
- registry không đổi tạo `registryWriteSkips`.

QA bổ sung export/import/reset sau dedupe để chắc không có stale storage.

### Plan tiếp theo Phase 9 — Asset/offline reliability

1. Rà tất cả dependency `../IMG/...`, phân loại: favicon/title/mode/free-poem/navigation.
2. Không tự tạo/đổi ảnh gốc; trước hết thêm **fallback hiển thị** khi asset ngoài repo thiếu.
3. Với Free poem icon, cân nhắc fallback emoji/text vì CSS background không có `error` event trực tiếp.
4. Rà Twemoji CDN: chỉ tải local các SVG thực sự được mapping nếu muốn offline 100%.
5. Audio binary giữ nguyên đường dẫn cho đến khi có file/binary upload phù hợp; không thay bài nhạc tùy tiện.
6. Chạy smoke + QA sau mỗi đợt asset để tránh layout shift/mobile regression.
7. Nếu có URL deploy thực tế, chạy QA trên deploy trước khi mở feature roadmap mới.

## 6. Tồn đọng

- Audio binary remote chưa bổ sung.
- `../IMG/...` còn phụ thuộc ngoài repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Twemoji đang dùng CDN, chưa offline 100%.
- Hard/Free đã có stats tổng riêng nhưng adaptive/weakness vẫn cố ý chỉ dành cho Easy.
