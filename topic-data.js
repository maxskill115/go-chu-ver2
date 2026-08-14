/* ===== VER2 PHASE 6 - METADATA CHỦ ĐỀ ===== */
const GO_CHU_TOPICS = [
    { id: "all", label: "Tất cả", icon: "🌈" },
    { id: "animals", label: "Động vật", icon: "🐶" },
    { id: "family", label: "Gia đình", icon: "👨‍👩‍👧" },
    { id: "food", label: "Đồ ăn", icon: "🍎" },
    { id: "nature", label: "Thiên nhiên", icon: "🌿" },
    { id: "school", label: "Trường học", icon: "🏫" },
    { id: "objects", label: "Đồ vật", icon: "🧸" },
    { id: "body", label: "Cơ thể", icon: "🧍" },
    { id: "colors", label: "Màu sắc", icon: "🎨" },
    { id: "emotions", label: "Cảm xúc", icon: "❤️" }
];

const GO_CHU_TOPIC_TERMS = {
    animals: [
        "mèo","chó","cá","gà","vịt","chim","heo","bò","dê","ngựa","voi","hổ","sư tử","khỉ","thỏ","gấu","sói","cáo","nai","hươu","rùa","rắn","ếch","cua","tôm","kiến","bướm","ong","đại bàng","cánh cụt"
    ],
    family: [
        "mẹ","ba","bố","má","cha","ông","bà","anh","chị","em","gia đình","người thân","họ hàng","cô chú","dì dượng","bác trai","bác gái","cậu mợ","ông nội","bà nội","ông ngoại","bà ngoại","cha mẹ","người nhà","cả nhà"
    ],
    food: [
        "cơm","bánh","rau","trái cây","sữa","nước cam","quả cam","nước dừa","trà","táo","chuối","xoài","dưa hấu","cà rốt","thịt","cháo","kẹo","kem","mật ong"
    ],
    nature: [
        "trời","nắng","mưa","mây","gió","cầu vồng","bầu trời","sao","trăng","hoa","lá","cây","cỏ","sông","biển","mặt trời","đêm","núi","rừng"
    ],
    school: [
        "đi học","đến lớp","trường","lớp","cô giáo","thầy giáo","học bài","làm bài","đọc bài","đọc sách","viết chữ","gõ chữ","tập viết","tập đọc","giơ tay","cặp sách","quyển vở","cuốn sách","bút chì","bút mực","thước kẻ","bảng đen","bảng trắng","cục tẩy","hộp bút","phấn"
    ],
    objects: [
        "cái bàn","cái ghế","cái bút","cái thước","cái cặp","cái sách","cái vở","cái bảng","cái phấn","cái đèn","bàn học","ghế ngồi","hộp bút","cái kéo","cái gọt","cái hộp","cái túi","cái chai","cái ly","cái cốc","cái muỗng","cái nĩa","cái đĩa","cái tô","cái nồi","cái chảo","cái bếp","cái tủ","cái giường","cái gối","cái mền","cái quạt","điện thoại","tivi","máy tính","đồng hồ","cái cửa","cái khóa","cái chìa","đồ chơi","búp bê","gấu bông","quả bóng","cái diều","cái xe","cái tàu","máy bay","robot","xe đạp"
    ],
    body: [
        "tay","chân","tóc","răng","miệng","mắt","mũi","tai","đầu","cổ","vai","bụng","lưng","ngón tay","bàn tay","bàn chân","khuôn mặt","đánh răng","rửa mặt","rửa tay","rửa chân","chải tóc","buộc tóc","che miệng"
    ],
    colors: [
        "màu","đỏ","xanh","vàng","tím","hồng","đen","trắng","nâu","cam","xám","pastel","tô màu","phối màu","trộn màu"
    ],
    emotions: [
        "vui","buồn","cười","khóc","yêu","thương","quý","thích","tự tin","bình tĩnh","cố gắng","ngoan","hạnh phúc","xin lỗi","cảm ơn","lễ phép"
    ]
};

function normalizeTopicText(text){
    return String(text || "")
        .normalize("NFC")
        .toLocaleLowerCase("vi-VN")
        .replace(/[.,!?;:()\[\]{}"'“”‘’]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function topicTextContainsTerm(text, term){
    const normalizedText = ` ${normalizeTopicText(text)} `;
    const normalizedTerm = normalizeTopicText(term);
    return normalizedText.includes(` ${normalizedTerm} `);
}

function promptMatchesTopic(prompt, topicId){
    if(!topicId || topicId === "all") return true;
    const terms = GO_CHU_TOPIC_TERMS[topicId] || [];
    return terms.some(term => topicTextContainsTerm(prompt, term));
}

function getTopicById(topicId){
    return GO_CHU_TOPICS.find(topic => topic.id === topicId) || GO_CHU_TOPICS[0];
}
