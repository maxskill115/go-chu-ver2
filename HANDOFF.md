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
  - [ ] Đợt tiếp: asset/offline + accessibility + storage audit.

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
- Phase 9 stabilization đợt 2: branch `agent/phase9-stabilization-2`, PR/commit cập nhật sau merge.

## 4. Các hệ thống hiện có

### Phase 1 — Feedback lỗi

- Levenshtein căn sai/thừa/thiếu.
- Thiếu 1 ký tự không làm sai cascade phần sau.
- Hotfix UI: không còn hàng ô đỏ và `SP`; chỉ tô nhẹ phần sai.

### Phase 2 — Smart Review

- Legacy key: `goChuVer2.promptStats.v1`.
- Entry: `correct`, `wrong`, `lastCorrectAt`, `lastWrongAt`.
- Phase 8 bổ sung: `accentErrors`, `lastAccentErrorAt`.
- Weakness: `wrong * 2 - correct`.
- Ôn lại tối đa 20 prompt yếu/lượt.
- **Chỉ Easy / Listen / Memory ghi vào `promptStats`.**

### Phase 3 — Visual

- `visual-data.js`, `visual-prompt.js/css`.
- Twemoji SVG pinned `jdecked/twemoji@17.0.3`.
- `THIRD_PARTY.md` ghi attribution.
- SVG lỗi/mất mạng → emoji fallback.

### Phase 4 — Listen

- Web Speech API.
- Chỉ dùng voice `lang` bắt đầu `vi`.
- Key voice thiết bị: `goChuVer2.viVoice.v1`.
- Speech rate `0.76`.
- Listen và Memory loại trừ nhau.

### Phase 5 — Memory

- 2 / 3 / 4 từ.
- 3 / 5 / 7 giây.
- Hết thời gian mới mở input.
- Giữ hình, không hiện Telex/VNI guide để tránh lộ đáp án.

### Phase 6 — Topic / Level

- Tất cả / Động vật / Gia đình / Đồ ăn / Thiên nhiên / Trường học / Đồ vật / Cơ thể / Màu sắc / Cảm xúc.
- Auto level:
  - mặc định 2 từ;
  - >= 8 lượt + accuracy < 65% → 1 từ;
  - >= 15 lượt + accuracy >= 88% → 3 từ;
  - >= 40 lượt + accuracy >= 92% → 4 từ.
- Mức không có dữ liệu → mức gần nhất.
- Đã tránh collision như `mặt trời`/Cơ thể, `màu cam`/Đồ ăn.

### Phase 7 — Profiles / Dashboard

- Registry: `goChuVer2.profiles.v1`.
- Active: `goChuVer2.activeProfile.v1`.
- Data: `goChuVer2.profile.<profileId>.v1`.
- Lần đầu tạo **Bé 1** và migrate stats/topic/level/Memory legacy.
- Profile giữ:
  - `promptStats` của Easy;
  - `modeStats.hard/free` từ Phase 9 đợt 2;
  - thời gian hôm nay/tổng;
  - topic/level;
  - Memory words/seconds.
- Voice/volume/hoa-thường là setting thiết bị, không tách theo bé.
- Dashboard: tổng quan, weak prompts, stats theo topic, lỗi dấu, stats theo mode, reset, export/import JSON.

### Phase 8 — Vietnamese input

Files:

- `vietnamese-input.js`.
- `vietnamese-input.css`.
- `vietnamese-dashboard.js`.

Key thiết bị:

- `goChuVer2.inputGuide.v1` = `off | telex | vni`.

Behavior:

- Progress theo từng từ chỉ ở Easy.
- Done/current/mismatch bằng highlight/underline nhẹ.
- Listen/Memory che luôn span progress để không lộ đáp án.
- Accent-only detection nhận `meo → mèo`, `di → đi`.
- `accentErrors` nằm trong promptStats nên tự theo profile + backup.
- Telex/VNI chỉ gợi ý, không sửa input/IME.
- Composition events được tôn trọng.
- Telex: `ă aw`, `â aa`, `ê ee`, `ô oo`, `ơ ow`, `ư uw`, `đ dd`, tone `s/f/r/x/j`.
- VNI: `ă a8`, `â a6`, `ê e6`, `ô o6`, `ơ o7`, `ư u7`, `đ d9`, tone `1/2/3/4/5`.
- Đã test thủ công mapping: `bé`, `mèo`, `đường`, `tiếng`, `trường`, `cảm`, `ơn`, `người`, `học`, `chữ`.

## 5. Phase 9 — Ổn định hóa

### Đợt 1 — Smoke test + QA checklist ✅

