# HANDOFF — go-chu-ver2

## 1. Mục tiêu

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, độ khó thích nghi, hồ sơ riêng và hỗ trợ tiếng Việt.

### Quy tắc phát triển

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi phase lớn: branch riêng → PR → CI → squash merge `main`.
- Mọi plan, thay đổi, quyết định kỹ thuật, PR/commit và việc còn lại đều cập nhật ở đây.
- Không phá mode không liên quan.
- UI phải dùng tốt desktop + mobile.
- Không đưa API key/credential vào browser/runtime.

---

## 2. Roadmap

- [x] Phase 0 — Khởi tạo ver2.
- [x] Phase 1 — Levenshtein diff + hotfix UI bỏ ô đỏ/SP.
- [x] Phase 2 — Smart random + prompt yếu + Ôn lại.
- [x] Phase 3 — Ảnh + chữ + emoji fallback.
- [x] Phase 4 — Nghe rồi gõ, voice Việt.
- [x] Phase 5 — Nhớ rồi gõ.
- [x] Phase 6 — Chủ đề + cấp độ.
- [x] Phase 7 — Hồ sơ bé + dashboard + backup.
- [x] Phase 8 — Progress theo từ + lỗi dấu + Telex/VNI.

### Phase 9 — Stabilization / QA / offline

- [x] Đợt 1 — smoke test + QA checklist.
- [x] Đợt 2 — wrapper audit + Hard/Free stats.
- [x] Đợt 3 — accessibility + keyboard.
- [x] Đợt 4 — storage audit.
- [x] Đợt 5 — asset reliability + fallback.
- [x] Đợt 6 — offline visual framework + CI/static verify.
- [x] Đợt 7 — deploy QA prep + readiness report.
- [x] Đợt 8 — UI scope + visual accuracy + regression guards.
- [x] Đợt 9 — visual mapping round 2.
- [x] **Đợt 10 — freeze/stability audit + runtime diagnostics.**
- [ ] **Đợt 11 — Easy startup performance rewrite.**
- [ ] **Đợt 12 — Responsive UI redesign PC/mobile.**
- [ ] Vendor/commit SVG Twemoji thật nếu muốn offline visual 100%.
- [ ] Deploy QA thực tế sau khi binary hoàn tất.

### Phase 10 — Pre-rendered Google TTS MP3

- [x] Runtime MP3 local-first + Web Speech fallback.
- [x] Google Cloud TTS renderer + Windows `.bat`.
- [x] Manifest deterministic + resume/incremental.
- [x] QA/static checks/docs.
- [ ] Người dùng render MP3 thật.
- [ ] Commit `Audio/tts/*.mp3` + manifest đầy đủ.

---

## 3. PR / commit chính

- Phase 1: PR #1 → `1e8450b`
- Phase 2: PR #2 → `11b5689`
- Phase 3: PR #3 → `e0fe068`
- Phase 4: PR #4 → `6cc6b00`
- Hotfix UX/voice: PR #5 → `26cdb63`
- Phase 5: PR #6 → `daecd42`
- Phase 6: PR #7 → `18552e0`
- Phase 7: PR #8 → `e281c40`
- Phase 8: PR #9 → `10d756e`
- Phase 9 đợt 1: PR #10 → `36d16dc`
- Phase 9 đợt 2: PR #12 → `7d598f2`
- Phase 9 đợt 3: PR #13 → `94bb3ef`
- Phase 9 đợt 4: PR #14 → `d750722`
- Phase 9 đợt 5: PR #15 → `0e0ce0e`
- Phase 10 framework: PR #17 → `b7e52fd`
- Handoff Phase 10: PR #18 → `bb6303a`
- Phase 9 đợt 6: PR #19 → `58f295d`
- Phase 9 đợt 7: PR #20 → `24f6673`
- Phase 9 đợt 8: PR #22 → `14d04bd`
- Handoff đợt 8: PR #23 → `6b73ff8`
- Phase 9 đợt 9 visual round 2: PR #24 → `ed76406`
- Phase 9 đợt 10 freeze/stability: PR #26 → `25d2727`

