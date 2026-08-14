function populatePoems(){
    poemSelect.innerHTML = "";
    freePoems.forEach((item, i) => {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = normalizePoemTitle(item.title);
        option.dataset.icon = getFreePoemIconPath(i + 1);
        poemSelect.appendChild(option);
    });
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "Dùng đoạn tự nhập";
    customOption.dataset.icon = getFreePoemIconPath(57);
    poemSelect.appendChild(customOption);
    renderCustomPoemSelectMenu();
    updateFreePoemIcon();
}

function normalizePoemTitle(title){
    return String(title || "").replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function getFreePoemIconPath(iconIndex){
    const totalIcons = 57;
    const normalized = ((Number(iconIndex) - 1) % totalIcons + totalIcons) % totalIcons + 1;
    return `../IMG/gochu_tudo (${normalized}).png`;
}

function updateFreePoemIcon(){
    if(!poemSelect) return;
    const selectedOption = poemSelect.options[poemSelect.selectedIndex] || null;
    const iconUrl = selectedOption?.dataset?.icon || getFreePoemIconPath(1);
    if(freePoemIcon){
        freePoemIcon.style.setProperty("--free-poem-icon-url", `url('${iconUrl}')`);
    }
    if(freePoemViewIcon){
        freePoemViewIcon.style.setProperty("--free-poem-icon-url", `url('${iconUrl}')`);
    }
    if(poemSelectTrigger){
        poemSelectTrigger.style.setProperty("--free-poem-icon-url", `url('${iconUrl}')`);
    }
    if(poemSelectTriggerText){
        poemSelectTriggerText.textContent = selectedOption?.textContent || "Chọn bài luyện gõ";
    }
    if(poemSelectMenu){
        poemSelectMenu.querySelectorAll(".free-select-option").forEach((btn) => {
            btn.classList.toggle("selected", btn.dataset.value === poemSelect.value);
        });
    }
}

function renderCustomPoemSelectMenu(){
    if(!poemSelectMenu || !poemSelect) return;
    poemSelectMenu.innerHTML = "";
    Array.from(poemSelect.options).forEach((option) => {
        const itemBtn = document.createElement("button");
        itemBtn.type = "button";
        itemBtn.className = "free-select-option";
        itemBtn.dataset.value = option.value;

        const icon = document.createElement("span");
        icon.className = "free-select-option-icon";
        icon.style.setProperty("--free-poem-icon-url", `url('${option.dataset.icon || getFreePoemIconPath(1)}')`);

        const text = document.createElement("span");
        text.textContent = option.textContent || "";

        itemBtn.appendChild(icon);
        itemBtn.appendChild(text);
        poemSelectMenu.appendChild(itemBtn);
    });
}

function toggleCustomPoemSelectMenu(forceOpen){
    if(!poemSelectMenu || !poemSelectTrigger) return;
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : poemSelectMenu.classList.contains("hidden");
    poemSelectMenu.classList.toggle("hidden", !shouldOpen);
    poemSelectTrigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function normalizeParagraph(text){
    return text
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map(line => line.trim())
        .join("\n")
        .trim();
}

function setFreeTarget(text){
    freeTarget = normalizeParagraph(text);
    applyFreeTextScale(freeTarget);
    freeTextDisplay.textContent = freeTarget || "(Chưa có đoạn để luyện gõ)";
    freeInput.value = "";
    freeInput.classList.remove("free-correct");
    freeSetupPanel.classList.add("hidden");
    freePanel.classList.remove("hidden");
    setTopBarHidden(true);
    setFloatingActionsHidden(false);
    requestAnimationFrame(syncFreeInputToDisplay);
    freeInput.focus();
}

function applyFreeTarget(){
    const selected = poemSelect.value;
    updateFreePoemIcon();
    if(selected === "custom"){
        const customText = normalizeParagraph(freeSource.value);
        if(!customText){
            freeSource.focus();
            return;
        }
        currentFreePoemIndex = 0;
        setFreeTarget(customText);
        return;
    }

    if(selected !== "custom" && freeSource.value.trim()){
        freeSource.value = "";
    }

    currentFreePoemIndex = Number(selected) || 0;
    const poem = freePoems[currentFreePoemIndex] || freePoems[0];
    setFreeTarget(poem.content);
}

function updateFreeTypingState(){
    if(!freeTarget){
        freeInput.classList.remove("free-correct");
        return;
    }
    const ok = normalizeForCompare(freeInput.value) === normalizeForCompare(freeTarget);
    freeInput.classList.toggle("free-correct", ok);
}

function applyFreeTextScale(text){
    const lines = text ? text.split("\n") : [""];
    const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
    const lineCount = lines.length;
    const totalChars = text.length;

    let size = 32;
    if(totalChars > 260 || longestLine > 70 || lineCount > 8) size = 20;
    else if(totalChars > 180 || longestLine > 56 || lineCount > 6) size = 23;
    else if(totalChars > 110 || longestLine > 42 || lineCount > 4) size = 26;
    else if(totalChars > 70 || longestLine > 32) size = 29;

    if(window.innerWidth < 600) size -= 3;
    else if(window.innerWidth < 900) size -= 1;

    size = Math.max(18, Math.min(34, size));
    const lineHeight = size <= 22 ? 1.75 : 1.62;

    freePanel.style.setProperty("--free-text-size", `${size}px`);
    freePanel.style.setProperty("--free-line-height", String(lineHeight));
}

function initFreeMode(){
    if(!poemSelect.options.length){
        populatePoems();
    }
    if(!poemSelect.value){
        poemSelect.value = "0";
    }
    updateFreePoemIcon();
    setTopBarHidden(false);
    setFloatingActionsHidden(true);
    freeSetupPanel.classList.remove("hidden");
    freePanel.classList.add("hidden");
}

function setTopBarHidden(hidden){
    topBar.classList.toggle("hidden", hidden);
}

function syncFreeInputToDisplay(){
    if(!freeDisplayBox || freePanel.classList.contains("hidden")) return;
    const width = freeDisplayBox.clientWidth;
    const height = freeDisplayBox.offsetHeight;
    freeInput.style.width = `${width}px`;
    freeInput.style.height = `${height}px`;
}

function backFromFreePractice(){
    clearTimeout(freeAdvanceTimer);
    freePanel.classList.add("hidden");
    freeSetupPanel.classList.remove("hidden");
    setTopBarHidden(false);
    setFloatingActionsHidden(true);
    freeInput.classList.remove("free-correct");
}

function setFloatingActionsHidden(hidden){
    floatingActions.classList.toggle("hidden", hidden);
}

function submitFreeAnswer(){
    if(!freeTarget) return;
    clearTimeout(freeAdvanceTimer);
    const ok = normalizeForCompare(freeInput.value) === normalizeForCompare(freeTarget);
    freeInput.classList.toggle("free-correct", ok);
    showCenterToast(ok ? "🎉 Đúng rồi!" : "❌ Chưa đúng!", ok ? "correct" : "incorrect");

    if(ok){
        playCorrectSound();
        freeAdvanceTimer = setTimeout(() => {
            nextFreePoem();
        }, 900);
    }
}

function nextFreePoem(){
    currentFreePoemIndex = (currentFreePoemIndex + 1) % freePoems.length;
    poemSelect.value = String(currentFreePoemIndex);
    updateFreePoemIcon();
    freeSource.value = "";
    setFreeTarget(freePoems[currentFreePoemIndex].content);
}

function showCenterToast(message, type){
    clearTimeout(toastTimer);
    centerToast.textContent = message;
    centerToast.className = `center-toast ${type} show`;
    toastTimer = setTimeout(() => {
        centerToast.classList.remove("show");
    }, 1300);
}

poemSelect.addEventListener("change", () => {
    updateFreePoemIcon();
    if(poemSelect.value !== "custom"){
        currentFreePoemIndex = Number(poemSelect.value) || 0;
        applyFreeTarget();
    }
});

if(poemSelectTrigger){
    poemSelectTrigger.addEventListener("click", () => {
        renderCustomPoemSelectMenu();
        updateFreePoemIcon();
        toggleCustomPoemSelectMenu();
    });
}

if(poemSelectMenu){
    poemSelectMenu.addEventListener("click", (event) => {
        const optionButton = event.target.closest(".free-select-option");
        if(!optionButton) return;
        const value = optionButton.dataset.value;
        if(typeof value !== "string") return;
        poemSelect.value = value;
        updateFreePoemIcon();
        toggleCustomPoemSelectMenu(false);
        poemSelect.dispatchEvent(new Event("change"));
    });
}

freeSource.addEventListener("input", () => {
    if(freeSource.value.trim()){
        poemSelect.value = "custom";
        updateFreePoemIcon();
    }
});

settingsToggleBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
});

