/* ===== VER2 PHASE 3 - MAPPING HÌNH ẢNH ===== */
const GO_CHU_VISUAL_ASSET_BASE = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg";

const promptVisualRules = [
    { keywords: ["con mèo", "mèo"], code: "1f431", alt: "Con mèo", fallback: "🐱" },
    { keywords: ["con chó", "chó"], code: "1f436", alt: "Con chó", fallback: "🐶" },
    { keywords: ["con heo", "heo"], code: "1f437", alt: "Con heo", fallback: "🐷" },
    { keywords: ["con bò", "bò"], code: "1f42e", alt: "Con bò", fallback: "🐮" },
    { keywords: ["con gà", "gà"], code: "1f414", alt: "Con gà", fallback: "🐔" },
    { keywords: ["con vịt", "vịt"], code: "1f986", alt: "Con vịt", fallback: "🦆" },
    { keywords: ["con cá", "cá"], code: "1f41f", alt: "Con cá", fallback: "🐟" },
    { keywords: ["con chim", "chim"], code: "1f426", alt: "Con chim", fallback: "🐦" },
    { keywords: ["con thỏ", "thỏ"], code: "1f430", alt: "Con thỏ", fallback: "🐰" },
    { keywords: ["con ngựa", "ngựa"], code: "1f434", alt: "Con ngựa", fallback: "🐴" },
    { keywords: ["con khỉ", "khỉ"], code: "1f412", alt: "Con khỉ", fallback: "🐒" },
    { keywords: ["con voi", "voi"], code: "1f418", alt: "Con voi", fallback: "🐘" },
    { keywords: ["con kiến", "kiến"], code: "1f41c", alt: "Con kiến", fallback: "🐜" },
    { keywords: ["con dê", "dê"], code: "1f410", alt: "Con dê", fallback: "🐐" },

    { keywords: ["quả táo", "táo"], code: "1f34e", alt: "Quả táo", fallback: "🍎" },
    { keywords: ["quả chuối", "chuối"], code: "1f34c", alt: "Quả chuối", fallback: "🍌" },
    { keywords: ["quả cam", "cam"], code: "1f34a", alt: "Quả cam", fallback: "🍊" },
    { keywords: ["dưa hấu"], code: "1f349", alt: "Dưa hấu", fallback: "🍉" },
    { keywords: ["trái cây"], code: "1f34e", alt: "Trái cây", fallback: "🍎" },

    { keywords: ["đọc sách", "quyển sách", "cuốn sách", "sách"], code: "1f4d6", alt: "Quyển sách", fallback: "📖" },
    { keywords: ["cầm bút", "viết chữ", "bút"], code: "270f", alt: "Cây bút", fallback: "✏️" },
    { keywords: ["xe đạp"], code: "1f6b2", alt: "Xe đạp", fallback: "🚲" },
    { keywords: ["xe hơi", "ô tô", "xe ô tô"], code: "1f697", alt: "Xe hơi", fallback: "🚗" },
    { keywords: ["ngôi nhà", "về nhà", "ở nhà", "nhà"], code: "1f3e0", alt: "Ngôi nhà", fallback: "🏠" },
    { keywords: ["đá bóng", "chơi bóng", "quả bóng"], code: "26bd", alt: "Quả bóng", fallback: "⚽" },
    { keywords: ["uống sữa", "sữa"], code: "1f95b", alt: "Ly sữa", fallback: "🥛" },
    { keywords: ["uống nước", "nước"], code: "1f4a7", alt: "Nước", fallback: "💧" },
    { keywords: ["đi học", "đến lớp", "trường học", "trường"], code: "1f3eb", alt: "Trường học", fallback: "🏫" },

    { keywords: ["mặt trời", "trời nắng", "nắng"], code: "2600", alt: "Mặt trời", fallback: "☀️" },
    { keywords: ["trời mưa", "mưa rơi", "mưa"], code: "1f327", alt: "Trời mưa", fallback: "🌧️" },
    { keywords: ["mây trắng", "mây"], code: "2601", alt: "Đám mây", fallback: "☁️" },
    { keywords: ["bông hoa", "hoa đang nở", "hoa rất đẹp", "hoa"], code: "1f33c", alt: "Bông hoa", fallback: "🌼" },
    { keywords: ["cây xanh", "cây"], code: "1f333", alt: "Cây xanh", fallback: "🌳" }
];
