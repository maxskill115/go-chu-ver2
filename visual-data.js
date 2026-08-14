/* ===== VER2 PHASE 3 - MAPPING HÌNH ẢNH ===== */
const GO_CHU_VISUAL_ASSET_BASE = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg";

/*
 * Quy tắc visual mới:
 * - `exact`: chỉ match khi toàn bộ prompt đúng bằng cụm đó.
 * - `contains`: chỉ dùng với cụm đủ rõ nghĩa, tránh keyword mơ hồ như "cam", "cây", "nước", "nhà".
 * - Không có rule phù hợp => ẩn hình, không cố nhét hình gần đúng.
 */
const promptVisualRules = [
    { exact: ["mèo", "con mèo", "mèo con"], contains: ["con mèo ngủ", "mèo kêu meo meo"], code: "1f431", alt: "Con mèo", fallback: "🐱" },
    { exact: ["chó", "con chó", "chó con"], contains: ["con chó chạy", "chó sủa gâu gâu"], code: "1f436", alt: "Con chó", fallback: "🐶" },
    { exact: ["heo", "con heo", "heo con"], contains: [], code: "1f437", alt: "Con heo", fallback: "🐷" },
    { exact: ["bò", "con bò", "bò con"], contains: ["con bò ăn cỏ"], code: "1f42e", alt: "Con bò", fallback: "🐮" },
    { exact: ["gà", "con gà", "gà con"], contains: ["con gà gáy", "gà con theo mẹ"], code: "1f414", alt: "Con gà", fallback: "🐔" },
    { exact: ["vịt", "con vịt", "vịt con"], contains: ["con vịt bơi", "vịt con xuống nước"], code: "1f986", alt: "Con vịt", fallback: "🦆" },
    { exact: ["cá", "con cá", "cá vàng"], contains: ["con cá bơi", "cá bơi dưới nước"], code: "1f41f", alt: "Con cá", fallback: "🐟" },
    { exact: ["chim", "con chim"], contains: ["con chim bay", "chim hót líu lo", "chim bay trên trời", "chim đậu trên cành"], code: "1f426", alt: "Con chim", fallback: "🐦" },
    { exact: ["thỏ", "con thỏ", "thỏ con"], contains: ["thỏ ăn cà rốt"], code: "1f430", alt: "Con thỏ", fallback: "🐰" },
    { exact: ["ngựa", "con ngựa", "ngựa con"], contains: ["con ngựa chạy", "con ngựa chạy nhanh"], code: "1f434", alt: "Con ngựa", fallback: "🐴" },
    { exact: ["khỉ", "con khỉ", "khỉ con"], contains: ["con khỉ leo cây"], code: "1f412", alt: "Con khỉ", fallback: "🐒" },
    { exact: ["voi", "con voi"], contains: ["con voi rất to"], code: "1f418", alt: "Con voi", fallback: "🐘" },
    { exact: ["kiến", "con kiến"], contains: ["con kiến rất nhỏ"], code: "1f41c", alt: "Con kiến", fallback: "🐜" },
    { exact: ["dê", "con dê", "dê con"], contains: ["con dê ăn lá", "con dê leo núi"], code: "1f410", alt: "Con dê", fallback: "🐐" },

    { exact: ["quả táo", "táo"], contains: ["quả táo màu đỏ"], code: "1f34e", alt: "Quả táo", fallback: "🍎" },
    { exact: ["quả chuối", "chuối"], contains: ["quả chuối màu vàng", "bé thích ăn chuối"], code: "1f34c", alt: "Quả chuối", fallback: "🍌" },
    { exact: ["quả cam"], contains: ["quả cam màu vàng", "bé uống nước cam"], code: "1f34a", alt: "Quả cam", fallback: "🍊" },
    { exact: ["dưa hấu"], contains: ["dưa hấu rất ngọt"], code: "1f349", alt: "Dưa hấu", fallback: "🍉" },
    { exact: ["trái cây", "ăn trái cây"], contains: ["bé ăn trái cây", "mẹ mua trái cây"], code: "1f34e", alt: "Trái cây", fallback: "🍎" },

    { exact: ["đọc sách", "quyển sách", "cuốn sách", "cái sách"], contains: ["bé đọc sách", "bé cầm sách"], code: "1f4d6", alt: "Quyển sách", fallback: "📖" },
    { exact: ["cái bút", "bút chì", "bút mực", "bút màu", "cầm bút", "viết chữ"], contains: ["bé cầm bút", "bé viết chữ"], code: "270f", alt: "Cây bút", fallback: "✏️" },
    { exact: ["xe đạp", "xe đạp của bé"], contains: [], code: "1f6b2", alt: "Xe đạp", fallback: "🚲" },
    { exact: ["xe hơi", "ô tô", "xe ô tô"], contains: [], code: "1f697", alt: "Xe hơi", fallback: "🚗" },
    { exact: ["ngôi nhà", "về nhà", "ở nhà"], contains: ["bé về nhà"], code: "1f3e0", alt: "Ngôi nhà", fallback: "🏠" },
    { exact: ["đá bóng", "chơi bóng", "quả bóng"], contains: ["bé đá quả bóng", "bé chơi bóng"], code: "26bd", alt: "Quả bóng", fallback: "⚽" },
    { exact: ["uống sữa", "sữa"], contains: ["bé uống sữa"], code: "1f95b", alt: "Ly sữa", fallback: "🥛" },
    { exact: ["uống nước"], contains: ["bé uống nước"], code: "1f4a7", alt: "Nước uống", fallback: "💧" },
    { exact: ["đi học", "đến lớp", "trường học"], contains: ["bé đi học", "bé đến lớp", "bé thích đi học"], code: "1f3eb", alt: "Trường học", fallback: "🏫" },

    { exact: ["mặt trời", "trời nắng"], contains: ["mặt trời mọc", "mặt trời lặn", "mặt trời sáng", "hôm nay trời nắng"], code: "2600", alt: "Mặt trời", fallback: "☀️" },
    { exact: ["trời mưa"], contains: ["mưa rơi", "hôm nay trời mưa"], code: "1f327", alt: "Trời mưa", fallback: "🌧️" },
    { exact: ["mây trắng"], contains: ["mây trắng bay"], code: "2601", alt: "Đám mây", fallback: "☁️" },
    { exact: ["bông hoa"], contains: ["hoa đang nở", "hoa rất đẹp", "bướm bay quanh hoa", "ong tìm mật hoa"], code: "1f33c", alt: "Bông hoa", fallback: "🌼" },
    { exact: ["cây xanh"], contains: ["cây xanh tốt", "cây cho bóng mát", "lá cây màu xanh"], code: "1f333", alt: "Cây xanh", fallback: "🌳" }
];
