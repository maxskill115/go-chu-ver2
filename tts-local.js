/* ===== PHASE 10 - PRE-RENDERED GOOGLE TTS LOCAL PLAYBACK ===== */
const GO_CHU_TTS_LOCAL_MANIFEST = window.GO_CHU_TTS_MANIFEST || {};
const GO_CHU_TTS_LOCAL_META = window.GO_CHU_TTS_META || {};
const GO_CHU_TTS_MISSING = new Set();
let goChuTtsAudio = null;
let goChuTtsPlayToken = 0;

function getLocalTtsPath(text = currentPrompt){
    const key = String(text || "");
    return GO_CHU_TTS_LOCAL_MANIFEST[key] || "";
}
function hasLocalTts(text = currentPrompt){
    const path = getLocalTtsPath(text);
    return Boolean(path && !GO_CHU_TTS_MISSING.has(path));
}
function getLocalTtsCount(){ return Object.keys(GO_CHU_TTS_LOCAL_MANIFEST).length; }
function getLocalTtsVolume(){ return typeof getListenSpeechVolume === "function" ? getListenSpeechVolume() : 1; }
function syncLocalTtsVolume(){ if(goChuTtsAudio) goChuTtsAudio.volume = getLocalTtsVolume(); }
function stopLocalTts(){
    goChuTtsPlayToken += 1;
    if(!goChuTtsAudio) return;
    try {
        goChuTtsAudio.pause();
        goChuTtsAudio.currentTime = 0;
        goChuTtsAudio.removeAttribute("src");
        goChuTtsAudio.load();
    } catch (error) {}
    goChuTtsAudio = null;
}
function stopAllListenAudio(){
    stopLocalTts();
    clearTimeout(listenSpeechTimer);
    if(typeof speechSupported === "function" && speechSupported()) window.speechSynthesis.cancel();
}
function hasVietnameseWebVoice(){
    return Boolean(typeof refreshVietnameseVoice === "function" && refreshVietnameseVoice());
}
function hasAnyListenSource(){ return getLocalTtsCount() > 0 || hasVietnameseWebVoice(); }

const baseApplyAudioLevelsForLocalTts = applyAudioLevels;
applyAudioLevels = function(){
    baseApplyAudioLevelsForLocalTts();
    syncLocalTtsVolume();
};

const baseSpeakPromptForLocalTts = speakPrompt;
function speakWithWebFallback(text){
    if(!hasVietnameseWebVoice()){
        updateListenModeBar();
        if(typeof showCenterToast === "function") showCenterToast("Chưa có MP3 cho câu này và máy không có giọng Việt dự phòng", "incorrect");
        return;
    }
    baseSpeakPromptForLocalTts(text);
}

function playLocalTts(text){
    const path = getLocalTtsPath(text);
    if(!path || GO_CHU_TTS_MISSING.has(path)){
        speakWithWebFallback(text);
        return;
    }

    stopAllListenAudio();
    const token = ++goChuTtsPlayToken;
    const audio = new Audio(path);
    goChuTtsAudio = audio;
    audio.preload = "auto";
    audio.volume = getLocalTtsVolume();

    let missingFallbackStarted = false;
    const fallbackMissingFile = () => {
        if(missingFallbackStarted || token !== goChuTtsPlayToken) return;
        missingFallbackStarted = true;
        GO_CHU_TTS_MISSING.add(path);
        try { audio.pause(); } catch (error) {}
        if(goChuTtsAudio === audio) goChuTtsAudio = null;
        updateListenModeBar();
        speakWithWebFallback(text);
    };

    audio.addEventListener("error", fallbackMissingFile, { once: true });
    audio.addEventListener("ended", () => {
        if(token === goChuTtsPlayToken && goChuTtsAudio === audio) goChuTtsAudio = null;
    }, { once: true });

    const playPromise = audio.play();
    if(playPromise && typeof playPromise.catch === "function"){
        playPromise.catch(error => {
            if(token !== goChuTtsPlayToken) return;
            if(goChuTtsAudio === audio) goChuTtsAudio = null;
            if(error?.name === "NotAllowedError"){
                updateListenModeBar();
                if(typeof showCenterToast === "function") showCenterToast("Bấm Nghe lại để phát âm thanh", "incorrect");
                return;
            }
            fallbackMissingFile();
        });
    }
}