Tooling scaffolding trước đợt 6:

- `tools/vendor_twemoji.py` → `c35c53f`
- `twemoji-local-manifest.js` → `a98d2c5`
- `OFFLINE_VISUAL.md` → `853541d`

---

## 4. Phạm vi mode — invariant bắt buộc

### Easy-only

Chỉ Easy được hiển thị/chạy:

- Topic / Level.
- Smart Review / Ôn lại.
- Visual prompt.
- Listen / Nghe rồi gõ.
- Memory / Nhớ rồi gõ.
- Adaptive prompt stats.

### Hard

- Chỉ prompt nâng cao + input + check + Hard stats.
- Không được nhìn thấy Listen / Memory / Topic-Level / Smart Review / Visual.

### Free

- Chỉ setup/custom text/typing Free + Free stats.
- Không được nhìn thấy control Easy.

---

## 5. UI scope / visual fix

### PR #22 → `14d04bd`

Đã sửa:

- Listen/TTS ẩn hoàn toàn ngoài Easy.
- Smart Review ẩn hoàn toàn ngoài Easy.
- Visual chỉ chạy Easy và refresh ngay khi đổi mode.
- `.hidden-by-mode { display:none !important; }` làm regression guard.
- Listen inactive chỉ còn nút `Nghe rồi gõ`.
- Memory inactive chỉ còn nút `Nhớ rồi gõ`.
- khi active mới hiện replay/status/select.
- mobile/landscape giảm padding/min-height.

### Visual semantic mapping

Mapping cũ dùng `includes(keyword)` nên dễ sai với `cam`, `cây`, `nước`, `nhà`...

Mapping mới:

```text
exact: [...]      // toàn prompt
contains: [...]   // phrase whitelist rõ nghĩa
```

Nếu không chắc → **ẩn hình**, không ép hình gần nghĩa.

### PR #24 → `ed76406`

Mở rộng visual đúng nghĩa cho sư tử, hổ, gấu, sói, cáo, nai/hươu, rùa, rắn, ếch, cua, tôm, cá mập, cá heo, chim cánh cụt, đại bàng, cú, ong, bướm.

---

## 6. Freeze / stability audit — Phase 9 đợt 10

Đã merge qua PR #26 → `25d2727`.

CI ban đầu bắt một false-positive do verifier match chữ `requestFullscreen` trong comment. Verifier được sửa để chỉ bắt runtime thật; run sau đó PASS toàn bộ trước khi merge.

### Nguyên nhân nghiêm trọng đã tìm thấy

`script.js` cũ tự gọi fullscreen trên:

```text
click
keydown
wheel
```

Điều này có nghĩa mỗi lần bé gõ phím hoặc cuộn chuột, browser có thể nhận thêm yêu cầu `requestFullscreen()`. Nếu browser từ chối hoặc fullscreen bị thoát, yêu cầu có thể lặp liên tục và gây giật/đơ.

### Fix đã merge

- Xóa auto-fullscreen runtime.
- Throttle Free resize/input bằng `requestAnimationFrame`.
- Free dropdown render một lần, bỏ tải hàng chục ảnh thumbnail mỗi lần mở.
- Cleanup transient timer/audio khi `pagehide`.
- Thêm `performance-health.js` theo dõi Long Task, runtime error và unhandled rejection.

Debug:

```js
getGoChuPerformanceHealth()
printGoChuPerformanceHealth()
```

### Invariant stability

```text
Không tự request fullscreen từ global interaction.
Không rebuild danh sách 50+ DOM item mỗi lần mở menu.
Không chạy layout-heavy resize/input nhiều lần trong cùng frame.
Nếu còn treo phải có performance/error diagnostics để lần ra nguyên nhân.
```

