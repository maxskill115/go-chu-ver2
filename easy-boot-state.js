/* ===== PHASE 9 ĐỢT 11D - BOOT STATE TRUNG TÍNH =====
 * Nạp ngay sau script-core.js và trước các module Easy-only.
 * script-core.js đang khởi tạo currentMode = "easy" để giữ baseline cũ.
 * Nếu để nguyên, Smart Review / Listen / Memory / Topic / Vietnamese UI đều
 * tưởng Easy đã active và tự làm việc một lượt TRƯỚC setMode("easy") thật.
 *
 * Chuyển tạm sang __boot__ giúp các module chỉ dựng shell nhẹ, không chạy
 * tính toán Easy cho đến khi script.js gọi setMode("easy") một lần duy nhất.
 */
currentMode = "__boot__";

window.GO_CHU_BOOT_MODE = "__boot__";
window.getGoChuBootState = function(){
    return {
        bootMode: window.GO_CHU_BOOT_MODE,
        currentMode,
        isBooting: currentMode === window.GO_CHU_BOOT_MODE
    };
};