speakPrompt = function(text = currentPrompt){
    if(!listenModeActive || currentMode !== "easy" || !text) return;
    const value = String(text);
    if(hasLocalTts(value)){
        stopAllListenAudio();
        listenSpeechTimer = setTimeout(() => playLocalTts(value), 90);
        return;
    }
    stopLocalTts();
    speakWithWebFallback(value);
};

const baseUpdateListenModeBarForLocalTts = updateListenModeBar;
updateListenModeBar = function(){
    baseUpdateListenModeBarForLocalTts();

    const bar = document.getElementById("listenModeBar");
    const toggle = document.getElementById("listenModeToggle");
    const replay = document.getElementById("listenReplayBtn");
    const status = document.getElementById("listenModeStatus");
    if(!bar || !toggle || !replay || !status) return;

    const isEasy = currentMode === "easy";
    if(!isEasy){
        bar.classList.add("hidden-by-mode");
        bar.setAttribute("aria-hidden", "true");
        toggle.disabled = true;
        replay.disabled = true;
        status.textContent = "";
        return;
    }

    const localReady = hasLocalTts(currentPrompt);
    const anyLocal = getLocalTtsCount() > 0;
    const webVoice = hasVietnameseWebVoice();
    const available = anyLocal || webVoice;

    bar.classList.remove("hidden-by-mode");
    bar.setAttribute("aria-hidden", "false");
    toggle.disabled = !available;
    replay.disabled = !available || !listenModeActive;

    if(!available){
        status.textContent = "Chưa có MP3 Google TTS hoặc giọng Việt dự phòng";
    }else if(listenModeActive){
        if(localReady){
            const voiceName = GO_CHU_TTS_LOCAL_META.voice ? ` · ${GO_CHU_TTS_LOCAL_META.voice}` : "";
            status.textContent = `MP3 Google TTS${voiceName}`;
        }else if(webVoice){
            status.textContent = `Web Speech dự phòng · ${webVoice.name}`;
        }else{
            status.textContent = "Thiếu MP3 cho câu hiện tại";
        }
    }else{
        status.textContent = anyLocal ? `${getLocalTtsCount()} câu đã có MP3 Google TTS` : "";
    }
};

setListenMode = function(active){
    if(active && currentMode !== "easy") return;
    const shouldEnable = Boolean(active && currentMode === "easy" && hasAnyListenSource());
    listenModeActive = shouldEnable;
    stopAllListenAudio();

    if(active && !shouldEnable){
        if(typeof ensureVietnameseVoiceSetting === "function") ensureVietnameseVoiceSetting();
        if(typeof showCenterToast === "function") showCenterToast("Chưa có MP3 Google TTS và thiết bị không có giọng Việt", "incorrect");
    }

    applyListenPromptVisibility();
    updateListenModeBar();
    if(listenModeActive) speakPrompt(currentPrompt);
};

const baseSetModeForLocalTts = setMode;
setMode = function(mode){
    if(mode !== "easy") stopAllListenAudio();
    return baseSetModeForLocalTts(mode);
};

function refreshLocalTtsSettingsHint(){
    if(typeof ensureVietnameseVoiceSetting !== "function") return;
    ensureVietnameseVoiceSetting();
    const hint = document.getElementById("viVoiceHint");
    const select = document.getElementById("viVoiceSelect");
    if(!hint) return;
    if(getLocalTtsCount() > 0){
        hint.textContent = `Ưu tiên ${getLocalTtsCount()} file MP3 Google TTS local. Giọng bên dưới chỉ dùng dự phòng khi thiếu MP3.`;
        if(select) select.disabled = !speechSupported() || getVietnameseVoices().length === 0;
    }
}

function getGoChuTtsHealth(){
    const total = getLocalTtsCount();
    return {
        source: total ? "local-mp3-first" : "web-speech-only",
        manifestCount: total,
        runtimeMissingCount: GO_CHU_TTS_MISSING.size,
        voice: GO_CHU_TTS_LOCAL_META.voice || "",
        speakingRate: GO_CHU_TTS_LOCAL_META.speakingRate ?? null,
        generatedAt: GO_CHU_TTS_LOCAL_META.generatedAt || null,
        currentPromptHasLocal: hasLocalTts(currentPrompt),
        webVoiceAvailable: hasVietnameseWebVoice()
    };
}
window.getGoChuTtsHealth = getGoChuTtsHealth;

refreshLocalTtsSettingsHint();
updateListenModeBar();