---

## 7. Plan Phase 9 đợt 11 — Easy startup performance rewrite

### Vấn đề mới được xác nhận từ sử dụng thực tế

Người dùng báo **vừa vào web ở mode Đơn giản đã lag rất mạnh, gần như treo máy**, dù auto-fullscreen đã được loại bỏ.

Audit kiến trúc cho thấy Easy hiện là mode nặng nhất vì một lần `showText()` phải đi qua nhiều wrapper nối tiếp:

```text
script-core
→ smart-review
→ visual-prompt
→ listen-mode
→ memory-mode
→ topic-level
→ vietnamese-input
→ mode-stats
```

Ngoài ra `setMode("easy")` cũng kích hoạt nhiều lớp UI/state ngay khi trang vừa load.

### Mục tiêu đợt 11

**Ưu tiên hiệu năng trước khi redesign UI. Không redesign trên nền runtime đang lag.**

#### 11.1 Đo startup thật

Bổ sung marker:

```text
navigation/start
profile init
Easy pool build
setMode easy
showText chain
first input ready
first visual ready
```

Mục tiêu có số đo ms cụ thể thay vì chỉ Long Task tổng quát.

#### 11.2 Tách render prompt khỏi side-effect

Không để mọi module bọc `showText()` nối dây dài mãi.

Plan:

```text
renderPromptCore()
→ render chữ + reset input/result

refreshEasyUiDeferred()
→ topic/review/visual/guide
→ chạy sau first paint
```

Các tính năng không cần cho frame đầu sẽ chạy `requestAnimationFrame`/idle sau khi input đã usable.

#### 11.3 Easy first-paint tối thiểu

Khi vào web, frame đầu chỉ cần:

```text
mode button
prompt chữ
input
nút Tiếp theo
```

Không block first paint vì:

- visual/CDN;
- dashboard stats;
- asset probing;
- Listen voice discovery;
- Memory controls;
- Smart Review count;
- Topic summary text.

#### 11.4 Lazy-init Easy tools

- Listen/TTS: chỉ initialize khi bé bấm `Nghe rồi gõ`.
- Memory: chỉ initialize countdown/control khi bấm `Nhớ rồi gõ`.
- Dashboard: chỉ render nội dung chi tiết khi mở dashboard.
- Asset probe: defer sau first interaction/idle.
- Visual: render sau prompt text, có timeout/network fallback độc lập.
- Smart Review summary: tính sau prompt render, không block input.

#### 11.5 Cache dữ liệu tính toán

- cache normalized Easy prompt;
- cache word count;
- cache topic membership;
- cache visual-rule match;
- không scan toàn bộ `easyWords`/topic rule lặp lại mỗi `showText()` nếu dữ liệu không đổi.

#### 11.6 Giảm localStorage synchronous work

- không serialize profile ngay trong hot path `showText()`/input;
- gom write theo dirty queue;
- flush theo interval/pagehide;
- dashboard đóng thì không render dashboard DOM khi stats thay đổi.

#### 11.7 Performance gate

Trước khi merge đợt 11:

```text
Easy first input ready: mục tiêu < 150 ms desktop, < 300 ms mobile tầm trung
showText normal: mục tiêu không có Long Task > 50 ms
không có network request nào được phép block input
```

Nếu không đạt, chưa chuyển sang redesign UI.

---

## 8. Plan Phase 9 đợt 12 — Responsive UI redesign PC/mobile

### Nhận xét từ screenshot hiện tại

- PC: khung chính quá hẹp so với màn hình nhưng lại quá cao; nhiều panel xếp dọc gây cuộn.
- Prompt bị đẩy lên/xuống khi toolbar thay đổi trạng thái.
- Topic/Level, Listen, Memory, Review đang chiếm gần bằng vùng học chính.
- Kết quả sai xuất hiện thành card rất cao, làm layout nhảy mạnh.
- HUD trái/phải và timer đang tách khỏi khung chính, thiếu hệ thống phân cấp thị giác.
- Dashboard tốt về dữ liệu nhưng dài, phải cuộn rất nhiều và có nested scroll.
- Mobile sẽ nghiêm trọng hơn vì các toolbar hiện thiên về desktop horizontal controls.

