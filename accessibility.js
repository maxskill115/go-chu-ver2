/* ===== VER2 PHASE 9 - ACCESSIBILITY / KEYBOARD =====
 * Không bọc logic học. Chỉ đồng bộ ARIA, focus và keyboard navigation.
 */
let goChuLastProfileOpener = null;
let goChuLastGameOpener = null;
let goChuObservedProfileOverlay = null;

function isElementVisible(element){
    if(!element) return false;
    if(element.classList?.contains("hidden")) return false;
    return element.getClientRects().length > 0;
}

function getFocusableElements(container){
    if(!container) return [];
    const selector = [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    return Array.from(container.querySelectorAll(selector)).filter(element =>
        !element.hasAttribute("hidden") &&
        element.getAttribute("aria-hidden") !== "true" &&
        isElementVisible(element)
    );
}

function setBackgroundInert(inert){
    const container = document.querySelector(".container");
    const hud = document.querySelector(".study-hud");
    if(container) container.inert = Boolean(inert);
    if(hud) hud.inert = Boolean(inert);
}

function setupDialogSemantics(){
    const settingsButton = document.getElementById("settingsToggleBtn");
    const settingsPanelEl = document.getElementById("settingsPanel");
    if(settingsButton && settingsPanelEl){
        settingsButton.setAttribute("aria-controls", "settingsPanel");
    }

    const gameButton = document.getElementById("game-menu");
    const gameOverlay = document.getElementById("game-selector-overlay");
    const gameCard = gameOverlay?.querySelector(".game-selector-card");
    const gameTitle = gameCard?.querySelector("h3");
    if(gameButton && gameOverlay){
        gameButton.setAttribute("aria-controls", "game-selector-overlay");
    }
    if(gameCard){
        gameCard.setAttribute("role", "dialog");
        gameCard.setAttribute("aria-modal", "true");
        if(gameTitle){
            gameTitle.id = gameTitle.id || "gameSelectorTitle";
            gameCard.setAttribute("aria-labelledby", gameTitle.id);
        }
    }

    const profileButton = document.getElementById("profileDashboardBtn");
    const profileOverlay = document.getElementById("profileDashboardOverlay");
    if(profileButton){
        /* Overlay có thể được tạo lazy sau startup. */
        profileButton.setAttribute("aria-controls", "profileDashboardOverlay");
    }
    if(profileOverlay){
        profileOverlay.setAttribute("aria-hidden", profileOverlay.classList.contains("hidden") ? "true" : "false");
    }

    const resultEl = document.getElementById("result");
    if(resultEl){
        resultEl.setAttribute("aria-live", "polite");
        resultEl.setAttribute("aria-atomic", "true");
    }

    ["listenModeStatus", "memoryModeStatus", "topicLevelStatus"].forEach(id => {
        const element = document.getElementById(id);
        if(element) element.setAttribute("aria-live", "polite");
    });

    const inputEl = document.getElementById("input");
    if(inputEl){
        const describedBy = ["result", "vietnameseInputGuide"]
            .filter(id => document.getElementById(id))
            .join(" ");
        if(describedBy) inputEl.setAttribute("aria-describedby", describedBy);
    }
}

function syncAccessibilityState(){
    setupDialogSemantics();

    const settingsButton = document.getElementById("settingsToggleBtn");
    const settingsPanelEl = document.getElementById("settingsPanel");
    const settingsOpen = Boolean(settingsPanelEl && !settingsPanelEl.classList.contains("hidden"));
    if(settingsButton) settingsButton.setAttribute("aria-expanded", settingsOpen ? "true" : "false");
    if(settingsPanelEl) settingsPanelEl.setAttribute("aria-hidden", settingsOpen ? "false" : "true");

    const gameButton = document.getElementById("game-menu");
    const gameOverlay = document.getElementById("game-selector-overlay");
    const gameOpen = Boolean(gameOverlay && !gameOverlay.classList.contains("hidden"));
    if(gameButton) gameButton.setAttribute("aria-expanded", gameOpen ? "true" : "false");
    if(gameOverlay) gameOverlay.setAttribute("aria-hidden", gameOpen ? "false" : "true");

    const profileButton = document.getElementById("profileDashboardBtn");
    const profileOverlay = document.getElementById("profileDashboardOverlay");
    const profileOpen = Boolean(profileOverlay && !profileOverlay.classList.contains("hidden"));
    if(profileButton) profileButton.setAttribute("aria-expanded", profileOpen ? "true" : "false");
    if(profileOverlay) profileOverlay.setAttribute("aria-hidden", profileOpen ? "false" : "true");

    setBackgroundInert(gameOpen || profileOpen);
}

function focusDialog(container, preferredSelector){
    requestAnimationFrame(() => {
        const preferred = preferredSelector ? container?.querySelector(preferredSelector) : null;
        const focusables = getFocusableElements(container);
        const target = preferred || focusables[0];
        target?.focus({ preventScroll: true });
    });
}

function handleOverlayMutation(overlay, type){
    if(!overlay) return;
    const open = !overlay.classList.contains("hidden");
    syncAccessibilityState();

    if(open){
        if(type === "profile"){
            focusDialog(overlay, "#profileDashboardClose");
        }else{
            focusDialog(overlay, ".game-nav-btn");
        }
        return;
    }

    const opener = type === "profile" ? goChuLastProfileOpener : goChuLastGameOpener;
    if(opener && opener.isConnected){
        requestAnimationFrame(() => opener.focus({ preventScroll: true }));
    }
}

function observeVisibility(element, type){
    if(!element || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => handleOverlayMutation(element, type));
    observer.observe(element, { attributes: true, attributeFilter: ["class"] });
}

function bindLazyProfileOverlay(){
    const overlay = document.getElementById("profileDashboardOverlay");
    if(!overlay || overlay === goChuObservedProfileOverlay) return;
    goChuObservedProfileOverlay = overlay;
    observeVisibility(overlay, "profile");
    setupDialogSemantics();
    syncAccessibilityState();
}

function observeLazyProfileCreation(){
    if(typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => bindLazyProfileOverlay());
    observer.observe(document.body, { childList: true });
}

function observeSettingsPanel(){
    const panel = document.getElementById("settingsPanel");
    if(!panel || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(syncAccessibilityState);
    observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
}

function getActiveModal(){
    const profile = document.getElementById("profileDashboardOverlay");
    if(profile && !profile.classList.contains("hidden")) return profile;

    const game = document.getElementById("game-selector-overlay");
    if(game && !game.classList.contains("hidden")) return game;

    return null;
}

function trapModalTab(event){
    if(event.key !== "Tab") return;
    const modal = getActiveModal();
    if(!modal) return;

    const focusables = getFocusableElements(modal);
    if(!focusables.length){
        event.preventDefault();
        return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if(event.shiftKey && (active === first || !modal.contains(active))){
        event.preventDefault();
        last.focus();
    }else if(!event.shiftKey && (active === last || !modal.contains(active))){
        event.preventDefault();
        first.focus();
    }
}

function initGoChuAccessibility(){
    setupDialogSemantics();

    const profileButton = document.getElementById("profileDashboardBtn");
    const gameButton = document.getElementById("game-menu");
    profileButton?.addEventListener("click", () => { goChuLastProfileOpener = profileButton; }, true);
    gameButton?.addEventListener("click", () => { goChuLastGameOpener = gameButton; }, true);

    bindLazyProfileOverlay();
    observeLazyProfileCreation();
    observeVisibility(document.getElementById("game-selector-overlay"), "game");
    observeSettingsPanel();

    document.addEventListener("keydown", trapModalTab, true);
    syncAccessibilityState();
}

if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initGoChuAccessibility, { once: true });
}else{
    initGoChuAccessibility();
}