Đã merge qua PR #10 → `36d16dc`:

- `debug-smoke.js`.
- `QA_CHECKLIST.md`.
- `index.html` nạp `debug-smoke.js` sau toàn bộ app.
- Smoke test mặc định không tự chạy.

Chạy bằng:

```text
index.html?debug=1
```

hoặc Console:

```js
runGoChuSmokeTests()
```

### Đợt 2 — Audit wrapper + stats Nâng cao/Tự do ✅

Branch: `agent/phase9-stabilization-2`.

Files/phạm vi:

- `mode-stats.js` — stats riêng Hard/Free.
- `RUNTIME_ARCHITECTURE.md` — tài liệu load order và wrapper chain.
- `debug-smoke.js` — thêm runtime/schema tests.
- `index.html` — nạp `mode-stats.js` **sau `script.js`**.
- `HANDOFF.md`.

#### Kết quả audit wrapper

Không refactor lớn vì chuỗi hiện tại đang hoạt động và chưa phát hiện vòng gọi đệ quy. Thứ tự chính được khóa/tài liệu hóa trong `RUNTIME_ARCHITECTURE.md`.

Chuỗi quan trọng:

- `showText`: core → smart → visual → listen → memory → topic → vietnamese → mode-stats.
- `setMode`: core → smart → listen → memory → topic → vietnamese.
- `checkNext`: core → smart implementation → memory wrapper → mode-stats wrapper.
- `showTypingDiff`: core → UX hotfix renderer → Vietnamese accent wrapper.
- `setListenMode`: listen → UX voice guard → memory mutual-exclusion → Vietnamese guide refresh.

Invariant bắt buộc:

- Listen và Memory không cùng active.
- Mỗi wrapper gọi base đúng một lần.
- Module nào cần `submitFreeAnswer`/`setFreeTarget` phải nạp sau `script.js`.

#### Stats Nâng cao / Tự do

Schema profile bổ sung:

```text
modeStats: {
  hard: { correct, wrong, lastCorrectAt, lastWrongAt },
  free: { correct, wrong, lastCorrectAt, lastWrongAt }
}
```

Quy tắc:

- Hard: cùng một prompt sai nhiều lần chỉ ghi tối đa **1 sai**; khi giải đúng ghi **1 đúng**.
- Free: cùng một target sai nhiều lần chỉ ghi tối đa **1 sai**; hoàn thành đúng ghi **1 đúng**.
- `modeStats` được lưu trong đúng hồ sơ bé hiện tại và đi theo export/import backup.
- Hard/Free **không ghi vào `promptStats`**, không tham gia weakness, Ôn lại, topic Auto level hoặc adaptive Easy.
- Dashboard tổng quan `Lượt luyện / Đúng / Sai / Chính xác` cộng Easy + Hard + Free.
- Dashboard thêm mục **Theo chế độ** để xem riêng Đơn giản / Nâng cao / Tự do.
- `Cần ôn` và `Lỗi dấu` vẫn là dữ liệu Easy.

#### Smoke test mở rộng

Đã thêm kiểm tra:

- final runtime functions tồn tại: `showText`, `setMode`, `checkNext`, `nextPromptForCurrentMode`, `submitFreeAnswer`, `setListenMode`, `setMemoryMode`;
- Listen/Memory không cùng active;
- profile có `modeStats.hard/free`;
- schema Hard/Free có `attempts = correct + wrong`;
- Hard/Free không bị đưa vào `promptStats` adaptive.

### Plan tiếp theo Phase 9

1. Chạy smoke/QA trên deploy thực tế và xử lý lỗi nếu có.
2. Gom dependency `../IMG/...` vào repo hoặc thêm fallback local để trang đứng độc lập hơn.
3. Đưa audio binary cần thiết vào repo khi có luồng upload binary phù hợp.
4. Nếu muốn offline 100%, tải các Twemoji SVG thực sự đang dùng về local thay CDN.
5. Accessibility: focus trap dashboard, trả focus về nút mở, aria trạng thái, keyboard-only.
6. Audit `localStorage`/backup khi profile lớn; tránh normalize/save quá nhiều dữ liệu không đổi.
7. Dọn các branch thử Phase 2 nếu không còn cần.
8. Sau khi ổn định mới cân nhắc feature mới thay vì tiếp tục chồng wrapper.

## 6. Tồn đọng

- Audio binary remote chưa bổ sung.
- `../IMG/...` còn phụ thuộc ngoài repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Twemoji đang dùng CDN, chưa offline 100%.
- Hard/Free đã có stats tổng riêng nhưng **adaptive/weakness vẫn cố ý chỉ dành cho Easy**.