### Nguyên tắc redesign

```text
Prompt + input là trung tâm.
Tool phụ phải compact/collapsible.
Không để kết quả sai làm nhảy toàn bộ layout.
PC tận dụng chiều ngang.
Mobile ưu tiên 1 tay, ít cuộn, input luôn gần prompt.
```

### 12.1 Kiến trúc màn hình học mới

#### PC >= 1024px

```text
┌ Top utility: Menu | Profile | Timer | Settings ┐
│                                                │
│             Bé tập gõ chữ                     │
│       [Đơn giản] [Nâng cao] [Tự do]            │
│                                                │
│        PROMPT / VISUAL                         │
│                                                │
│  [Chủ đề] [Cấp độ]   [Nghe] [Nhớ] [Ôn lại]    │
│                                                │
│              INPUT                             │
│           [ Tiếp theo ]                        │
│                                                │
│     Feedback compact / fixed-height area       │
└────────────────────────────────────────────────┘
```

Các tool Easy chuyển từ **3 panel dọc** thành **một control strip 1–2 hàng**.

### 12.2 Mobile <= 767px

```text
Top: ☰   00:01:20   👤 ⚙

[Đơn giản ▾]

PROMPT lớn
visual nhỏ nếu có

INPUT
[Tiếp theo]

[Chủ đề] [Cấp độ]
[🔊 Nghe] [🧠 Nhớ] [📌 Ôn]

Feedback
```

- Mode selector dùng segmented dropdown/compact tabs.
- Không hiển thị title lớn `Bé tập gõ chữ` mọi lúc trên mobile; thu thành header nhỏ sau khi bắt đầu học.
- Input minimum 52–60px cao.
- Nút chính full-width hoặc tối thiểu 48px touch target.
- Tool phụ dùng bottom sheet/popover thay vì mở panel lớn trong flow.

### 12.3 Prompt area ổn định chiều cao

- dành sẵn vùng prompt/visual;
- khi không có ảnh vẫn giữ baseline hợp lý nhưng không tạo khoảng trắng thừa;
- khi highlight từ, chiều cao không đổi;
- timer không đè lên prompt.

### 12.4 Feedback sai mới

Không dùng card vàng cao như hiện tại.

PC:

```text
Sai: [chị] em  → Bé gõ: [12]
```

Mobile:

```text
❌ Chưa đúng
Cần: chị em
Gõ:   12
```

- fixed/min-height feedback zone;
- chỉ highlight phần sai;
- có thể thu gọn sau 2–3 giây nhưng không tự xóa thông tin khi bé đang xem.

### 12.5 Easy tools mới

- Topic + Level: một hàng.
- Listen / Memory / Review: icon button compact.
- Chỉ mở chi tiết khi active.
- Memory `Mức/Thời gian` mở inline popover khi bật, không chiếm panel thường trực.
- Listen `Nghe lại` chỉ xuất hiện khi Listen active.

### 12.6 Dashboard redesign

Desktop:

```text
Header profile
Summary cards 4 ô
Tabs: Tổng quan | Hay sai | Chủ đề | Chế độ | Dữ liệu
```

Mobile:

- full-screen sheet;
- summary 2 cột;
- từng mục qua tab/accordion;
- tránh dashboard một trang dài hàng nghìn px.

### 12.7 CSS architecture

Không chồng thêm một file override vô tận.

Plan:

```text
styles.css            → tokens/base
layout.css            → app shell/responsive grid
components.css        → buttons/input/panels
mode-easy.css         → Easy-only UI
profile-dashboard.css → dashboard
```

