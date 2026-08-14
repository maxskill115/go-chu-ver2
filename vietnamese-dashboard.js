/* ===== VER2 PHASE 8 - THỐNG KÊ LỖI DẤU ===== */
function getProfileAccentErrorTotal(){
    return Object.values(promptStats || {}).reduce(
        (total, entry) => total + Math.max(0, Number(entry?.accentErrors || 0)),
        0
    );
}

const baseRenderProfileDashboardForVietnamese = renderProfileDashboard;
renderProfileDashboard = function(){
    baseRenderProfileDashboardForVietnamese();
    const grid = document.getElementById("profileSummaryGrid");
    if(!grid) return;
    grid.appendChild(createSummaryCard("Lỗi dấu", String(getProfileAccentErrorTotal())));
};

renderProfileDashboard();
