# Pre-rendered Vietnamese TTS

Thư mục này chứa MP3 được sinh bởi:

```bash
py tools/render_google_tts.py
```

Quy ước:

- Mỗi câu/từ trong `easyWords` có một file `<sha1-16>.mp3`.
- `tts-manifest.js` map chính xác nội dung tiếng Việt → file MP3.
- Không đổi tên MP3 thủ công; chạy tool để tạo/update manifest.
- `_sample.mp3` chỉ dùng nghe thử voice và không được đưa vào manifest.
- Web ưu tiên MP3 ở đây; nếu một câu thiếu file, Web Speech tiếng Việt hiện tại được dùng làm fallback.

Không lưu Google credential/API key trong repo.
