# UI QA — Phase 9.12 responsive redesign

## 1. Viewport matrix bắt buộc

```text
360×640
390×844
430×932
640×360 landscape
768×1024
1366×768
1440×900
1920×1080
```

Desktop kiểm tra thêm zoom 125% và 150%.

## 2. Global/HUD

- Không horizontal scroll.
- HUD luôn nằm trong viewport.
- Menu / Profile / Settings có vùng bấm khoảng 44–48px trở lên.
- Timer không đè icon.
- Settings panel mở dưới HUD, không tràn viewport.
- Post-startup warm-up vẫn giữ Hard/Free/Settings/Profile guard hiện có.

## 3. Easy

Initial screen:

- Prompt nhìn thấy ngay.
- Nếu có visual: visual + prompt cùng một hàng desktop; không đẩy input xuống quá xa.
- Nếu visual ẩn: prompt reclaim toàn chiều ngang.
- Topic/Level thành một toolbar compact.
- Listen / Memory / Review không còn ba card cao xếp dọc.
- Listen inactive chỉ còn nút bật.
- Memory inactive chỉ còn nút bật; select chỉ hiện khi active.
- Input là control nổi bật nhất.
- Next nằm ngay sau input.
- Feedback rỗng không chiếm chỗ.
- Feedback sai bị giới hạn chiều cao; không làm trang nhảy hàng trăm pixel.

Mobile:

- Không auto-open keyboard khi vừa vào Easy.
- Mode row vẫn đọc được ở 360px.
- Listen + Review cùng hàng; Memory hàng riêng.
- Input/Next rộng 100%.
- Bàn phím mở không tạo horizontal scroll.

Landscape 640×360:

- Title được ẩn để tiết kiệm chiều cao.
- Topic labels/status phụ được ẩn.
- Prompt/input/Next vẫn thao tác được.

## 4. Hard

- Không hiện Topic/Level/Listen/Memory/Review/Visual.
- Prompt, input, Next dùng cùng responsive shell.
- Không có khoảng trắng do Easy-only tool bị ẩn.
- Feedback sai/đúng dùng compact result layout.

## 5. Free

Setup:

- Selector/custom textarea không tràn ngang.
- Danh sách bài cuộn được trên mobile.
- Nút “Dùng đoạn này để luyện gõ” có vùng bấm đủ lớn.

Practice:

- Đoạn mẫu và textarea không vượt viewport.
- Floating Back/Submit/Next không che vùng nhập.
- Landscape thấp vẫn có thể gõ và submit.

## 6. Profile dashboard

Phase 9.12B xử lý riêng:

- Desktop: summary + tab sections.
- Mobile: full-screen sheet/tab/accordion.
- Không đưa dashboard CSS/DOM quay lại critical Easy path.

## 7. Performance invariant khi redesign

Responsive CSS phải nằm critical cascade để không flash layout cũ, nhưng:

- không `@import`;
- critical CSS count <= 6;
- không thêm JS vào first Easy path;
- không thay wrapper/load order;
- `printGoChuStartupPerformance()` vẫn đạt gate trước 12B.

## 8. Regression sau post-ready

Test:

```text
Easy → Hard → Easy → Free → Easy
Listen on/off
Memory on/off
Topic/Level change
Settings open/close
Profile dashboard open/close
```

Không console error, không duplicate handler, không horizontal overflow.
