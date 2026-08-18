/* ===== PHASE 9 ĐỢT 11F - MEMORY STATE NHẸ CHO CRITICAL EASY =====
 * Topic/Profile cần preference Memory từ sớm, nhưng không cần timer/UI/Listen bridge.
 * Tách state khỏi memory-mode.js để behavior Memory có thể post-load sau first paint.
 */
const GO_CHU_MEMORY_WORDS_KEY = "goChuVer2.memoryWords.v1";
const GO_CHU_MEMORY_SECONDS_KEY = "goChuVer2.memorySeconds.v1";

let memoryModeActive = false;
let memoryWordCount = loadMemoryNumber(GO_CHU_MEMORY_WORDS_KEY, 2, [2, 3, 4]);
let memorySeconds = loadMemoryNumber(GO_CHU_MEMORY_SECONDS_KEY, 5, [3, 5, 7]);

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

/*
 * Stub để topic-level.js có binding ổn định trong critical path.
 * memory-mode.js post-load sẽ thay bằng implementation thật;
 * memory-topic-bridge.js sau đó gắn lại filter theo chủ đề.
 */
let buildMemoryRound = function(){
    return [];
};

window.getGoChuMemoryStateHealth = function(){
    return {
        memoryModeActive,
        memoryWordCount,
        memorySeconds,
        behaviorReady: Boolean(window.GO_CHU_MEMORY_BEHAVIOR_READY)
    };
};
