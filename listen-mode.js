/* ===== VER2 PHASE 4 - NGHE RỒI GÕ ===== */
let listenModeActive = false;
let vietnameseVoice = null;
let listenSpeechTimer;
let listenVoiceEventsBound = false;

function speechSupported(){
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function refreshVietnameseVoice(){
    if(!speechSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    vietnameseVoice = voices.find(voice => String(voice.lang || "").toLowerCase() === "vi-vn")
        || voices.find(voice => String(voice.lang || "").toLowerCase().startsWith("vi"))
        || null;
    return vietnameseVoice;
}

function ensureListenVoiceRuntime(){
    if(!speechSupported()) return null;
    if(!listenVoiceEventsBound){
        listenVoiceEventsBound = true;
        window.speechSynthesis.addEventListener?.("voiceschanged", () => {
            refreshVietnameseVoice();
            if(listenModeActive) updateListenModeBar();
        });
    }
    return refreshVietnameseVoice();
}

function getListenSpeechVolume(){
    const lowFactor = isLowVolume ? 0.45 : 1;
    return Math.max(0, Math.min(1, masterVolume * lowFactor));
}

function speakPrompt(text = currentPrompt){
    if(!listenModeActive || currentMode !== "easy" || !text || !speechSupported()) return;

    clearTimeout(listenSpeechTimer);
    window.speechSynthesis.cancel();
    ensureListenVoiceRuntime();

    listenSpeechTimer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = "vi-VN";
        utterance.rate = 0.82;
        utterance.pitch = 1;
        utterance.volume = getListenSpeechVolume();
        if(vietnameseVoice) utterance.voice = vietnameseVoice;
        window.speechSynthesis.speak(utterance);
    }, 140);
}

function ensureListenModeBar(){
    let bar = document.getElementById("listenModeBar");
    if(bar) return bar;

    bar = document.createElement("div");
    bar.id = "listenModeBar";
    bar.className = "listen-mode-bar";

    const toggle = document.createElement("button");
    toggle.id = "listenModeToggle";
    toggle.type = "button";
    toggle.className = "listen-mode-btn primary";
    toggle.addEventListener("click", toggleListenMode);
    toggle.addEventListener("click", playClickSound);

    const replay = document.createElement("button");
    replay.id = "listenReplayBtn";
    replay.type = "button";
    replay.className = "listen-mode-btn";
    replay.textContent = "🔊 Nghe lại";
    replay.addEventListener("click", () => speakPrompt(currentPrompt));
    replay.addEventListener("click", playClickSound);

    const status = document.createElement("span");
    status.id = "listenModeStatus";
    status.className = "listen-mode-status";

    bar.append(toggle, replay, status);
    normalPanel.insertBefore(bar, input);
    return bar;
}

function applyListenPromptVisibility(){
    const shouldHide = listenModeActive && currentMode === "easy";
    textDiv.classList.toggle("listen-prompt-hidden", shouldHide);
    textDiv.setAttribute("aria-hidden", shouldHide ? "true" : "false");
}

function updateListenModeBar(){
    ensureListenModeBar();

    const bar = document.getElementById("listenModeBar");
    const toggle = document.getElementById("listenModeToggle");
    const replay = document.getElementById("listenReplayBtn");
    const status = document.getElementById("listenModeStatus");
    if(!bar || !toggle || !replay || !status) return;

    const supported = speechSupported();
    const isEasy = currentMode === "easy";

    bar.classList.toggle("hidden-by-mode", !isEasy);
    bar.setAttribute("aria-hidden", isEasy ? "false" : "true");
    bar.classList.toggle("active", listenModeActive && isEasy);

    toggle.disabled = !supported || !isEasy;
    replay.disabled = !supported || !listenModeActive || !isEasy;
    toggle.textContent = listenModeActive && isEasy ? "👀 Hiện chữ" : "🎧 Nghe rồi gõ";

    if(!isEasy){
        status.textContent = "";
    }else if(!supported){
        status.textContent = "Thiết bị này chưa hỗ trợ đọc chữ";
    }else if(listenModeActive){
        status.textContent = vietnameseVoice ? "Đang dùng giọng tiếng Việt" : "";
    }else{
        status.textContent = "";
    }
}

function setListenMode(active){
    if(active && currentMode !== "easy") setMode("easy");

    if(active) ensureListenVoiceRuntime();
    listenModeActive = Boolean(active && currentMode === "easy" && speechSupported());
    clearTimeout(listenSpeechTimer);

    if(!listenModeActive && speechSupported()){
        window.speechSynthesis.cancel();
    }

    applyListenPromptVisibility();
    updateListenModeBar();

    if(listenModeActive) speakPrompt(currentPrompt);
}

function toggleListenMode(){
    if(currentMode !== "easy") return;
    setListenMode(!listenModeActive);
}

const baseShowTextForListen = showText;
showText = function(){
    baseShowTextForListen();
    applyListenPromptVisibility();
    updateListenModeBar();
    if(listenModeActive && currentMode === "easy") speakPrompt(currentPrompt);
};

const baseSetModeForListen = setMode;
setMode = function(mode){
    if(mode !== "easy" && listenModeActive){
        listenModeActive = false;
        clearTimeout(listenSpeechTimer);
        if(speechSupported()) window.speechSynthesis.cancel();
    }

    baseSetModeForListen(mode);
    applyListenPromptVisibility();
    updateListenModeBar();
};

/* Không enumerate voice ở startup; chỉ tạo UI nhẹ. */
ensureListenModeBar();
applyListenPromptVisibility();
updateListenModeBar();
