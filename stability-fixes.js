/* ===== STABILITY FIXES =====
 * Các tối ưu runtime nhỏ, tách khỏi feature modules để dễ audit/rollback.
 */

/*
 * Free mode trước đây dựng lại toàn bộ ~58 option mỗi lần mở dropdown,
 * mỗi option lại mang background-image ../IMG/... riêng. Trên máy/mạng chậm
 * việc này tạo nhiều DOM + request ảnh cùng lúc. Render menu đúng một lần,
 * dùng emoji nhẹ trong danh sách; ảnh thật chỉ giữ ở item đang chọn phía trên.
 */
renderCustomPoemSelectMenu = function(){
    if(!poemSelectMenu || !poemSelect) return;

    const optionCount = poemSelect.options.length;
    if(
        poemSelectMenu.dataset.rendered === "1" &&
        Number(poemSelectMenu.dataset.optionCount || 0) === optionCount
    ){
        return;
    }

    const fragment = document.createDocumentFragment();

    Array.from(poemSelect.options).forEach(option => {
        const itemBtn = document.createElement("button");
        itemBtn.type = "button";
        itemBtn.className = "free-select-option";
        itemBtn.dataset.value = option.value;

        const icon = document.createElement("span");
        icon.className = "free-select-option-icon free-select-option-icon-light";
        icon.textContent = option.value === "custom" ? "✍️" : "📖";
        icon.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.textContent = option.textContent || "";

        itemBtn.append(icon, text);
        fragment.appendChild(itemBtn);
    });

    poemSelectMenu.replaceChildren(fragment);
    poemSelectMenu.dataset.rendered = "1";
    poemSelectMenu.dataset.optionCount = String(optionCount);
};

/* Dọn audio/timer transient khi trang bị unload để tránh task treo cuối vòng đời. */
window.addEventListener("pagehide", () => {
    try { clearTimeout(resultTimer); } catch (error) {}
    try { clearTimeout(freeAdvanceTimer); } catch (error) {}
    try { clearTimeout(toastTimer); } catch (error) {}
    try { clearTimeout(gameMenuHideTimer); } catch (error) {}
    try { clearMemoryTimers?.(); } catch (error) {}
    try { stopAllListenAudio?.(); } catch (error) {}
}, { once: true });

window.GO_CHU_STABILITY_FIXES = Object.freeze({
    autoFullscreenRemoved: true,
    freeResizeRafThrottle: true,
    freeTypingRafThrottle: true,
    freeMenuSingleRender: true,
    freeMenuHeavyImagesRemoved: true
});
