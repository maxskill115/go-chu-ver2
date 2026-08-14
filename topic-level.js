/* ===== VER2 PHASE 6 - CHỦ ĐỀ + CẤP ĐỘ ===== */
const GO_CHU_TOPIC_KEY = "goChuVer2.topic.v1";
const GO_CHU_LEVEL_KEY = "goChuVer2.level.v1";

let selectedTopicId = loadTopicSetting();
let selectedLevelMode = loadLevelSetting();
let lastAutoLevel = null;

/* ===== PHASE 9 ĐỢT 11 - CACHE POOL TĨNH ===== */
const goChuTopicPoolCache = new Map();
const goChuLevelPoolCache = new Map();

function loadTopicSetting(){
    try {
        const value = localStorage.getItem(GO_CHU_TOPIC_KEY) || "all";
        return GO_CHU_TOPICS.some(topic => topic.id === value) ? value : "all";
    } catch (error) {
        return "all";
    }
}

function loadLevelSetting(){
    try {
        const value = localStorage.getItem(GO_CHU_LEVEL_KEY) || "auto";
        return ["auto", "1", "2", "3", "4"].includes(value) ? value : "auto";
    } catch (error) {
        return "auto";
    }
}

function saveTopicLevelSetting(key, value){
    try {
        localStorage.setItem(key, String(value));
    } catch (error) {}
}

function getTopicPool(topicId = selectedTopicId){
    const key = topicId || "all";
    if(goChuTopicPoolCache.has(key)) return goChuTopicPoolCache.get(key);

    const source = typeof GO_CHU_UNIQUE_EASY_PROMPTS !== "undefined"
        ? GO_CHU_UNIQUE_EASY_PROMPTS
        : [...new Set(easyWords)];
    const pool = key === "all"
        ? [...source]
        : source.filter(prompt => promptMatchesTopic(prompt, key));
    const frozen = Object.freeze(pool);
    goChuTopicPoolCache.set(key, frozen);
    return frozen;
}

function getLevelPool(topicId, wordCount){
    const topicKey = topicId || "all";
    const count = Number(wordCount);
    const cacheKey = `${topicKey}:${count}`;
    if(goChuLevelPoolCache.has(cacheKey)) return goChuLevelPoolCache.get(cacheKey);

    const pool = getTopicPool(topicKey).filter(prompt => getPromptWordCount(prompt) === count);
    const frozen = Object.freeze(pool);
    goChuLevelPoolCache.set(cacheKey, frozen);
    return frozen;
}

function normalizeSavedLevelForTopic(){
    if(selectedLevelMode === "auto") return;
    const lockedLevel = Number(selectedLevelMode);
    if(getLevelPool(selectedTopicId, lockedLevel).length) return;
    selectedLevelMode = "auto";
    saveTopicLevelSetting(GO_CHU_LEVEL_KEY, selectedLevelMode);
}

function getTopicLearningSummary(){
    const pool = getTopicPool();
    let correct = 0;
    let wrong = 0;

    if(typeof promptStats !== "undefined"){
        pool.forEach(prompt => {
            const entry = promptStats[prompt];
            if(!entry) return;
            correct += Number(entry.correct || 0);
            wrong += Number(entry.wrong || 0);
        });
    }

    const attempts = correct + wrong;
    const accuracy = attempts ? correct / attempts : 0;
    return { attempts, correct, wrong, accuracy };
}

function calculateAutoTargetLevel(){
    const summary = getTopicLearningSummary();

    if(summary.attempts >= 40 && summary.accuracy >= 0.92) return 4;
    if(summary.attempts >= 15 && summary.accuracy >= 0.88) return 3;
    if(summary.attempts >= 8 && summary.accuracy < 0.65) return 1;
    return 2;
}

function resolveAvailableAutoLevel(target){
    const candidates = [target, target - 1, target + 1, 2, 3, 1, 4]
        .filter(level => level >= 1 && level <= 4);
    const unique = [...new Set(candidates)];
    return unique.find(level => getLevelPool(selectedTopicId, level).length > 0) || 2;
}

function getEffectiveLearningLevel(){
    if(selectedLevelMode !== "auto"){
        const lockedLevel = Number(selectedLevelMode);
        if(getLevelPool(selectedTopicId, lockedLevel).length) return lockedLevel;
        return resolveAvailableAutoLevel(lockedLevel);
    }
    return resolveAvailableAutoLevel(calculateAutoTargetLevel());
}

function promptMatchesCurrentTopic(prompt){
    return promptMatchesTopic(prompt, selectedTopicId);
}

