let texts = easyWords;
let index = 0;
let currentMode = "easy";
let freeTarget = "";
let currentFreePoemIndex = 0;
let toastTimer;
let freeAdvanceTimer;
let currentPrompt = "";

const input = document.getElementById("input");
const textDiv = document.getElementById("text");
const result = document.getElementById("result");
const topBar = document.getElementById("topBar");
const normalPanel = document.getElementById("normalPanel");
const freeSetupPanel = document.getElementById("freeSetupPanel");
const freePanel = document.getElementById("freePanel");
const freeDisplayBox = document.getElementById("freeDisplayBox");
const poemSelect = document.getElementById("poemSelect");
const freeSource = document.getElementById("freeSource");
const freeTextDisplay = document.getElementById("freeTextDisplay");
const freeInput = document.getElementById("freeInput");
const freePoemIcon = document.getElementById("freePoemIcon");
const freePoemViewIcon = document.getElementById("freePoemViewIcon");
const poemSelectTrigger = document.getElementById("poemSelectTrigger");
const poemSelectTriggerText = document.getElementById("poemSelectTriggerText");
const poemSelectMenu = document.getElementById("poemSelectMenu");
const freeSelectWrap = document.querySelector(".free-select-wrap");
const floatingActions = document.getElementById("floatingActions");
const floatingBackBtn = document.getElementById("floatingBackBtn");
const floatingSubmitBtn = document.getElementById("floatingSubmitBtn");
const floatingNextBtn = document.getElementById("floatingNextBtn");
const centerToast = document.getElementById("centerToast");
const studyTime = document.getElementById("studyTime");
const settingsToggleBtn = document.getElementById("settingsToggleBtn");
const settingsPanel = document.getElementById("settingsPanel");
const caseSensitiveToggle = document.getElementById("caseSensitiveToggle");
const lowVolumeToggle = document.getElementById("lowVolumeToggle");
const volumeRange = document.getElementById("volumeRange");
const volumeValue = document.getElementById("volumeValue");
const musicSelect = document.getElementById("musicSelect");
const gameMenuBtn = document.getElementById("game-menu");
const gameSelectorOverlay = document.getElementById("game-selector-overlay");
const gameSelectorCard = document.querySelector(".game-selector-card");

const backgroundTracks = [
    new Audio("Music/background Music1.mp3"),
    new Audio("Music/background Music2.mp3")
];
const clickSound = new Audio("Music/Click.wav");
const correctSound = new Audio("Music/dung.wav");

const baseVolumes = {
    background: 0.22,
    click: 0.75,
    correct: 0.85
};

let currentBackgroundIndex = 0;
let hasStartedBackground = false;
let selectedBackgroundMode = "auto";
let isCaseSensitive = false;
let isLowVolume = false;
let masterVolume = 1;
let studySeconds = 0;
let resultTimer;
let gameMenuHideTimer;
const NEXT_PROMPT_DELAY_MS = 850;

backgroundTracks.forEach(track => {
    track.preload = "auto";
});

clickSound.preload = "auto";

correctSound.preload = "auto";

function applyAudioLevels(){
    const lowFactor = isLowVolume ? 0.45 : 1;
    const factor = masterVolume * lowFactor;
    backgroundTracks.forEach(track => {
        track.volume = baseVolumes.background * factor;
    });
    clickSound.volume = baseVolumes.click * factor;
    correctSound.volume = baseVolumes.correct * factor;
}

function updateVolumeLabel(){
    const percent = Math.round(masterVolume * 100);
    volumeValue.textContent = `${percent}%`;
}

applyAudioLevels();
updateVolumeLabel();

function formatStudyDuration(totalSeconds){
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(num => String(num).padStart(2, "0")).join(":");
}

function startStudyTimer(){
    studyTime.textContent = formatStudyDuration(studySeconds);
    setInterval(() => {
        studySeconds += 1;
        studyTime.textContent = formatStudyDuration(studySeconds);
    }, 1000);
}

