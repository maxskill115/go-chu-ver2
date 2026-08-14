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

#### 1. Bỏ auto-fullscreen hoàn toàn

- Xóa `requestAppFullscreen()` khỏi runtime.
- Xóa listener toàn cục `click/keydown/wheel` dùng fullscreen.
- Nếu sau này cần fullscreen phải thêm nút riêng do người dùng chủ động bấm.

#### 2. Throttle Free resize/input

`script.js`:

- resize Free mode đi qua `scheduleFreeLayoutSync()`.
- input Free đi qua `scheduleFreeTypingState()`.
- dùng `requestAnimationFrame` để tối đa 1 update/frame, tránh mobile keyboard/resize bắn dồn event.

#### 3. Giảm DOM + request ảnh ở dropdown Tự do

File mới:

```text
stability-fixes.js
```

Trước đây mỗi lần mở danh sách bài:

- xóa menu cũ;
- tạo lại khoảng 58 button;
- mỗi option mang một `../IMG/gochu_tudo (...).png`.

Fix:

- render menu một lần;
- dùng `DocumentFragment`;
- option danh sách dùng emoji nhẹ `📖 / ✍️`;
- chỉ item đang chọn bên ngoài menu giữ ảnh thật;
- tránh hàng chục request ảnh mỗi lần mở dropdown.

#### 4. Cleanup khi pagehide

`stability-fixes.js` dọn các timeout/audio transient khi trang rời vòng đời.

#### 5. Performance diagnostics

File mới:

```text
performance-health.js
```

Theo dõi:

- Long Tasks API nếu browser hỗ trợ;
- số long task;
- tổng/max/average duration;
- runtime `error`;
- `unhandledrejection`;
- giữ tối đa 20 record gần nhất.

Debug:

```js
getGoChuPerformanceHealth()
printGoChuPerformanceHealth()
```

#### 6. Regression guard

`tools/verify_repository.py` fail nếu:

- auto-fullscreen runtime quay lại `script.js`;
- listener nặng trên `wheel/keydown` quay lại;
- Free resize/input mất rAF throttle;
- Free dropdown mất single-render guard;
- dropdown lại gắn ảnh nặng cho mọi option;
- performance diagnostics bị xóa.

### Invariant stability mới

```text
Không tự request fullscreen từ global interaction.
Không rebuild danh sách 50+ DOM item mỗi lần mở menu.
Không chạy layout-heavy resize/input nhiều lần trong cùng frame.
Nếu còn treo phải có performance/error diagnostics để lần ra nguyên nhân.
```

---

## 7. CI / regression guard

`.github/workflows/verify.yml` hiện chạy:

1. compile Python tools;
2. `node --check` toàn bộ JS root;
3. `tools/verify_repository.py`;
4. `tools/check_deploy_ready.py`;
5. Twemoji dry-run;
6. Google TTS dry-run.

CI đã PASS các PR #19, #20, #22, #24 và #26.

---

## 8. Listen / Google TTS

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

## 9. Visual pipeline

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

## 10. QA / deploy

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

## 11. Việc assistant tiếp tục

1. Nếu vẫn có treo sau PR #26, dùng diagnostics để xác định long task/error cụ thể thay vì đoán.
2. Audit background audio lifecycle và wrapper chain nếu diagnostics còn báo long task.
3. Rà desktop/mobile CSS và branch/file thừa.
4. Tiếp tục giảm công việc đồng bộ trên main thread nếu profiler chỉ ra điểm nóng.

---

## 12. Việc chờ người dùng

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

## 13. Release gate cuối

1. `python tools/verify_repository.py` PASS.
2. `python tools/check_deploy_ready.py --strict` PASS.
3. `?debug=1` smoke PASS.
4. Network Offline test.
5. Desktop test.
6. Mobile 360×640 / 390×844 / 640×360.
7. Easy / Hard / Free / Listen / Memory / profile/dashboard.
8. Local MP3 + local Twemoji thật.
9. Deploy QA thực tế.
