/* ===== VER2 PHASE 5 - NHỚ RỒI GÕ ===== */
const GO_CHU_MEMORY_WORDS_KEY = "goChuVer2.memoryWords.v1";
const GO_CHU_MEMORY_SECONDS_KEY = "goChuVer2.memorySeconds.v1";

let memoryModeActive = false;
let memoryWordCount = loadMemoryNumber(GO_CHU_MEMORY_WORDS_KEY, 2, [2, 3, 4]);
let memorySeconds = loadMemoryNumber(GO_CHU_MEMORY_SECONDS_KEY, 5, [3, 5, 7]);
let memoryTimer = null;
let memoryTickTimer = null;
let memoryRemaining = 0;

function loadMemoryNumber(key, fallback, allowed){
    try {
        const value = Number(localStorage.getItem(key));
        return allowed.includes(value) ? value : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveMemoryNumber(key, value){
    try {
        localStorage.setItem(key, String(value));
    } catch (error) {}
}

function getPromptWordCount(prompt){
    if(typeof getCachedPromptWordCount === "function"){
        return getCachedPromptWordCount(prompt);
    }
    return String(prompt || "").trim().split(/\s+/).filter(Boolean).length;
}

function shuffleMemoryPrompts(items){
    const shuffled = [...items];
    for(let i = shuffled.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function buildMemoryRound(previousPrompt = ""){
    const source = typeof GO_CHU_UNIQUE_EASY_PROMPTS !== "undefined"
        ? GO_CHU_UNIQUE_EASY_PROMPTS
        : [...new Set(easyWords)];
    const eligible = source.filter(prompt => getPromptWordCount(prompt) === memoryWordCount);
    const round = shuffleMemoryPrompts(eligible);

    if(typeof getWeakPromptRecords === "function"){
        const weak = getWeakPromptRecords()
            .filter(item => getPromptWordCount(item.prompt) === memoryWordCount)
            .slice(0, 12);

        weak.forEach((item, weakIndex) => {
            const preferred = 4 + weakIndex * 5 + Math.floor(Math.random() * 4);
            const safeIndex = typeof findSafeSmartInsertIndex === "function"
                ? findSafeSmartInsertIndex(round, item.prompt, preferred)
                : Math.min(round.length, preferred);
            if(safeIndex >= 0) round.splice(safeIndex, 0, item.prompt);
        });
    }

    if(previousPrompt && round.length > 1 && round[0] === previousPrompt){
        const swapIndex = round.findIndex((prompt, i) => i > 0 && prompt !== previousPrompt);
        if(swapIndex > 0){
            [round[0], round[swapIndex]] = [round[swapIndex], round[0]];
        }
    }

    return round;
}

function clearMemoryTimers(){
    clearTimeout(memoryTimer);
    clearInterval(memoryTickTimer);
    memoryTimer = null;
    memoryTickTimer = null;
}

function ensureMemoryModeBar(){
    let bar = document.getElementById("memoryModeBar");
    if(bar) return bar;

    bar = document.createElement("div");
    bar.id = "memoryModeBar";
    bar.className = "memory-mode-bar";

    const toggle = document.createElement("button");
    toggle.id = "memoryModeToggle";
    toggle.type = "button";
    toggle.className = "memory-mode-btn primary";
    toggle.addEventListener("click", toggleMemoryMode);
    toggle.addEventListener("click", playClickSound);

    const levelLabel = document.createElement("label");
    levelLabel.className = "memory-mode-field";
    levelLabel.innerHTML = `
        <span>Mức</span>
        <select id="memoryWordCount" class="memory-mode-select" aria-label="Số từ cần nhớ">
            <option value="2">2 từ</option>
            <option value="3">3 từ</option>
            <option value="4">4 từ</option>
        </select>
    `;

    const timeLabel = document.createElement("label");
    timeLabel.className = "memory-mode-field";
    timeLabel.innerHTML = `
        <span>Thời gian</span>
        <select id="memorySeconds" class="memory-mode-select" aria-label="Thời gian ghi nhớ">
            <option value="3">3 giây</option>
            <option value="5">5 giây</option>
            <option value="7">7 giây</option>
        </select>
    `;

    const status = document.createElement("span");
    status.id = "memoryModeStatus";
    status.className = "memory-mode-status";

    bar.append(toggle, levelLabel, timeLabel, status);
    normalPanel.insertBefore(bar, input);

    const wordSelect = document.getElementById("memoryWordCount");
    const secondsSelect = document.getElementById("memorySeconds");
    wordSelect.value = String(memoryWordCount);
    secondsSelect.value = String(memorySeconds);

    wordSelect.addEventListener("change", () => {
        memoryWordCount = Number(wordSelect.value);
        saveMemoryNumber(GO_CHU_MEMORY_WORDS_KEY, memoryWordCount);
        if(memoryModeActive) restartMemoryRound();
        updateMemoryModeBar();
    });

    secondsSelect.addEventListener("change", () => {
        memorySeconds = Number(secondsSelect.value);
        saveMemoryNumber(GO_CHU_MEMORY_SECONDS_KEY, memorySeconds);
        if(memoryModeActive) scheduleMemoryHide();
        updateMemoryModeBar();
    });

    return bar;
}

function updateMemoryModeBar(){
    ensureMemoryModeBar();
    const bar = document.getElementById("memoryModeBar");
    const toggle = document.getElementById("memoryModeToggle");
    const wordSelect = document.getElementById("memoryWordCount");
    const secondsSelect = document.getElementById("memorySeconds");
    const status = document.getElementById("memoryModeStatus");
    if(!bar || !toggle || !wordSelect || !secondsSelect || !status) return;

    const isEasy = currentMode === "easy";
    bar.classList.toggle("active", memoryModeActive && isEasy);
    bar.classList.toggle("hidden-by-mode", !isEasy);
    toggle.textContent = memoryModeActive && isEasy ? "👀 Học thường" : "🧠 Nhớ rồi gõ";
    wordSelect.disabled = memoryModeActive && memoryRemaining > 0;
    secondsSelect.disabled = false;

    if(!memoryModeActive || !isEasy){
        status.textContent = "";
    }else if(memoryRemaining > 0){
        status.textContent = `Nhìn và nhớ: ${memoryRemaining}s`;
    }else{
        status.textContent = "Đến lượt bé gõ";
    }
}

function setMemoryPromptHidden(hidden){
    const active = Boolean(hidden && memoryModeActive && currentMode === "easy");
    textDiv.classList.toggle("memory-prompt-hidden", active);
    textDiv.setAttribute("aria-hidden", active ? "true" : "false");

    const nextBtn = document.getElementById("nextBtn");
    input.disabled = memoryModeActive && !active;
    if(nextBtn) nextBtn.disabled = memoryModeActive && !active;

    if(active){
        input.disabled = false;
        if(nextBtn) nextBtn.disabled = false;
        requestAnimationFrame(() => input.focus());
    }
}

function scheduleMemoryHide(){
    clearMemoryTimers();
    if(!memoryModeActive || currentMode !== "easy") return;

    memoryRemaining = memorySeconds;
    setMemoryPromptHidden(false);
    updateMemoryModeBar();

    memoryTickTimer = setInterval(() => {
        memoryRemaining -= 1;
        if(memoryRemaining <= 0){
            memoryRemaining = 0;
            clearInterval(memoryTickTimer);
            memoryTickTimer = null;
        }
        updateMemoryModeBar();
    }, 1000);

    memoryTimer = setTimeout(() => {
        memoryRemaining = 0;
        clearInterval(memoryTickTimer);
        memoryTickTimer = null;
        setMemoryPromptHidden(true);
        updateMemoryModeBar();
    }, memorySeconds * 1000);
}

function restartMemoryRound(){
    const round = buildMemoryRound(currentPrompt);
    if(!round.length){
        setMemoryMode(false);
        if(typeof showCenterToast === "function"){
            showCenterToast(`Chưa có nội dung ${memoryWordCount} từ`, "incorrect");
        }
        return;
    }

    if(typeof smartReviewActive !== "undefined") smartReviewActive = false;
    texts = round;
    index = 0;
    showText();
}

function setMemoryMode(active){
    const shouldEnable = Boolean(active);

    if(shouldEnable && currentMode !== "easy"){
        setMode("easy");
    }

    if(shouldEnable && typeof listenModeActive !== "undefined" && listenModeActive){
        setListenMode(false);
    }

    memoryModeActive = shouldEnable && currentMode === "easy";
    clearMemoryTimers();
    memoryRemaining = 0;
    normalPanel.classList.toggle("memory-mode-active", memoryModeActive);

    if(memoryModeActive){
        restartMemoryRound();
    }else{
        setMemoryPromptHidden(false);
        input.disabled = false;
        const nextBtn = document.getElementById("nextBtn");
        if(nextBtn) nextBtn.disabled = false;
        if(currentMode === "easy"){
            texts = typeof buildSmartEasyRound === "function"
                ? buildSmartEasyRound(currentPrompt)
                : shuffleEasyWords();
            index = 0;
            showText();
        }
    }

    updateMemoryModeBar();
    if(typeof updateSmartReviewBar === "function") updateSmartReviewBar();
}

function toggleMemoryMode(){
    setMemoryMode(!(memoryModeActive && currentMode === "easy"));
}

const baseSetListenModeForMemory = setListenMode;
setListenMode = function(active){
    if(active && memoryModeActive){
        setMemoryMode(false);
    }
    return baseSetListenModeForMemory(active);
};

const baseShowTextForMemory = showText;
showText = function(){
    baseShowTextForMemory();
    if(memoryModeActive && currentMode === "easy"){
        scheduleMemoryHide();
    }else{
        clearMemoryTimers();
        memoryRemaining = 0;
        setMemoryPromptHidden(false);
    }
    updateMemoryModeBar();
};

const baseSetModeForMemory = setMode;
setMode = function(mode){
    if(mode !== "easy" && memoryModeActive){
        memoryModeActive = false;
        clearMemoryTimers();
        memoryRemaining = 0;
        normalPanel.classList.remove("memory-mode-active");
        setMemoryPromptHidden(false);
    }

    baseSetModeForMemory(mode);

    if(mode === "easy" && memoryModeActive){
        restartMemoryRound();
    }
    updateMemoryModeBar();
};

const baseNextPromptForMemory = nextPromptForCurrentMode;
nextPromptForCurrentMode = function(){
    if(!(memoryModeActive && currentMode === "easy")){
        return baseNextPromptForMemory();
    }

    index += 1;
    if(index >= texts.length){
        texts = buildMemoryRound(currentPrompt);
        index = 0;
    }
    showText();
};

const baseCheckNextForMemory = checkNext;
checkNext = function(){
    if(!(memoryModeActive && currentMode === "easy")){
        return baseCheckNextForMemory();
    }

    if(memoryRemaining > 0) return;

    if(normalizeForCompare(input.value) === normalizeForCompare(currentPrompt)){
        clearTimeout(resultTimer);
        result.className = "correct";
        result.innerText = "🎉 Chính xác! Giỏi quá!";
        playCorrectSound();

        if(typeof recordPromptResult === "function"){
            recordPromptResult(currentPrompt, true);
        }

        index += 1;
        if(index >= texts.length){
            texts = buildMemoryRound(currentPrompt);
            index = 0;
        }

        resultTimer = setTimeout(showText, NEXT_PROMPT_DELAY_MS);
    }else{
        clearTimeout(resultTimer);
        result.className = "incorrect";
        result.style.opacity = "1";
        showTypingDiff(currentPrompt, input.value);

        if(typeof smartPromptWrongRecorded !== "undefined" && !smartPromptWrongRecorded){
            smartPromptWrongRecorded = true;
            if(typeof recordPromptResult === "function"){
                recordPromptResult(currentPrompt, false);
            }
        }
    }
};

ensureMemoryModeBar();
updateMemoryModeBar();