document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    const clickedInsidePanel = settingsPanel.contains(target);
    const clickedToggleButton = settingsToggleBtn.contains(target);
    const clickedGameMenuButton = gameMenuBtn ? gameMenuBtn.contains(target) : false;
    const clickedInsideGameSelector = gameSelectorCard ? gameSelectorCard.contains(target) : false;
    const clickedInsidePoemSelect = freeSelectWrap ? freeSelectWrap.contains(target) : false;

    if(!clickedInsidePanel && !clickedToggleButton){
        settingsPanel.classList.add("hidden");
    }

    if(gameSelectorOverlay && !gameSelectorOverlay.classList.contains("hidden") && !clickedGameMenuButton && !clickedInsideGameSelector){
        hideGameSelector();
    }

    if(!clickedInsidePoemSelect){
        toggleCustomPoemSelectMenu(false);
    }
});

document.addEventListener("keydown", (event) => {
    if(event.key === "Escape"){
        hideGameSelector();
    }
});

caseSensitiveToggle.addEventListener("change", () => {
    isCaseSensitive = caseSensitiveToggle.checked;
    updateFreeTypingState();
});

lowVolumeToggle.addEventListener("change", () => {
    isLowVolume = lowVolumeToggle.checked;
    applyAudioLevels();
});

volumeRange.addEventListener("input", () => {
    masterVolume = Number(volumeRange.value) / 100;
    updateVolumeLabel();
    applyAudioLevels();
});