function showGameSelector(){
    if(!gameSelectorOverlay) return;

    const panel = gameSelectorOverlay.querySelector(".game-selector-card");
    clearTimeout(gameMenuHideTimer);
    gameSelectorOverlay.classList.remove("hidden");
    gameSelectorOverlay.style.opacity = "0";
    gameSelectorOverlay.style.transition = "opacity 0.4s ease-out";

    if(panel){
        panel.style.transform = "scale(0.8) rotateY(-15deg)";
        panel.style.opacity = "0";
        panel.style.transition = "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }

    requestAnimationFrame(()=>{
        gameSelectorOverlay.style.opacity = "1";
        if(panel){
            panel.style.transform = "scale(1) rotateY(0deg)";
            panel.style.opacity = "1";
        }
    });

    document.body.style.overflow = "hidden";
}

function hideGameSelector(){
    if(!gameSelectorOverlay) return;

    const panel = gameSelectorOverlay.querySelector(".game-selector-card");

    gameSelectorOverlay.style.opacity = "0";
    gameSelectorOverlay.style.transition = "opacity 0.3s ease-in";

    if(panel){
        panel.style.transform = "scale(0.8) rotateY(15deg)";
        panel.style.opacity = "0";
        panel.style.transition = "all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)";
    }

    clearTimeout(gameMenuHideTimer);
    gameMenuHideTimer = setTimeout(()=>{
        gameSelectorOverlay.classList.add("hidden");
        gameSelectorOverlay.style.opacity = "";
        gameSelectorOverlay.style.transition = "";
        if(panel){
            panel.style.transform = "";
            panel.style.opacity = "";
            panel.style.transition = "";
        }
        document.body.style.overflow = "";
    }, 380);
}

function toggleGameSelector(){
    if(!gameSelectorOverlay) return;
    gameSelectorOverlay.classList.toggle("hidden");
}

function normalizeForCompare(text){
    const normalized = normalizeParagraph(String(text || ""));
    return isCaseSensitive ? normalized : normalized.toLocaleLowerCase("vi-VN");
}

function playSound(sound){
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function playClickSound(){
    playSound(clickSound);
}

function playCorrectSound(){
    playSound(correctSound);
}

function playBackgroundTrack(index){
    if(!backgroundTracks.length) return;
    backgroundTracks.forEach(track => {
        track.pause();
        track.currentTime = 0;
    });

    currentBackgroundIndex = (index + backgroundTracks.length) % backgroundTracks.length;
    return backgroundTracks[currentBackgroundIndex].play()
        .then(() => true)
        .catch(() => false);
}

function startBackgroundMusic(){
    if(hasStartedBackground) return;
    const startIndex = selectedBackgroundMode === "auto"
        ? 1
        : (Number(selectedBackgroundMode) || 0);
    playBackgroundTrack(startIndex).then((started) => {
        if(started){
            hasStartedBackground = true;
        }
    });
}

backgroundTracks.forEach((track, idx) => {
    track.addEventListener("ended", () => {
        if(selectedBackgroundMode === "auto"){
            playBackgroundTrack(idx + 1);
            return;
        }
        playBackgroundTrack(Number(selectedBackgroundMode) || 0);
    });
});

document.addEventListener("pointerdown", startBackgroundMusic, { once: true });
document.addEventListener("keydown", startBackgroundMusic, { once: true });

startBackgroundMusic();

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", playClickSound);
});

