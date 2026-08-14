/* ===== VER2 PHASE 8 - TIẾNG VIỆT + GỢI Ý GÕ ===== */
const GO_CHU_INPUT_GUIDE_KEY = "goChuVer2.inputGuide.v1";
const VI_TONE_TELEX = { "\u0301": "s", "\u0300": "f", "\u0309": "r", "\u0303": "x", "\u0323": "j" };
const VI_TONE_VNI = { "\u0301": "1", "\u0300": "2", "\u0309": "3", "\u0303": "4", "\u0323": "5" };

let vietnameseCompositionActive = false;
let vietnameseAccentErrorRecorded = false;
let inputGuideMode = loadInputGuideMode();

function loadInputGuideMode(){
    try {
        const value = localStorage.getItem(GO_CHU_INPUT_GUIDE_KEY) || "off";
        return ["off", "telex", "vni"].includes(value) ? value : "off";
    } catch (error) {
        return "off";
    }
}

function saveInputGuideMode(){
    try { localStorage.setItem(GO_CHU_INPUT_GUIDE_KEY, inputGuideMode); } catch (error) {}
}

function normalizeWordCompare(text){
    const value = String(text || "").normalize("NFC");
    return isCaseSensitive ? value : value.toLocaleLowerCase("vi-VN");
}

function getPromptWordsForProgress(prompt = currentPrompt){
    return String(prompt || "").trim().split(/\s+/).filter(Boolean);
}

function getTypedWordsState(){
    const raw = String(input.value || "").normalize("NFC");
    const trimmed = raw.trim();
    return {
        raw,
        words: trimmed ? trimmed.split(/\s+/) : [],
        endsWithSpace: /\s$/.test(raw)
    };
}

function getCurrentExpectedWordIndex(){
    const expected = getPromptWordsForProgress();
    if(!expected.length) return -1;
    const typed = getTypedWordsState();
    if(!typed.words.length) return 0;

    const index = typed.endsWithSpace ? typed.words.length : typed.words.length - 1;
    return Math.max(0, Math.min(expected.length - 1, index));
}

function renderPromptWordProgress(){
    if(currentMode !== "easy" || !currentPrompt){
        return;
    }

    const expectedWords = getPromptWordsForProgress();
    const typed = getTypedWordsState();
    const currentIndex = getCurrentExpectedWordIndex();

    textDiv.innerHTML = "";
    textDiv.classList.add("word-progress-text");

    expectedWords.forEach((word, index) => {
        if(index > 0) textDiv.appendChild(document.createTextNode(" "));

        const span = document.createElement("span");
        span.className = "typing-word";
        span.textContent = word;

        const typedWord = typed.words[index] || "";
        const expectedNormalized = normalizeWordCompare(word);
        const typedNormalized = normalizeWordCompare(typedWord);

        if(index < currentIndex){
            span.classList.add(typedNormalized === expectedNormalized ? "done" : "mismatch");
        }else if(index === currentIndex){
            span.classList.add("current");
            if(typedWord && !expectedNormalized.startsWith(typedNormalized)){
                span.classList.add("mismatch");
            }
        }else{
            span.classList.add("pending");
        }

        textDiv.appendChild(span);
    });
}

function stripVietnameseMarks(text){
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, match => match === "Đ" ? "D" : "d")
        .normalize("NFC");
}

function findAccentOnlyDifferences(expectedText, typedText){
    const expectedWords = String(expectedText || "").trim().split(/\s+/).filter(Boolean);
    const typedWords = String(typedText || "").trim().split(/\s+/).filter(Boolean);
    if(!expectedWords.length || expectedWords.length !== typedWords.length) return [];

    const differences = [];

    for(let i = 0; i < expectedWords.length; i++){
        const expected = normalizeWordCompare(expectedWords[i]);
        const typed = normalizeWordCompare(typedWords[i]);
        if(expected === typed) continue;

        const expectedBase = normalizeWordCompare(stripVietnameseMarks(expected));
        const typedBase = normalizeWordCompare(stripVietnameseMarks(typed));
        if(expectedBase !== typedBase) return [];

        differences.push({ expected: expectedWords[i], typed: typedWords[i] });
    }

    return differences;
}

function recordAccentErrorForCurrentPrompt(){
    if(vietnameseAccentErrorRecorded || currentMode !== "easy" || !currentPrompt) return;
    if(typeof getPromptStatsEntry !== "function") return;

    const entry = getPromptStatsEntry(currentPrompt);
    entry.accentErrors = Math.max(0, Number(entry.accentErrors || 0)) + 1;
    entry.lastAccentErrorAt = Date.now();
    vietnameseAccentErrorRecorded = true;
    if(typeof savePromptStats === "function") savePromptStats();
}

const baseShowTypingDiffForVietnamese = showTypingDiff;
showTypingDiff = function(expectedText, typedText){
    baseShowTypingDiffForVietnamese(expectedText, typedText);

    const differences = findAccentOnlyDifferences(expectedText, typedText);
    if(!differences.length) return;

    const hint = document.createElement("div");
    hint.className = "vietnamese-accent-hint";

    const examples = differences
        .slice(0, 2)
        .map(item => `${item.typed} → ${item.expected}`)
        .join(" · ");

    hint.textContent = `🔤 Đúng chữ, sai dấu/chữ tiếng Việt: ${examples}`;
    const wrap = result.querySelector(".typing-diff") || result;
    wrap.appendChild(hint);
    recordAccentErrorForCurrentPrompt();
};

function getToneCode(marks, mode){
    const map = mode === "vni" ? VI_TONE_VNI : VI_TONE_TELEX;
    for(const mark of marks){
        if(map[mark]) return map[mark];
    }
    return "";
}

