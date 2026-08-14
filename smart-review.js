/* ===== VER2 PHASE 2 - RANDOM THÔNG MINH + ÔN LỖI ===== */
const GO_CHU_PROMPT_STATS_KEY = "goChuVer2.promptStats.v1";
const GO_CHU_REVIEW_LIMIT = 20;
const GO_CHU_SMART_EXTRA_LIMIT = 24;

let smartReviewActive = false;
let smartPromptWrongRecorded = false;
let promptStats = loadPromptStats();

function loadPromptStats(){
    try {
        const raw = localStorage.getItem(GO_CHU_PROMPT_STATS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
        return {};
    }
}

function savePromptStats(){
    try {
        localStorage.setItem(GO_CHU_PROMPT_STATS_KEY, JSON.stringify(promptStats));
    } catch (error) {
        // localStorage có thể bị chặn ở chế độ riêng tư; web vẫn học bình thường.
    }
}

function getPromptStatsEntry(prompt){
    const key = String(prompt || "");
    if(!promptStats[key]){
        promptStats[key] = {
            correct: 0,
            wrong: 0,
            lastCorrectAt: 0,
            lastWrongAt: 0
        };
    }
    return promptStats[key];
}

function recordPromptResult(prompt, isCorrect){
    if(currentMode !== "easy" || !prompt) return;

    const entry = getPromptStatsEntry(prompt);
    const now = Date.now();

    if(isCorrect){
        entry.correct += 1;
        entry.lastCorrectAt = now;
    }else{
        entry.wrong += 1;
        entry.lastWrongAt = now;
    }

    savePromptStats();
    updateSmartReviewBar();
}

function getPromptWeakness(entry){
    if(!entry || !entry.wrong) return 0;
    return Math.max(0, entry.wrong * 2 - entry.correct);
}

function getWeakPromptRecords(){
    const available = new Set(easyWords);

    return Object.entries(promptStats)
        .filter(([prompt, entry]) => available.has(prompt) && getPromptWeakness(entry) > 0)
        .map(([prompt, entry]) => ({
            prompt,
            weakness: getPromptWeakness(entry),
            wrong: entry.wrong || 0,
            correct: entry.correct || 0,
            lastWrongAt: entry.lastWrongAt || 0
        }))
        .sort((a, b) =>
            b.weakness - a.weakness ||
            b.wrong - a.wrong ||
            b.lastWrongAt - a.lastWrongAt
        );
}

function findSafeSmartInsertIndex(round, prompt, preferredIndex){
    if(!round.length) return 0;

    for(let offset = 0; offset <= round.length; offset++){
        const index = Math.min(round.length, (preferredIndex + offset) % (round.length + 1));
        const from = Math.max(0, index - 5);
        const to = Math.min(round.length, index + 5);
        if(!round.slice(from, to).includes(prompt)) return index;
    }

    return -1;
}

const plainShuffleEasyWords = shuffleEasyWords;

function buildSmartEasyRound(previousPrompt = ""){
    const round = plainShuffleEasyWords();
    const weak = getWeakPromptRecords().slice(0, GO_CHU_SMART_EXTRA_LIMIT);

    weak.forEach((item, weakIndex) => {
        const preferred = 4 + weakIndex * 5 + Math.floor(Math.random() * 5);
        const insertIndex = findSafeSmartInsertIndex(round, item.prompt, preferred);
        if(insertIndex >= 0) round.splice(insertIndex, 0, item.prompt);
    });

    if(previousPrompt && round.length > 1 && round[0] === previousPrompt){
        const swapIndex = round.findIndex((prompt, i) => i > 0 && prompt !== previousPrompt);
        if(swapIndex > 0){
            [round[0], round[swapIndex]] = [round[swapIndex], round[0]];
        }
    }

    return round;
}

shuffleEasyWords = function(){
    return buildSmartEasyRound(currentPrompt);
};

function ensureSmartReviewBar(){
    let bar = document.getElementById("smartReviewBar");
    if(bar) return bar;

    bar = document.createElement("div");
    bar.id = "smartReviewBar";
    bar.className = "smart-review-bar";

    const info = document.createElement("span");
    info.id = "smartReviewInfo";
    info.className = "smart-review-info";

    const button = document.createElement("button");
    button.id = "smartReviewBtn";
    button.type = "button";
    button.className = "smart-review-btn";
    button.addEventListener("click", startSmartReview);
    button.addEventListener("click", playClickSound);

    bar.append(info, button);
    normalPanel.insertBefore(bar, result);
    return bar;
}

function updateSmartReviewBar(){
    ensureSmartReviewBar();

    const bar = document.getElementById("smartReviewBar");
    const info = document.getElementById("smartReviewInfo");
    const button = document.getElementById("smartReviewBtn");
    if(!bar || !info || !button) return;

    const weakCount = getWeakPromptRecords().length;
    bar.classList.toggle("review-active", smartReviewActive);

    if(smartReviewActive){
        info.textContent = `🧠 Đang ôn ${texts.length} từ/câu hay sai`;
        button.textContent = "Quay lại học thường";
        button.disabled = false;
        return;
    }

    info.textContent = weakCount
        ? `📌 Có ${weakCount} từ/câu cần ôn lại`
        : "✨ Chưa có từ/câu cần ôn";
    button.textContent = weakCount ? `Ôn lại (${Math.min(weakCount, GO_CHU_REVIEW_LIMIT)})` : "Ôn lại";
    button.disabled = weakCount === 0;
}

function startSmartReview(){
    if(currentMode !== "easy") setMode("easy");

    if(smartReviewActive){
        smartReviewActive = false;
        texts = buildSmartEasyRound(currentPrompt);
        index = 0;
        showText();
        updateSmartReviewBar();
        return;
    }

    const weakPrompts = getWeakPromptRecords()
        .slice(0, GO_CHU_REVIEW_LIMIT)
        .map(item => item.prompt);

    if(!weakPrompts.length){
        if(typeof showCenterToast === "function"){
            showCenterToast("✨ Chưa có từ cần ôn", "correct");
        }
        updateSmartReviewBar();
        return;
    }

    smartReviewActive = true;
    texts = plainShuffleEasyWords().filter(prompt => weakPrompts.includes(prompt));
    index = 0;
    showText();
    updateSmartReviewBar();
}

function finishSmartReview(){
    smartReviewActive = false;
    texts = buildSmartEasyRound(currentPrompt);
    index = 0;
    updateSmartReviewBar();

    if(typeof showCenterToast === "function"){
        showCenterToast("🌟 Ôn tập xong!", "correct");
    }
}

const baseShowTextForSmartReview = showText;
showText = function(){
    smartPromptWrongRecorded = false;
    baseShowTextForSmartReview();
    updateSmartReviewBar();
};

const baseSetModeForSmartReview = setMode;
setMode = function(mode){
    if(mode !== "easy") smartReviewActive = false;
    baseSetModeForSmartReview(mode);
    updateSmartReviewBar();
};

nextPromptForCurrentMode = function(){
    if(currentMode === "free") return;

    index++;
    if(index >= texts.length){
        if(currentMode === "easy"){
            if(smartReviewActive){
                finishSmartReview();
            }else{
                texts = buildSmartEasyRound(currentPrompt);
                index = 0;
            }
        }else{
            index = 0;
        }
    }

    showText();
};

checkNext = function(){
    if(currentMode === "free") return;

    if(normalizeForCompare(input.value) === normalizeForCompare(currentPrompt)){
        clearTimeout(resultTimer);
        result.className = "correct";
        result.innerText = "🎉 Chính xác! Giỏi quá!";
        playCorrectSound();

        if(currentMode === "easy"){
            recordPromptResult(currentPrompt, true);
        }

        index++;
        if(index >= texts.length){
            if(currentMode === "easy"){
                if(smartReviewActive){
                    finishSmartReview();
                }else{
                    texts = buildSmartEasyRound(currentPrompt);
                    index = 0;
                }
            }else{
                index = 0;
            }
        }

        resultTimer = setTimeout(showText, NEXT_PROMPT_DELAY_MS);
    }else{
        clearTimeout(resultTimer);
        result.className = "incorrect";
        result.style.opacity = "1";
        showTypingDiff(currentPrompt, input.value);

        if(currentMode === "easy" && !smartPromptWrongRecorded){
            smartPromptWrongRecorded = true;
            recordPromptResult(currentPrompt, false);
        }
    }
};

ensureSmartReviewBar();
updateSmartReviewBar();