Giữ class/id logic hiện tại nếu có thể để giảm regression JS.

### 12.8 Breakpoint chính

```text
<= 480px     phone nhỏ
481–767px    phone lớn
768–1023px   tablet
>= 1024px    desktop
>= 1440px    wide desktop
```

Không thiết kế theo một kích thước ảnh duy nhất.

### 12.9 QA UI bắt buộc

```text
360×640
390×844
430×932
768×1024
1366×768
1440×900
1920×1080
```

Test thêm zoom 125%/150% và Windows display scaling.

---

## 9. Thứ tự triển khai đã chốt

```text
Bước 1 — Đợt 11: fix Easy startup lag
Bước 2 — benchmark + CI/performance gate
Bước 3 — Đợt 12A: dựng app shell responsive
Bước 4 — Đợt 12B: compact Easy toolbar
Bước 5 — Đợt 12C: feedback + prompt/input area
Bước 6 — Đợt 12D: dashboard tabs/mobile sheet
Bước 7 — cross-device QA
```

Không làm UI redesign trước khi Easy startup đạt performance gate.

---

## 10. CI / regression guard

`.github/workflows/verify.yml` hiện chạy:

1. compile Python tools;
2. `node --check` toàn bộ JS root;
3. `tools/verify_repository.py`;
4. `tools/check_deploy_ready.py`;
5. Twemoji dry-run;
6. Google TTS dry-run.

CI đã PASS các PR #19, #20, #22, #24 và #26.

Plan đợt 11 sẽ thêm performance/static guard cho Easy hot path.

---

## 11. Listen / Google TTS

Runtime **Easy-only**:

```text
1. MP3 Google TTS local
2. Web Speech voice tiếng Việt
3. báo thiếu audio
```

Default renderer:

```text
vi-VN-Chirp3-HD-Aoede
speaking rate 0.82
MP3
```

MP3 thật chưa render/commit vì chờ Google Cloud account của người dùng.

---

## 12. Visual pipeline

Twemoji pinned `jdecked/twemoji@17.0.3`.

```text
1. semantic rule match
2. local SVG nếu manifest có
3. CDN pinned Twemoji
4. emoji fallback
```

Nếu semantic rule không match → không hiện hình.

Debug:

```js
getGoChuVisualHealth()
```

---

## 13. QA / deploy

Local server:

```bat
tools\serve_local.bat
```

Debug:

```text
http://127.0.0.1:8000/?debug=1
```

Runtime debug:

```js
runGoChuSmokeTests()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
getGoChuPerformanceHealth()
printGoChuPerformanceHealth()
```

---

## 14. Việc assistant tiếp tục

1. Thực hiện Phase 9 đợt 11 trước: đo + giảm startup cost Easy.
2. Chỉ khi performance gate đạt mới bắt đầu Phase 9 đợt 12 UI redesign.
3. Sau redesign chạy QA đủ desktop/mobile breakpoint.
4. Không chờ Google TTS/Twemoji binary để làm hai đợt này.

---

## 15. Việc chờ người dùng

### Google TTS

- setup Google Cloud;
- nghe sample;
- chốt voice/rate;
- render MP3;
- commit `Audio/tts/*.mp3` + `tts-manifest.js`.

### Twemoji local 100%

```bat
tools\vendor_twemoji.bat
```

### Binary khác

4 Music/UI audio gốc vẫn chưa có remote.

---

## 16. Release gate cuối

1. `python tools/verify_repository.py` PASS.
2. Easy startup performance gate PASS.
3. `python tools/check_deploy_ready.py --strict` PASS khi binary đủ.
4. `?debug=1` smoke PASS.
5. Network Offline test.
6. Desktop/mobile responsive QA.
7. Easy / Hard / Free / Listen / Memory / profile/dashboard.
8. Local MP3 + local Twemoji thật.
9. Deploy QA thực tế.
