/* ===== VER2 HOTFIX - GỌN BÁO LỖI + CHỈ DÙNG GIỌNG VIỆT ===== */
const GO_CHU_VI_VOICE_KEY = "goChuVer2.viVoice.v1";
let goChuVoiceSettingInitialized = false;

function createDiffRun(text, wrong){
    const span = document.createElement("span");
    span.className = "typing-diff-run" + (wrong ? " wrong" : "");
    span.textContent = String(text || "").replace(/ /g, "\u00A0");
    return span;
}

function appendDiffRuns(valueEl, alignment, key){
    let buffer = "";
    let bufferWrong = false;
    let hasContent = false;

    function flush(){
        if(!buffer) return;
        valueEl.appendChild(createDiffRun(buffer, bufferWrong));
        buffer = "";
    }

    alignment.forEach(item => {
        const char = item[key];
        if(char === undefined) return;
        hasContent = true;
        const wrong = Boolean(item.wrong);
        if(buffer && wrong !== bufferWrong) flush();
        bufferWrong = wrong;
        buffer += char;
    });
    flush();

    if(!hasContent){
        const empty = document.createElement("span");
        empty.className = "typing-diff-empty";
        empty.textContent = "(chưa gõ)";
        valueEl.appendChild(empty);
    }
}

showTypingDiff = function(expectedText, typedText){
    const alignment = buildTypingDiffAlignment(expectedText, typedText);

    result.innerHTML = "";
    result.className = "incorrect has-diff";
    result.style.opacity = "1";

    const wrap = document.createElement("div");
    wrap.className = "typing-diff typing-diff-clean";

    const title = document.createElement("div");
    title.className = "typing-diff-title";
    title.textContent = "❌ Chưa đúng — xem phần màu đỏ";
    wrap.appendChild(title);

    [["Cần gõ", "expected"], ["Bé gõ", "typed"]].forEach(([label, key]) => {
        const line = document.createElement("div");
        line.className = "typing-diff-line";

        const labelEl = document.createElement("div");
        labelEl.className = "typing-diff-label";
        labelEl.textContent = label;

        const valueEl = document.createElement("div");
        valueEl.className = "typing-diff-value";
        appendDiffRuns(valueEl, alignment, key);

        line.append(labelEl, valueEl);
        wrap.appendChild(line);
    });

    result.appendChild(wrap);
};

function getVietnameseVoices(){
    if(!speechSupported()) return [];
    return window.speechSynthesis.getVoices().filter(voice =>
        String(voice.lang || "").toLowerCase().startsWith("vi")
    );
}

function getSavedVoiceURI(){
    try {
        return localStorage.getItem(GO_CHU_VI_VOICE_KEY) || "";
    } catch (error) {
        return "";
    }
}

function saveVoiceURI(uri){
    try {
        localStorage.setItem(GO_CHU_VI_VOICE_KEY, uri || "");
    } catch (error) {}
}

refreshVietnameseVoice = function(){
    if(!speechSupported()) return null;
    const voices = getVietnameseVoices();
    const saved = getSavedVoiceURI();

    vietnameseVoice = voices.find(voice => voice.voiceURI === saved)
        || voices.find(voice => String(voice.lang || "").toLowerCase() === "vi-vn")
        || voices[0]
        || null;

    return vietnameseVoice;
};

