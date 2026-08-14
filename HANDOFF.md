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
  - [ ] Đợt tiếp: storage audit + asset/offline reliability.

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
- Phase 9 accessibility đợt 3: branch `agent/phase9-accessibility`, PR/commit cập nhật sau merge.

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

## 5. Phase 9 — Ổn định hóa

### Đợt 1 — Smoke test + QA checklist ✅

PR #10 → `36d16dc`.

- Thêm `debug-smoke.js` và `QA_CHECKLIST.md`.
- Smoke test mặc định không chạy; dùng `?debug=1` hoặc `runGoChuSmokeTests()`.

### Đợt 2 — Audit wrapper + stats Nâng cao/Tự do ✅

PR #12 → `7d598f2`.

- Thêm `RUNTIME_ARCHITECTURE.md` để khóa/tài liệu hóa load order và wrapper chain.
- Thêm `mode-stats.js` sau `script.js`.
- Hard/Free có `modeStats` riêng theo profile, không ghi vào `promptStats` adaptive Easy.
- Dashboard tổng quan cộng Easy + Hard + Free, đồng thời có breakdown theo mode.
- Hard/Free sai lặp trong cùng prompt/target chỉ ghi tối đa 1 lần sai trước khi hoàn thành đúng.
- Smoke test có runtime function/invariant/schema checks.

Schema:

```text
modeStats: {
  hard: { correct, wrong, lastCorrectAt, lastWrongAt },
  free: { correct, wrong, lastCorrectAt, lastWrongAt }
}
```

Invariant:

- Listen và Memory không cùng active.
- Mỗi wrapper gọi base đúng một lần.
- Hard/Free không tham gia weakness, Ôn lại hay Auto level của Easy.

### Đợt 3 — Accessibility + keyboard navigation ✅

Branch: `agent/phase9-accessibility`.

Files/phạm vi:

- `accessibility.js`.
- `accessibility.css`.
- `styles.css`.
- `index.html`.
- `debug-smoke.js`.
- `QA_CHECKLIST.md`.
- `RUNTIME_ARCHITECTURE.md`.
- `HANDOFF.md`.

Quyết định kỹ thuật:

- **Không bọc thêm `showText`, `setMode`, `checkNext` hay logic học.** Accessibility chỉ quan sát DOM/trạng thái UI để giảm rủi ro regression.
- `accessibility.js` nạp sau `mode-stats.js` và trước `debug-smoke.js`.

Đã thêm:

- `aria-controls`, `aria-expanded`, `aria-hidden` cho Settings / game selector / profile dashboard.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` cho game selector; profile dashboard giữ dialog semantics có sẵn.
- `aria-live="polite"` cho feedback/result và các status chính.
- Input có `aria-describedby` trỏ tới feedback và Vietnamese guide khi tồn tại.
- Mở profile dashboard → focus vào nút đóng.
- Mở game selector → focus vào lựa chọn đầu tiên.
- Tab / Shift+Tab bị giữ trong modal đang mở.
- Khi đóng modal → focus trả về đúng nút 👤 hoặc ☰ đã mở modal.
- Background `.container` + HUD đặt `inert` khi modal mở để keyboard không lọt ra ngoài.
- Focus-visible outline rõ cho button/input/select/textarea.
- `prefers-reduced-motion: reduce` gần như tắt animation/transition.
- Không thay đổi behavior Escape hiện có; chỉ tận dụng handler cũ.

Smoke test bổ sung:

- Settings/Game/Profile có `aria-controls` đúng.
- `result` có `aria-live="polite"`.
- Game selector + profile dashboard có dialog semantics.

QA checklist bổ sung keyboard-only, focus trap, focus restore, inert và reduced-motion.

### Plan tiếp theo Phase 9

1. **Storage audit:** đo/giảm write `localStorage`, nhất là profile lớn và study timer; chỉ tối ưu nếu không đổi schema/behavior.
2. **Asset reliability:** giảm phụ thuộc `../IMG/...`; thêm fallback an toàn trước khi di chuyển asset thật.
3. **Offline visual:** nếu cần offline 100%, chỉ kéo các Twemoji SVG thực sự đang dùng về repo thay vì toàn bộ bộ icon.
4. **Audio binary:** đưa các file âm thanh cần thiết vào repo khi connector có luồng binary phù hợp hoặc người dùng upload file.
5. Chạy smoke + QA trên deploy thực tế nếu có URL deploy.
6. Dọn các branch thử Phase 2 nếu không còn cần.
7. Chỉ sau khi ổn định mới mở roadmap feature mới, tránh tiếp tục chồng wrapper.

## 6. Tồn đọng

- Audio binary remote chưa bổ sung.
- `../IMG/...` còn phụ thuộc ngoài repo.
- Hai branch thử Phase 2 có thể xóa thủ công.
- Twemoji đang dùng CDN, chưa offline 100%.
- Hard/Free đã có stats tổng riêng nhưng **adaptive/weakness vẫn cố ý chỉ dành cho Easy**.
