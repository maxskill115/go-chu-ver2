# Asset inventory — go-chu-ver2

Mục tiêu: biết chính xác asset nào là local, asset nào nằm ngoài repo và fallback nào đang bảo vệ UI.

## 1. UI icons tham chiếu `../IMG/...`

Các asset này thuộc project cha/baseline gốc, hiện **không nằm trong repo `go-chu-ver2`**.

| Nhóm | Đường dẫn hiện tại | Nơi dùng | Fallback Phase 9 |
|---|---|---|---|
| Favicon | `../IMG/Icon_133.png` | favicon / shortcut / apple touch icon | chưa cần fallback UI; browser tự bỏ qua nếu thiếu |
| Title | `../IMG/Icon_135.png` | icon cạnh “Bé tập gõ chữ” | `⌨️` |
| Đơn giản | `../IMG/Icon_62.png` | mode Easy | `🔤` |
| Nâng cao | `../IMG/Icon_70.png` | mode Hard | `🧠` |
| Tự do | `../IMG/Icon_66.png` | mode Free | `✍️` |
| Nút dùng đoạn tự nhập | `../IMG/gochu_tudo (58).png` | Free setup | `✍️` |
| Icon bài Tự do | `../IMG/gochu_tudo (1..57).png` | select bài + màn bài | icon đang hiển thị fallback `📖` |

### Quyết định

- Không copy/đổi tên asset gốc khi chưa có binary nguồn thật.
- Không tạo ảnh thay thế giả.
- `asset-reliability.js` chỉ probe các icon UI chính và icon bài **đang hiển thị**.
- Không probe cả 57 icon bài cùng lúc để tránh hàng chục request 404 khi thư mục `../IMG` không tồn tại.
- Text của option bài Tự do vẫn luôn hiện, nên menu vẫn dùng được dù thumbnail item thiếu.

## 2. Prompt visual — Twemoji

Nguồn hiện tại:

```text
https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg
```

Mapping nằm trong `visual-data.js`.

Trạng thái:

- CDN được ghim phiên bản `17.0.3`.
- Mỗi rule có `fallback` emoji.
- `visual-prompt.js` dùng `img.onerror` để chuyển sang emoji nếu SVG tải lỗi/mất mạng.
- Vì vậy nội dung học **vẫn có visual fallback khi offline**, nhưng chưa phải offline asset 100%.

Nếu cần offline 100%:

1. lấy danh sách `code` duy nhất từ `promptVisualRules`;
2. chỉ tải các SVG đó về repo;
3. đổi base URL sang local;
4. giữ emoji fallback phòng file local lỗi.

Không cần tải toàn bộ Twemoji.

## 3. Audio

Code hiện giữ các đường dẫn:

```text
Music/background Music1.mp3
Music/background Music2.mp3
Music/Click.wav
Music/dung.wav
```

Repo hiện chỉ có `Music/README.md`; 4 binary audio chưa được đưa lên qua connector.

### Quyết định

- Không đổi nhạc khác.
- Không tạo audio giả.
- Không sửa đường dẫn để khi binary gốc được bổ sung, logic tự hoạt động lại.
- App vẫn chạy khi audio thiếu vì các `.play()` hiện đã có xử lý promise/catch; phần học không phụ thuộc audio để tính đúng/sai.

## 4. Navigation ngoài repo

Các link sau là dependency vào project cha, **không phải asset**:

```text
../main.html
../toán chơi.html
../toan-do-nang-cao/index.html
../tu tiên.html
```

Không sửa trong Phase 9 asset reliability vì thay navigation có thể làm sai integration với project gốc.

## 5. Runtime fallback module

Files:

- `asset-reliability.js`
- `asset-reliability.css`

Module nạp sau storage layer và trước accessibility/debug.

Behavior:

- asset tải được → giữ nguyên ảnh gốc;
- asset lỗi → thêm `.go-chu-asset-missing` và hiện fallback text/emoji;
- probe URL được cache theo URL để hai element dùng cùng asset không tạo request trùng;
- khi icon bài Tự do đổi, observer probe icon mới;
- probe async có token để kết quả asset cũ không ghi đè trạng thái asset mới.

Debug:

```js
getGoChuAssetHealth()
printGoChuAssetHealth()
```

Report gồm `ok`, `missing`, `pending` và URL/fallback từng asset đã probe.