function ensureVietnameseVoiceSetting(){
    if(!settingsPanel) return;

    let wrap = document.getElementById("viVoiceSetting");
    if(!wrap){
        wrap = document.createElement("div");
        wrap.id = "viVoiceSetting";
        wrap.className = "vi-voice-setting";
        wrap.innerHTML = `
            <label class="settings-item" for="viVoiceSelect">Giọng đọc tiếng Việt</label>
            <select id="viVoiceSelect" class="settings-select"></select>
            <div id="viVoiceHint" class="vi-voice-hint"></div>
        `;
        settingsPanel.appendChild(wrap);
    }

    const select = document.getElementById("viVoiceSelect");
    const hint = document.getElementById("viVoiceHint");
    if(!select || !hint) return;

    if(typeof ensureListenVoiceRuntime === "function") ensureListenVoiceRuntime();
    const voices = getVietnameseVoices();
    const chosen = refreshVietnameseVoice();
    select.innerHTML = "";

    if(!voices.length){
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Chưa có giọng tiếng Việt";
        select.appendChild(option);
        select.disabled = true;
        hint.textContent = "Thiết bị chưa có voice tiếng Việt. Web sẽ không đọc bằng giọng sai ngôn ngữ.";
    }else{
        voices.forEach(voice => {
            const option = document.createElement("option");
            option.value = voice.voiceURI;
            option.textContent = `${voice.name} (${voice.lang})`;
            option.selected = Boolean(chosen && chosen.voiceURI === voice.voiceURI);
            select.appendChild(option);
        });
        select.disabled = false;
        hint.textContent = voices.length > 1 ? "Có thể đổi giọng nếu giọng hiện tại nghe chưa rõ." : "Đang dùng giọng tiếng Việt có trên thiết bị.";
    }

    if(!select.dataset.bound){
        select.addEventListener("change", () => {
            saveVoiceURI(select.value);
            refreshVietnameseVoice();
            updateListenModeBar();
            if(listenModeActive) speakPrompt(currentPrompt);
        });
        select.dataset.bound = "1";
    }
    goChuVoiceSettingInitialized = true;
}

const baseUpdateListenModeBarHotfix = updateListenModeBar;
updateListenModeBar = function(){
    baseUpdateListenModeBarHotfix();

    const toggle = document.getElementById("listenModeToggle");
    const replay = document.getElementById("listenReplayBtn");
    const status = document.getElementById("listenModeStatus");
    const isEasy = currentMode === "easy";

    /* Không enumerate voice ở mỗi showText khi Listen đang tắt. */
    const voice = listenModeActive
        ? (typeof ensureListenVoiceRuntime === "function" ? ensureListenVoiceRuntime() : refreshVietnameseVoice())
        : vietnameseVoice;

    if(toggle && speechSupported() && isEasy){
        toggle.disabled = false;
        if(!listenModeActive) toggle.textContent = "🎧 Nghe rồi gõ";
    }

    if(replay) replay.disabled = !voice || !listenModeActive || !isEasy;

    if(status && speechSupported()){
        if(listenModeActive && !voice){
            status.textContent = "Thiết bị chưa có giọng tiếng Việt";
        }else if(listenModeActive && isEasy && voice){
            status.textContent = `Giọng: ${voice.name}`;
        }
    }
};

const baseSetListenModeHotfix = setListenMode;
setListenMode = function(active){
    if(active){
        if(typeof ensureListenVoiceRuntime === "function") ensureListenVoiceRuntime();
        if(!refreshVietnameseVoice()){
            ensureVietnameseVoiceSetting();
            updateListenModeBar();
            if(typeof showCenterToast === "function"){
                showCenterToast("Chưa có giọng tiếng Việt trên thiết bị", "incorrect");
            }
            return;
        }
    }
    return baseSetListenModeHotfix(active);
};

speakPrompt = function(text = currentPrompt){
    if(!listenModeActive || currentMode !== "easy" || !text || !speechSupported()) return;

    clearTimeout(listenSpeechTimer);
    window.speechSynthesis.cancel();
    if(typeof ensureListenVoiceRuntime === "function") ensureListenVoiceRuntime();
    const voice = refreshVietnameseVoice();
    if(!voice){
        updateListenModeBar();
        return;
    }

    listenSpeechTimer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = voice.lang || "vi-VN";
        utterance.voice = voice;
        utterance.rate = 0.76;
        utterance.pitch = 1;
        utterance.volume = getListenSpeechVolume();
        window.speechSynthesis.speak(utterance);
    }, 140);
};

function refreshVoiceHotfixUI(){
    ensureVietnameseVoiceSetting();
    updateListenModeBar();
}

/* Voice setting chỉ được dựng khi người dùng thật sự mở Settings. */
if(settingsToggleBtn){
    settingsToggleBtn.addEventListener("click", () => {
        setTimeout(() => {
            if(!settingsPanel.classList.contains("hidden")) refreshVoiceHotfixUI();
        }, 0);
    });
}

window.ensureVietnameseVoiceSetting = ensureVietnameseVoiceSetting;
window.refreshVoiceHotfixUI = refreshVoiceHotfixUI;
