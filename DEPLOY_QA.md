# Deploy QA — go-chu-ver2

## Mục tiêu

Tách rõ 3 trạng thái:

1. **Code/runtime sẵn sàng** — CI/static checks PASS.
2. **Fallback-ready** — web vẫn dùng được khi thiếu binary local nhờ Web Speech/CDN/emoji/UI fallback.
3. **Offline/standalone-ready** — MP3/SVG/icon/audio cần thiết đã nằm trong repo và không phụ thuộc project cha/mạng.

## Chạy local đúng kiểu web

Không nên chỉ double-click `index.html` vì `file://` có thể khác HTTP về media/cache/path.

Windows:

```bat
tools\serve_local.bat
```

Mặc định:

```text
http://127.0.0.1:8000/
```

Debug:

```text
http://127.0.0.1:8000/?debug=1
```

Đổi port:

```bat
tools\serve_local.bat 8080
```

## Static verification

```bat
py tools\verify_repository.py
```

Kiểm tra file refs/load order/Twemoji manifest/TTS manifest/build tools mà không cần browser hoặc network.

## Deploy readiness report

```bat
py tools\check_deploy_ready.py
```

Report hiện trạng nhưng không fail vì binary đang chờ bổ sung.

Muốn dùng như release gate:

```bat
py tools\check_deploy_ready.py --strict
```

`--strict` fail nếu còn một trong các nhóm:

- TTS local chưa phủ đủ `easyWords`;
- Twemoji local chưa phủ đủ code đang dùng;
- 4 Music/UI audio binary chưa đủ;
- còn dependency `../IMG/...` của project cha.

## Browser QA bắt buộc

### Desktop

- Easy: random/topic/level/sai đúng.
- Smart Review.
- Listen: MP3 local nếu có, fallback Web Speech nếu thiếu.
- Memory.
- Hard.
- Free.
- Profile/dashboard.
- Settings/volume.
- Keyboard-only cho modal.

### Mobile

Ít nhất:

```text
360×640 portrait
390×844 portrait
640×360 landscape
```

Kiểm tra không horizontal scroll, input không bị đẩy khỏi viewport, modal scroll/focus đúng.

## Offline simulation

Sau khi đã vendor MP3/SVG:

1. mở trang một lần bằng local HTTP;
2. DevTools → Network → Offline;
3. reload;
4. visual prompt phải dùng local SVG/emoji;
5. Listen phải dùng local MP3 nếu coverage có;
6. không được crash khi UI/background audio còn thiếu;
7. navigation `../...` có thể vẫn fail nếu chạy repo standalone — đây là dependency project cha đã biết.

## Runtime diagnostics

Console:

```js
runGoChuSmokeTests()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
```

## CI

`.github/workflows/verify.yml` chạy trên PR và push `main`:

- compile Python tools;
- static repository verification;
- deploy readiness report;
- Twemoji dry-run;
- Google TTS dry-run.

Readiness report trong CI hiện là **informational**. Chỉ chuyển sang `--strict` sau khi binary local đã đủ và standalone/offline trở thành release requirement.

## Blocker hiện biết

- Google TTS MP3 chưa render thật.
- Twemoji SVG local chưa vendor thật.
- Music binary chưa đủ trên remote.
- `../IMG` là dependency project cha.

Các blocker này không đồng nghĩa code runtime hỏng; project đang có fallback tương ứng. Chỉ khi mục tiêu là **offline/standalone 100%** thì mới phải xử lý hết.