function promptMatchesCurrentLevel(prompt, effectiveLevel = null){
    const level = effectiveLevel == null ? getEffectiveLearningLevel() : Number(effectiveLevel);
    return getPromptWordCount(prompt) === level;
}

function promptMatchesLearningFilters(prompt, respectLevel = true, effectiveLevel = null){
    if(!promptMatchesCurrentTopic(prompt)) return false;
    if(!respectLevel) return true;
    return promptMatchesCurrentLevel(prompt, effectiveLevel);
}

const baseGetWeakPromptRecordsForTopic = getWeakPromptRecords;
getWeakPromptRecords = function(){
    const respectLevel = !(typeof memoryModeActive !== "undefined" && memoryModeActive);
    const effectiveLevel = respectLevel ? getEffectiveLearningLevel() : null;
    return baseGetWeakPromptRecordsForTopic().filter(item =>
        promptMatchesLearningFilters(item.prompt, respectLevel, effectiveLevel)
    );
};

const baseBuildSmartEasyRoundForTopic = buildSmartEasyRound;
buildSmartEasyRound = function(previousPrompt = ""){
    /* QUAN TRỌNG: level chỉ tính 1 lần cho cả round, không tính lại cho từng prompt. */
    const effectiveLevel = getEffectiveLearningLevel();
    const filtered = baseBuildSmartEasyRoundForTopic(previousPrompt)
        .filter(prompt =>
            promptMatchesTopic(prompt, selectedTopicId) &&
            getPromptWordCount(prompt) === effectiveLevel
        );

    if(previousPrompt && filtered.length > 1 && filtered[0] === previousPrompt){
        const swapIndex = filtered.findIndex((prompt, i) => i > 0 && prompt !== previousPrompt);
        if(swapIndex > 0){
            [filtered[0], filtered[swapIndex]] = [filtered[swapIndex], filtered[0]];
        }
    }

    return filtered;
};

const baseBuildMemoryRoundForTopic = buildMemoryRound;
buildMemoryRound = function(previousPrompt = ""){
    const filtered = baseBuildMemoryRoundForTopic(previousPrompt)
        .filter(prompt => promptMatchesTopic(prompt, selectedTopicId));

    if(previousPrompt && filtered.length > 1 && filtered[0] === previousPrompt){
        const swapIndex = filtered.findIndex((prompt, i) => i > 0 && prompt !== previousPrompt);
        if(swapIndex > 0){
            [filtered[0], filtered[swapIndex]] = [filtered[swapIndex], filtered[0]];
        }
    }
    return filtered;
};

function ensureTopicLevelBar(){
    let bar = document.getElementById("topicLevelBar");
    if(bar) return bar;

    bar = document.createElement("div");
    bar.id = "topicLevelBar";
    bar.className = "topic-level-bar";

    const topicField = document.createElement("label");
    topicField.className = "topic-level-field topic-field";
    topicField.innerHTML = '<span>Chủ đề</span><select id="topicSelect" class="topic-level-select"></select>';

    const levelField = document.createElement("label");
    levelField.className = "topic-level-field level-field";
    levelField.innerHTML = `
        <span>Cấp độ</span>
        <select id="levelSelect" class="topic-level-select">
            <option value="auto">✨ Tự động</option>
            <option value="1">1 từ</option>
            <option value="2">2 từ</option>
            <option value="3">3 từ</option>
            <option value="4">4 từ</option>
        </select>
    `;

    const status = document.createElement("div");
    status.id = "topicLevelStatus";
    status.className = "topic-level-status";

    bar.append(topicField, levelField, status);

    const anchor = document.getElementById("listenModeBar")
        || document.getElementById("memoryModeBar")
        || input;
    normalPanel.insertBefore(bar, anchor);

    const topicSelect = document.getElementById("topicSelect");
    GO_CHU_TOPICS.forEach(topic => {
        const option = document.createElement("option");
        option.value = topic.id;
        option.textContent = `${topic.icon} ${topic.label}`;
        topicSelect.appendChild(option);
    });

    topicSelect.value = selectedTopicId;
    document.getElementById("levelSelect").value = selectedLevelMode;

    topicSelect.addEventListener("change", () => {
        selectedTopicId = topicSelect.value;
        saveTopicLevelSetting(GO_CHU_TOPIC_KEY, selectedTopicId);
        normalizeSavedLevelForTopic();
        document.getElementById("levelSelect").value = selectedLevelMode;
        if(typeof smartReviewActive !== "undefined") smartReviewActive = false;
        rebuildTopicLearningRound();
        updateTopicLevelBar();
        playClickSound();
    });

    document.getElementById("levelSelect").addEventListener("change", event => {
        const nextMode = event.target.value;
        const previousMode = selectedLevelMode;

        if(nextMode !== "auto"){
            const count = getLevelPool(selectedTopicId, Number(nextMode)).length;
            if(!count){
                event.target.value = previousMode;
                if(typeof showCenterToast === "function"){
                    showCenterToast("Chủ đề này chưa có nội dung ở mức đã chọn", "incorrect");
                }
                return;
            }
        }

        selectedLevelMode = nextMode;
        saveTopicLevelSetting(GO_CHU_LEVEL_KEY, selectedLevelMode);
        if(typeof smartReviewActive !== "undefined") smartReviewActive = false;
        rebuildTopicLearningRound();
        updateTopicLevelBar();
        playClickSound();
    });

    return bar;
}