function convertVietnameseCharToInput(char, mode){
    const lower = String(char || "").toLocaleLowerCase("vi-VN");
    if(lower === "đ") return { text: mode === "vni" ? "d9" : "dd", tone: "" };

    const decomposed = Array.from(lower.normalize("NFD"));
    const base = decomposed[0] || "";
    const marks = decomposed.slice(1);
    const tone = getToneCode(marks, mode);
    const hasBreve = marks.includes("\u0306");
    const hasCircumflex = marks.includes("\u0302");
    const hasHorn = marks.includes("\u031b");

    if(mode === "vni"){
        if(base === "a" && hasBreve) return { text: "a8", tone };
        if(base === "a" && hasCircumflex) return { text: "a6", tone };
        if(base === "e" && hasCircumflex) return { text: "e6", tone };
        if(base === "o" && hasCircumflex) return { text: "o6", tone };
        if(base === "o" && hasHorn) return { text: "o7", tone };
        if(base === "u" && hasHorn) return { text: "u7", tone };
        return { text: base, tone };
    }

    if(base === "a" && hasBreve) return { text: "aw", tone };
    if(base === "a" && hasCircumflex) return { text: "aa", tone };
    if(base === "e" && hasCircumflex) return { text: "ee", tone };
    if(base === "o" && hasCircumflex) return { text: "oo", tone };
    if(base === "o" && hasHorn) return { text: "ow", tone };
    if(base === "u" && hasHorn) return { text: "uw", tone };
    return { text: base, tone };
}

function vietnameseWordToInputSequence(word, mode){
    let sequence = "";
    let tone = "";

    Array.from(String(word || "").replace(/[.,!?;:()\[\]{}"'“”‘’]/g, "")).forEach(char => {
        const part = convertVietnameseCharToInput(char, mode);
        sequence += part.text;
        if(part.tone) tone = part.tone;
    });

    return sequence + tone;
}

function ensureInputGuideSetting(){
    let wrap = document.getElementById("inputGuideSetting");
    if(wrap) return wrap;

    wrap = document.createElement("div");
    wrap.id = "inputGuideSetting";
    wrap.className = "input-guide-setting";
    wrap.innerHTML = `
        <label class="settings-item" for="inputGuideSelect">Hướng dẫn gõ tiếng Việt</label>
        <select id="inputGuideSelect" class="settings-select">
            <option value="off">Tắt hướng dẫn</option>
            <option value="telex">Telex</option>
            <option value="vni">VNI</option>
        </select>
    `;
    settingsPanel.appendChild(wrap);

    const select = document.getElementById("inputGuideSelect");
    select.value = inputGuideMode;
    select.addEventListener("change", () => {
        inputGuideMode = select.value;
        saveInputGuideMode();
        updateVietnameseInputGuide();
    });

    return wrap;
}

function ensureVietnameseInputGuide(){
    let bar = document.getElementById("vietnameseInputGuide");
    if(bar) return bar;

    bar = document.createElement("div");
    bar.id = "vietnameseInputGuide";
    bar.className = "vietnamese-input-guide hidden";
    normalPanel.insertBefore(bar, document.querySelector(".next-wrap"));
    return bar;
}

function shouldShowInputGuide(){
    if(inputGuideMode === "off" || currentMode !== "easy") return false;
    if(typeof listenModeActive !== "undefined" && listenModeActive) return false;
    if(typeof memoryModeActive !== "undefined" && memoryModeActive) return false;
    if(input.disabled) return false;
    return true;
}

function updateVietnameseInputGuide(){
    const bar = ensureVietnameseInputGuide();
    if(!shouldShowInputGuide()){
        bar.classList.add("hidden");
        bar.textContent = "";
        return;
    }

    const words = getPromptWordsForProgress();
    const wordIndex = getCurrentExpectedWordIndex();
    const word = words[wordIndex] || "";
    if(!word){
        bar.classList.add("hidden");
        return;
    }

    const sequence = vietnameseWordToInputSequence(word, inputGuideMode);
    const modeLabel = inputGuideMode === "vni" ? "VNI" : "Telex";
    bar.textContent = `⌨ ${modeLabel}: “${word}” → ${sequence}`;
    bar.classList.remove("hidden");
}

function refreshVietnameseProgressUI(){
    if(!vietnameseCompositionActive) renderPromptWordProgress();
    updateVietnameseInputGuide();
}

const baseShowTextForVietnameseInput = showText;
showText = function(){
    vietnameseAccentErrorRecorded = false;
    baseShowTextForVietnameseInput();
    renderPromptWordProgress();
    updateVietnameseInputGuide();
};

const baseSetModeForVietnameseInput = setMode;
setMode = function(mode){
    baseSetModeForVietnameseInput(mode);
    if(mode === "easy") renderPromptWordProgress();
    updateVietnameseInputGuide();
};

const baseSetListenModeForVietnameseInput = setListenMode;
setListenMode = function(active){
    const resultValue = baseSetListenModeForVietnameseInput(active);
    updateVietnameseInputGuide();
    return resultValue;
};

const baseSetMemoryModeForVietnameseInput = setMemoryMode;
setMemoryMode = function(active){
    const resultValue = baseSetMemoryModeForVietnameseInput(active);
    updateVietnameseInputGuide();
    return resultValue;
};

input.addEventListener("compositionstart", () => {
    vietnameseCompositionActive = true;
});

input.addEventListener("compositionend", () => {
    vietnameseCompositionActive = false;
    refreshVietnameseProgressUI();
});

input.addEventListener("input", () => {
    if(vietnameseCompositionActive) return;
    refreshVietnameseProgressUI();
});

ensureInputGuideSetting();
ensureVietnameseInputGuide();
renderPromptWordProgress();
updateVietnameseInputGuide();
