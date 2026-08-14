const freePoems = [
{
    title: "🧸 01. Bé tập gõ",
    content: `Bé ngồi ngay ngắn
Tay đặt bàn phím
Gõ từng chữ nhỏ
Chậm mà thật êm`
},
{
    title: "🌈 02. Ngón tay vui vẻ",
    content: `Mười ngón tay xinh
Nhảy trên bàn phím
Ngón này gõ chữ
Ngón kia tìm tìm`
},
{
    title: "☀️ 03. Buổi sáng",
    content: `Buổi sáng thức dậy
Đánh răng rửa mặt
Ăn sáng đầy đủ
Sẵn sàng đi học`
},
{
    title: "🐱 04. Con mèo nhỏ",
    content: `Con mèo nhỏ xíu
Lông mềm như bông
Kêu meo meo nhỏ
Nghe thật thích không`
},
{
    title: "🌳 05. Cây xanh",
    content: `Cây xanh trước cửa
Lá rung nhẹ bay
Gió thổi nhè nhẹ
Mát cả mỗi ngày`
},
{
    title: "🚗 06. Xe đạp",
    content: `Chiếc xe đạp nhỏ
Lăn bánh trên đường
Em đạp thật nhanh
Cười vang yêu thương`
},
{
    title: "🌙 07. Ban đêm",
    content: `Đêm về yên tĩnh
Trăng sáng lung linh
Sao trời lấp lánh
Đẹp như chuyện xinh`
},
{
    title: "📚 08. Đi học",
    content: `Em đi đến lớp
Gặp bạn gặp cô
Học bài chăm chỉ
Ai cũng hoan hô`
},
{
    title: "🌸 09. Hoa đẹp",
    content: `Bông hoa nho nhỏ
Nở giữa vườn xanh
Hương thơm dịu nhẹ
Bay khắp xung quanh`
},
{
    title: "🐦 10. Chim nhỏ",
    content: `Chim bay líu lo
Trên cành cây cao
Hót vang buổi sớm
Nghe thật ngọt ngào`
},
{
    title: "🌊 11. Biển xanh",
    content: `Biển xanh rộng lớn
Sóng vỗ rì rào
Gió thổi mát quá
Thích biết là bao`
},
{
    title: "🏫 12. Trường em",
    content: `Trường em thân yêu
Có thầy có bạn
Mỗi ngày đến lớp
Niềm vui vô hạn`
},
{
    title: "🍎 13. Trái cây",
    content: `Quả cam màu vàng
Ngọt thơm dễ ăn
Ăn vào khỏe mạnh
Ai cũng thích ăn`
},
{
    title: "🐶 14. Con chó",
    content: `Con chó giữ nhà
Trung thành đáng yêu
Vẫy đuôi mừng rỡ
Khi em về chiều`
},
{
    title: "🌧️ 15. Trời mưa",
    content: `Trời mưa lất phất
Hạt rơi tí tách
Đường đi ướt hết
Em đi thật chậm`
},
{
    title: "☁️ 16. Bầu trời",
    content: `Bầu trời xanh biếc
Mây trắng bay xa
Nắng vàng chiếu sáng
Đẹp quá thật là`
},
{
    title: "🧃 17. Uống nước",
    content: `Uống nước mỗi ngày
Giữ cơ thể khỏe
Chăm chỉ luyện tập
Tinh thần vui vẻ`
},
{
    title: "🎨 18. Vẽ tranh",
    content: `Em vẽ bức tranh
Có nhà có cây
Có thêm ông mặt trời
Đang cười thật tươi`
},
{
    title: "🧑‍🤝‍🧑 19. Bạn bè",
    content: `Bạn bè thân thiết
Chơi cùng với nhau
Chia sẻ đồ chơi
Vui biết là bao`
},
{
    title: "⭐ 20. Chăm học",
    content: `Học đều mỗi ngày
Viết chữ thật đẹp
Gõ nhanh gõ đúng
Ai nhìn cũng khen`
},
{
    title: "🐱 21. Con mèo của em",
    content: `Con mèo của em rất dễ thương.
Nó có bộ lông mềm và mịn.
Mỗi ngày, mèo thích nằm ngủ trên ghế.
Em rất yêu con mèo của mình.`
},
{
    title: "🌞 22. Buổi sáng của em",
    content: `Buổi sáng, em thức dậy sớm.
Em đánh răng và rửa mặt sạch sẽ.
Sau đó, em ăn sáng cùng gia đình.
Một ngày mới bắt đầu thật vui vẻ.`
},
{
    title: "🏫 23. Ngày đi học",
    content: `Mỗi ngày, em đi học đúng giờ.
Ở trường, em gặp thầy cô và bạn bè.
Em học đọc, học viết và học gõ chữ.
Em rất thích đến trường.`
},
{
    title: "🌳 24. Cây trước nhà",
    content: `Trước nhà em có một cây xanh.
Cây cho bóng mát vào những ngày nắng.
Lá cây rung nhẹ khi có gió.
Em rất thích ngồi dưới gốc cây.`
},
{
    title: "🐶 25. Con chó nhỏ",
    content: `Nhà em có một con chó nhỏ.
Nó rất trung thành và đáng yêu.
Mỗi khi em đi học về, nó chạy ra đón.
Em xem nó như một người bạn.`
},
{
    title: "🍎 26. Bữa ăn gia đình",
    content: `Gia đình em thường ăn cơm cùng nhau.
Mẹ nấu nhiều món ăn ngon.
Cả nhà vừa ăn vừa trò chuyện vui vẻ.
Em rất thích những bữa cơm này.`
},
{
    title: "🌧️ 27. Trời mưa",
    content: `Hôm nay trời mưa nhẹ.
Những giọt mưa rơi tí tách trên mái nhà.
Không khí trở nên mát mẻ hơn.
Em thích ngồi nghe tiếng mưa rơi.`
},
{
    title: "🚲 28. Đi xe đạp",
    content: `Em có một chiếc xe đạp nhỏ.
Mỗi chiều, em thường đạp xe quanh nhà.
Gió thổi nhẹ làm em rất thích.
Đi xe đạp giúp em khỏe mạnh hơn.`
},
{
    title: "📚 29. Giờ học",
    content: `Trong giờ học, em luôn chú ý nghe giảng.
Em chăm chỉ làm bài tập.
Khi không hiểu, em hỏi thầy cô.
Nhờ vậy, em học ngày càng tốt hơn.`
},
{
    title: "🌙 30. Buổi tối",
    content: `Buổi tối, em làm bài tập xong.
Sau đó, em xem một chút tivi.
Trước khi ngủ, em đọc một cuốn sách.
Em đi ngủ sớm để giữ sức khỏe.`
}
];

const hardTexts = freePoems.flatMap(item =>
    item.content
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
);