function rebuildTopicLearningRound(){
    if(currentMode !== "easy") return;

    if(typeof memoryModeActive !== "undefined" && memoryModeActive){
        restartMemoryRound();
        return;
    }

    texts = buildSmartEasyRound(currentPrompt);
    index = 0;

    if(!texts.length){
        texts = [...getTopicPool()];
    }

    if(texts.length) showText();
}

function updateTopicLevelBar(){
    ensureTopicLevelBar();
    const bar = document.getElementById("topicLevelBar");
    const topicSelect = document.getElementById("topicSelect");
    const levelSelect = document.getElementById("levelSelect");
    const status = document.getElementById("topicLevelStatus");
    if(!bar || !topicSelect || !levelSelect || !status) return;

    const isEasy = currentMode === "easy";
    bar.classList.toggle("hidden-by-mode", !isEasy);
    bar.setAttribute("aria-hidden", isEasy ? "false" : "true");

    /* Ngoài Easy không tính summary/pool vô ích. */
    if(!isEasy){
        status.textContent = "";
        levelSelect.disabled = true;
        return;
    }

    const memoryActive = typeof memoryModeActive !== "undefined" && memoryModeActive;
    const topic = getTopicById(selectedTopicId);
    const effectiveLevel = getEffectiveLearningLevel();
    const poolCount = memoryActive
        ? getLevelPool(selectedTopicId, memoryWordCount).length
        : getLevelPool(selectedTopicId, effectiveLevel).length;

    topicSelect.value = selectedTopicId;
    levelSelect.value = selectedLevelMode;
    levelSelect.disabled = memoryActive;

    if(memoryActive){
        status.textContent = `${topic.icon} ${topic.label} · Memory ${memoryWordCount} từ · ${poolCount} nội dung`;
    }else if(selectedLevelMode === "auto"){
        status.textContent = `${topic.icon} ${topic.label} · Auto → ${effectiveLevel} từ · ${poolCount} nội dung`;
    }else{
        status.textContent = `${topic.icon} ${topic.label} · ${effectiveLevel} từ · ${poolCount} nội dung`;
    }
}

const baseRecordPromptResultForTopic = recordPromptResult;
recordPromptResult = function(prompt, isCorrect){
    const beforeLevel = selectedLevelMode === "auto" ? getEffectiveLearningLevel() : null;
    baseRecordPromptResultForTopic(prompt, isCorrect);
    const afterLevel = selectedLevelMode === "auto" ? getEffectiveLearningLevel() : null;
    updateTopicLevelBar();

    if(
        selectedLevelMode === "auto" &&
        beforeLevel !== null && afterLevel !== beforeLevel &&
        currentMode === "easy" &&
        !(typeof memoryModeActive !== "undefined" && memoryModeActive)
    ){
        lastAutoLevel = afterLevel;
        if(typeof showCenterToast === "function"){
            showCenterToast(`✨ Vòng sau chuyển mức ${afterLevel} từ`, "correct");
        }
    }
};

const baseShowTextForTopic = showText;
showText = function(){
    baseShowTextForTopic();
    updateTopicLevelBar();
};

const baseSetModeForTopic = setMode;
setMode = function(mode){
    baseSetModeForTopic(mode);
    updateTopicLevelBar();
};

function getGoChuLearningPoolHealth(){
    return {
        topicPoolEntries: goChuTopicPoolCache.size,
        levelPoolEntries: goChuLevelPoolCache.size,
        selectedTopicId,
        selectedLevelMode,
        effectiveLevel: currentMode === "easy" ? getEffectiveLearningLevel() : null
    };
}
window.getGoChuLearningPoolHealth = getGoChuLearningPoolHealth;

normalizeSavedLevelForTopic();
ensureTopicLevelBar();
updateTopicLevelBar();
