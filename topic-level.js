/* ===== VER2 PHASE 6 - CHỦ ĐỀ + CẤP ĐỘ ===== */
const GO_CHU_TOPIC_KEY = "goChuVer2.topic.v1";
const GO_CHU_LEVEL_KEY = "goChuVer2.level.v1";

let selectedTopicId = loadTopicSetting();
let selectedLevelMode = loadLevelSetting();
let lastAutoLevel = null;

/* ===== PHASE 9 ĐỢT 11 - CACHE POOL TĨNH ===== */
const goChuTopicPoolCache = new Map();
const goChuLevelPoolCache = new Map();

/* ===== PHASE 9 ĐỢT 11C - CACHE QUYẾT ĐỊNH + FAST ROUND ===== */
const goChuTopicSummaryCache = new Map();
let goChuEffectiveLevelCache = {
    topicId: "",
    levelMode: "",
    statsRef: null,
    statsRevision: -1,
    value: null
};
let goChuTopicLevelUiFrame = 0;
let goChuLastEasyRoundBuildMs = 0;
let goChuLastEasyRoundSize = 0;
let goChuLastEasySourcePoolSize = 0;

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

function getCurrentPromptStatsRevision(){
    return typeof goChuPromptStatsRevision === "number" ? goChuPromptStatsRevision : 0;
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
    const statsRef = typeof promptStats !== "undefined" ? promptStats : null;
    const statsRevision = getCurrentPromptStatsRevision();
    const cacheKey = selectedTopicId || "all";
    const cached = goChuTopicSummaryCache.get(cacheKey);

    if(
        cached &&
        cached.statsRef === statsRef &&
        cached.statsRevision === statsRevision
    ){
        return cached.summary;
    }

    const pool = getTopicPool();
    let correct = 0;
    let wrong = 0;

    if(statsRef){
        pool.forEach(prompt => {
            const entry = statsRef[prompt];
            if(!entry) return;
            correct += Number(entry.correct || 0);
            wrong += Number(entry.wrong || 0);
        });
    }

    const attempts = correct + wrong;
    const summary = Object.freeze({
        attempts,
        correct,
        wrong,
        accuracy: attempts ? correct / attempts : 0
    });

    goChuTopicSummaryCache.set(cacheKey, { statsRef, statsRevision, summary });
    return summary;
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
    const statsRef = typeof promptStats !== "undefined" ? promptStats : null;
    const statsRevision = getCurrentPromptStatsRevision();

    if(
        goChuEffectiveLevelCache.topicId === selectedTopicId &&
        goChuEffectiveLevelCache.levelMode === selectedLevelMode &&
        goChuEffectiveLevelCache.statsRef === statsRef &&
        goChuEffectiveLevelCache.statsRevision === statsRevision &&
        goChuEffectiveLevelCache.value !== null
    ){
        return goChuEffectiveLevelCache.value;
    }

    let value;
    if(selectedLevelMode !== "auto"){
        const lockedLevel = Number(selectedLevelMode);
        value = getLevelPool(selectedTopicId, lockedLevel).length
            ? lockedLevel
            : resolveAvailableAutoLevel(lockedLevel);
    }else{
        value = resolveAvailableAutoLevel(calculateAutoTargetLevel());
    }

    goChuEffectiveLevelCache = {
        topicId: selectedTopicId,
        levelMode: selectedLevelMode,
        statsRef,
        statsRevision,
        value
    };
    return value;
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

function shuffleTopicLearningPool(items){
    const shuffled = [...items];
    for(let i = shuffled.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/*
 * FAST PATH:
 * Trước đây round Easy gọi baseBuildSmartEasyRound() trên TOÀN BỘ easyWords,
 * chèn weak prompt, rồi mới lọc Chủ đề/Cấp độ. Khi vào Easy việc này lãng phí.
 * Bây giờ lấy thẳng cached level-pool đã lọc và chỉ shuffle đúng pool đó.
 */
function buildSmartEasyRound(previousPrompt = ""){
    const startedAt = performance.now();
    const effectiveLevel = getEffectiveLearningLevel();
    const sourcePool = getLevelPool(selectedTopicId, effectiveLevel);
    const fallbackPool = sourcePool.length ? sourcePool : getTopicPool(selectedTopicId);
    const round = shuffleTopicLearningPool(fallbackPool);

    const weak = baseGetWeakPromptRecordsForTopic()
        .filter(item =>
            promptMatchesTopic(item.prompt, selectedTopicId) &&
            getPromptWordCount(item.prompt) === effectiveLevel
        )
        .slice(0, GO_CHU_SMART_EXTRA_LIMIT);

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

    goChuLastEasySourcePoolSize = fallbackPool.length;
    goChuLastEasyRoundSize = round.length;
    goChuLastEasyRoundBuildMs = performance.now() - startedAt;
    if(typeof goChuStartupMeasure === "function"){
        goChuStartupMeasure("easy:buildFilteredRound", startedAt);
    }
    return round;
}

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
        scheduleTopicLevelBarUpdate();
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
        scheduleTopicLevelBarUpdate();
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

function scheduleTopicLevelBarUpdate(){
    if(goChuTopicLevelUiFrame) return;
    goChuTopicLevelUiFrame = requestAnimationFrame(() => {
        goChuTopicLevelUiFrame = 0;
        updateTopicLevelBar();
    });
}

const baseRecordPromptResultForTopic = recordPromptResult;
recordPromptResult = function(prompt, isCorrect){
    const beforeLevel = selectedLevelMode === "auto" ? getEffectiveLearningLevel() : null;
    baseRecordPromptResultForTopic(prompt, isCorrect);
    const afterLevel = selectedLevelMode === "auto" ? getEffectiveLearningLevel() : null;
    scheduleTopicLevelBarUpdate();

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
    scheduleTopicLevelBarUpdate();
};

const baseSetModeForTopic = setMode;
setMode = function(mode){
    baseSetModeForTopic(mode);
    scheduleTopicLevelBarUpdate();
};

function getGoChuLearningPoolHealth(){
    return {
        topicPoolEntries: goChuTopicPoolCache.size,
        levelPoolEntries: goChuLevelPoolCache.size,
        summaryCacheEntries: goChuTopicSummaryCache.size,
        selectedTopicId,
        selectedLevelMode,
        effectiveLevel: currentMode === "easy" ? getEffectiveLearningLevel() : null,
        lastEasySourcePoolSize: goChuLastEasySourcePoolSize,
        lastEasyRoundSize: goChuLastEasyRoundSize,
        lastEasyRoundBuildMs: Math.round(goChuLastEasyRoundBuildMs * 100) / 100,
        uiUpdateScheduled: Boolean(goChuTopicLevelUiFrame)
    };
}
window.getGoChuLearningPoolHealth = getGoChuLearningPoolHealth;

normalizeSavedLevelForTopic();
ensureTopicLevelBar();
scheduleTopicLevelBarUpdate();