/* Xáo trộn danh sách Đơn giản để không chạy tuần tự theo nhóm từ */
function shuffleEasyWords(){
    const shuffled = [...new Set(easyWords)];
    for(let i = shuffled.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/* ===== VER2 - HIỂN THỊ KÝ TỰ GÕ SAI ===== */
function getTypingDiffChars(text){
    return Array.from(
        normalizeParagraph(String(text || "")).normalize("NFC")
    );
}

function typingCharsMatch(expectedChar, actualChar){
    if(expectedChar === undefined || actualChar === undefined) return false;
    if(isCaseSensitive) return expectedChar === actualChar;
    return expectedChar.toLocaleLowerCase("vi-VN") === actualChar.toLocaleLowerCase("vi-VN");
}

/*
 * Căn chỉnh hai chuỗi bằng khoảng cách Levenshtein để một ký tự bị thiếu/thừa
 * không làm toàn bộ phần phía sau bị báo sai theo.
 */
function buildTypingDiffAlignment(expectedText, typedText){
    const expected = getTypingDiffChars(expectedText);
    const typed = getTypingDiffChars(typedText);
    const rows = expected.length + 1;
    const cols = typed.length + 1;
    const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

    for(let i = 0; i < rows; i++) dp[i][0] = i;
    for(let j = 0; j < cols; j++) dp[0][j] = j;

    for(let i = 1; i < rows; i++){
        for(let j = 1; j < cols; j++){
            const replaceCost = typingCharsMatch(expected[i - 1], typed[j - 1]) ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + replaceCost
            );
        }
    }

    const alignment = [];
    let i = expected.length;
    let j = typed.length;

    while(i > 0 || j > 0){
        if(
            i > 0 && j > 0 &&
            typingCharsMatch(expected[i - 1], typed[j - 1]) &&
            dp[i][j] === dp[i - 1][j - 1]
        ){
            alignment.push({ expected: expected[i - 1], typed: typed[j - 1], wrong: false });
            i--;
            j--;
            continue;
        }

        if(i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1){
            alignment.push({ expected: expected[i - 1], typed: typed[j - 1], wrong: true });
            i--;
            j--;
            continue;
        }

        if(i > 0 && dp[i][j] === dp[i - 1][j] + 1){
            alignment.push({ expected: expected[i - 1], typed: undefined, wrong: true });
            i--;
            continue;
        }

        alignment.push({ expected: undefined, typed: typed[j - 1], wrong: true });
        j--;
    }

    return alignment.reverse();
}

function createDiffChar(char, isWrong){
    const span = document.createElement("span");
    span.className = "typing-diff-char" + (isWrong ? " wrong" : "");

    if(char === undefined){
        span.classList.add("missing");
        span.textContent = "□";
    }else if(char === " "){
        span.textContent = isWrong ? "␠" : "\u00A0";
    }else{
        span.textContent = char;
    }

    return span;
}

function createTypingDiffLine(label, alignment, key){
    const line = document.createElement("div");
    line.className = "typing-diff-line";

    const labelEl = document.createElement("div");
    labelEl.className = "typing-diff-label";
    labelEl.textContent = label;

    const valueEl = document.createElement("div");
    valueEl.className = "typing-diff-value";

    alignment.forEach(item => {
        valueEl.appendChild(createDiffChar(item[key], item.wrong));
    });

    line.append(labelEl, valueEl);
    return line;
}

function showTypingDiff(expectedText, typedText){
    const alignment = buildTypingDiffAlignment(expectedText, typedText);

    result.innerHTML = "";
    result.classList.add("has-diff");

    const wrap = document.createElement("div");
    wrap.className = "typing-diff";

    const title = document.createElement("div");
    title.className = "typing-diff-title";
    title.textContent = "❌ Chưa đúng — xem chữ màu đỏ";

    wrap.appendChild(title);
    wrap.appendChild(createTypingDiffLine("Cần gõ", alignment, "expected"));
    wrap.appendChild(createTypingDiffLine("Bé gõ", alignment, "typed"));
    result.appendChild(wrap);
}

/* show */
function showText(){
    currentPrompt = texts[index];

    textDiv.innerText = currentPrompt;
    input.value = "";
    clearTimeout(resultTimer);
    result.className = "";
    result.style.opacity = "1";
    result.innerText = "";
    input.focus();
}

/* mode */
function toggleModeExpand(){
    // Chỉ mũi tên gọi hàm này: mở/đóng danh sách đầy đủ để chọn chế độ cụ thể.
    // Không đổi mode, không random chữ.
    const modeRow = document.querySelector(".mode-row");
    if(modeRow) modeRow.classList.toggle("collapsed");
}

function handleModeClick(mode){
    const modeRow = document.querySelector(".mode-row");
    const isCollapsed = !modeRow || modeRow.classList.contains("collapsed");

    if(mode === currentMode){
        if(isCollapsed){
            nextPromptForCurrentMode();
        } else if(modeRow){
            modeRow.classList.add("collapsed");
        }
        return;
    }
    setMode(mode);
}

function nextPromptForCurrentMode(){
    if(currentMode === "free") return;
    index++;
    if(index >= texts.length){
        if(currentMode === "easy") texts = shuffleEasyWords();
        index = 0;
    }
    showText();
}

function setMode(mode){
    const modeRow = document.querySelector(".mode-row");

    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach(btn => {
        const isActive = btn.dataset.mode === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if(modeRow) modeRow.classList.add("collapsed");

    if(mode === "free"){
        normalPanel.classList.add("hidden");
        freeSetupPanel.classList.remove("hidden");
        freePanel.classList.add("hidden");
        setTopBarHidden(false);
        setFloatingActionsHidden(true);
        initFreeMode();
        return;
    }

    setTopBarHidden(false);
    setFloatingActionsHidden(true);
    freePanel.classList.add("hidden");
    freeSetupPanel.classList.add("hidden");
    normalPanel.classList.remove("hidden");
    texts = (mode === "easy") ? shuffleEasyWords() : hardTexts;
    index = 0;
    showText();
}

input.addEventListener("input", ()=>{
    input.classList.add("typing");
    clearTimeout(input._t);
    input._t = setTimeout(()=>{
        input.classList.remove("typing");
    },300);
});

function checkNext(){
    if(currentMode === "free") return;

    if(normalizeForCompare(input.value) === normalizeForCompare(currentPrompt)){
        clearTimeout(resultTimer);
        result.className = "correct";
        result.innerText = "🎉 Chính xác! Giỏi quá!";
        playCorrectSound();
        index++;
        if(index >= texts.length){
            if(currentMode === "easy") texts = shuffleEasyWords();
            index = 0;
        }
        resultTimer = setTimeout(showText, NEXT_PROMPT_DELAY_MS);
    } else {
        clearTimeout(resultTimer);
        result.className = "incorrect";
        result.style.opacity = "1";
        showTypingDiff(currentPrompt, input.value);
    }
}

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing && currentMode !== "free") {
        e.preventDefault();
        checkNext();
    }
});
