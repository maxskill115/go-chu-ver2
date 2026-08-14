# Google TTS pre-render — go-chu-ver2

## Mục tiêu

Chế độ **Nghe rồi gõ** ưu tiên phát MP3 đã render sẵn bằng Google Cloud Text-to-Speech thay vì phụ thuộc giọng đọc có sẵn trên trình duyệt/Windows.

Lợi ích:

- giọng tiếng Việt đồng nhất giữa các máy;
- chất lượng tốt hơn Web Speech tùy thiết bị;
- sau khi render xong có thể phát local/offline;
- không đưa Google credential/API key vào HTML;
- nếu thiếu MP3, web vẫn fallback sang Web Speech tiếng Việt hiện tại.

## Kiến trúc

```text
data-easy.js
    ↓
tools/render_google_tts.py
    ├─ Audio/tts/<sha1-16>.mp3
    └─ tts-manifest.js
             ↓
        tts-local.js
             ↓
      Listen / Nghe lại
```

`tts-manifest.js` map nguyên văn prompt → file MP3. Tên file dùng SHA-1 rút gọn để không gặp vấn đề với dấu tiếng Việt hoặc ký tự đặc biệt trên filesystem/URL.

## Voice mặc định

Tool mặc định:

```text
vi-VN-Chirp3-HD-Aoede
speaking rate = 0.82
```

Đây chỉ là default chất lượng cao. Có thể đổi voice mà không sửa web.

Một vài lựa chọn tiếng Việt hiện có trên Google Cloud TTS:

```text
vi-VN-Chirp3-HD-Aoede
vi-VN-Neural2-A
vi-VN-Wavenet-A
vi-VN-Standard-A
```

Dùng lệnh sau để xem danh sách thực tế của tài khoản/project tại thời điểm render:

```bat
py tools\render_google_tts.py --list-voices
```

## Cài đặt trên Windows

### 1. Google Cloud

- Tạo/chọn Google Cloud project.
- Bật Cloud Text-to-Speech API.
- Project phải có cấu hình billing/quota phù hợp với voice đang dùng.

### 2. Cài Google Cloud CLI

Sau khi cài:

```bat
gcloud init
gcloud auth application-default login
```

Tool Python dùng Application Default Credentials (ADC). Không tạo file API key trong repo.

### 3. Cài thư viện Python

Tại thư mục repo:

```bat
py -m pip install -r tools\requirements-tts.txt
```

## Test trước khi render toàn bộ

Nghe thử một câu:

```bat
py tools\render_google_tts.py --sample "bé đi học"
```

File thử:

```text
Audio/tts/_sample.mp3
```

Thử voice khác:

```bat
py tools\render_google_tts.py --sample "bé đi học" --voice vi-VN-Neural2-A
```

Thử tốc độ khác:

```bat
py tools\render_google_tts.py --sample "bé đi học" --speaking-rate 0.75
```

## Render toàn bộ Đơn giản

```bat
py tools\render_google_tts.py
```

Tool sẽ:

1. đọc `easyWords` từ `data-easy.js`;
2. loại prompt trùng;
3. render từng prompt thành MP3;
4. bỏ qua file đã có để có thể resume;
5. ghi lại `tts-manifest.js`;
6. nếu một request lỗi, tiếp tục các câu khác và báo lại cuối batch.

### Chạy thử 10 câu

```bat
py tools\render_google_tts.py --limit 10
```

### Chỉ render một số câu

```bat
py tools\render_google_tts.py --only "con mèo" --only "bé đi học"
```

### Render đè khi đổi voice/tốc độ

```bat
py tools\render_google_tts.py --force --voice vi-VN-Chirp3-HD-Aoede --speaking-rate 0.82
```

### Chỉ xem danh sách file, không gọi API

```bat
py tools\render_google_tts.py --dry-run
```

## Sau khi render

Kiểm tra:

```text
Audio/tts/*.mp3
tts-manifest.js
```

Sau đó commit cả MP3 và manifest:

```bat
git add Audio\tts tts-manifest.js
git commit -m "audio: render giọng đọc Google TTS"
git push
```

Không cần sửa `tts-local.js` khi thêm prompt mới. Chỉ chạy lại renderer; các MP3 có sẵn được skip, prompt mới sẽ được tạo thêm.

## Runtime behavior

Ưu tiên phát:

```text
1. MP3 Google TTS local
2. Web Speech voice tiếng Việt
3. báo thiếu audio nếu cả hai đều không có
```

Có thể kiểm tra runtime bằng Console:

```js
getGoChuTtsHealth()
```

Khi manifest còn rỗng, behavior gần như Phase 4/Hotfix cũ: web vẫn dùng voice tiếng Việt của thiết bị.

## Không làm

- Không gọi Google TTS trực tiếp từ browser.
- Không lưu credential/API key trong GitHub.
- Không render mỗi lần bé bấm nút.
- Không gửi prompt của bé lên Google trong runtime.
- Không tự đổi text trong `easyWords`.