musicSelect.addEventListener("change", () => {
    selectedBackgroundMode = musicSelect.value;
    if(!hasStartedBackground) return;
    if(selectedBackgroundMode === "auto"){
        const randomIndex = Math.floor(Math.random() * backgroundTracks.length);
        playBackgroundTrack(randomIndex);
        return;
    }
    playBackgroundTrack(Number(selectedBackgroundMode) || 0);
});

window.addEventListener("resize", () => {
    if(currentMode === "free" && freeTarget){
        applyFreeTextScale(freeTarget);
        syncFreeInputToDisplay();
    }
});

freeInput.addEventListener("input", updateFreeTypingState);

freeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        submitFreeAnswer();
    }
});

startStudyTimer();
setMode("easy");

/* ===== Tự động mở toàn màn hình khi có tương tác ===== */
function requestAppFullscreen(){
    if(document.fullscreenElement || document.webkitFullscreenElement) return;
    const el = document.documentElement;
    const request = el.requestFullscreen
        || el.webkitRequestFullscreen
        || el.mozRequestFullScreen
        || el.msRequestFullscreen;
    if(!request) return;
    try {
        const result = request.call(el);
        if(result && typeof result.catch === "function"){
            result.catch(() => {});
        }
    } catch (err) {
        // Một số trình duyệt (vd Safari trên iOS) không hỗ trợ hoặc chặn yêu cầu này -> bỏ qua
    }
}

["click", "keydown", "wheel"].forEach(evt => {
    document.addEventListener(evt, requestAppFullscreen, { passive: true });
});
