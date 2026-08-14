# Offline visual — Twemoji local

Mục tiêu: chỉ vendor đúng các SVG Twemoji đang được `promptVisualRules` sử dụng, không tải toàn bộ bộ Twemoji.

Trạng thái hiện tại:

- `visual-data.js` vẫn giữ CDN pinned `jdecked/twemoji@17.0.3`.
- `twemoji-local-manifest.js` mặc định rỗng.
- `tools/vendor_twemoji.py` đọc các `code` duy nhất từ `visual-data.js`.
- Sau khi vendor, runtime sẽ ưu tiên `assets/twemoji/<code>.svg`; nếu thiếu thì dùng CDN; CDN lỗi tiếp thì dùng emoji fallback của Phase 3.

Quy trình dự kiến:

```bat
py tools\vendor_twemoji.py
```

Sau khi tải xong, commit `assets/twemoji/*.svg` và `twemoji-local-manifest.js`.

Không vendor cả thư mục Twemoji upstream.
