/* ===== VER2 PHASE 7 - PROFILE RUNTIME CRITICAL =====
 * Phase 9 đợt 11H: file này chỉ giữ registry/data/preferences/study runtime.
 * HUD/dashboard/profile management/backup UI chuyển sang profile-dashboard.js post-startup.
 */
const GO_CHU_PROFILES_KEY = "goChuVer2.profiles.v1";
const GO_CHU_ACTIVE_PROFILE_KEY = "goChuVer2.activeProfile.v1";
const GO_CHU_PROFILE_PREFIX = "goChuVer2.profile.";
const GO_CHU_PROFILE_VERSION = 1;

let profiles = [];
let activeProfileId = "";
let activeProfileData = null;
let profileStudyTimer = null;
let profileStudyDirtySeconds = 0;

function createProfileId(){
    return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function profileDataKey(profileId){
    return `${GO_CHU_PROFILE_PREFIX}${profileId}.v1`;
}

function safeJsonParse(raw, fallback){
    try {
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
}

function loadProfilesRegistry(){
    try {
        const parsed = safeJsonParse(localStorage.getItem(GO_CHU_PROFILES_KEY), []);
        if(!Array.isArray(parsed)) return [];
        return parsed
            .filter(item => item && typeof item.id === "string")
            .map(item => ({
                id: item.id,
                name: String(item.name || "Bé").slice(0, 40),
                createdAt: Number(item.createdAt || Date.now())
            }));
    } catch (error) {
        return [];
    }
}

function saveProfilesRegistry(){
    try {
        localStorage.setItem(GO_CHU_PROFILES_KEY, JSON.stringify(profiles));
        localStorage.setItem(GO_CHU_ACTIVE_PROFILE_KEY, activeProfileId);
    } catch (error) {}
}

function createDefaultProfileData(useLegacy = false){
    let legacyStats = {};
    if(useLegacy){
        try {
            legacyStats = safeJsonParse(localStorage.getItem(GO_CHU_PROMPT_STATS_KEY), {}) || {};
        } catch (error) {}
    }

    return {
        version: GO_CHU_PROFILE_VERSION,
        promptStats: useLegacy && Object.keys(legacyStats).length ? legacyStats : {},
        study: {
            totalSeconds: 0,
            days: {}
        },
        preferences: {
            topicId: useLegacy ? selectedTopicId : "all",
            levelMode: useLegacy ? selectedLevelMode : "auto",
            memoryWordCount: useLegacy ? memoryWordCount : 2,
            memorySeconds: useLegacy ? memorySeconds : 5
        }
    };
}

function normalizeProfileData(data){
    const source = data && typeof data === "object" ? data : {};
    const prefs = source.preferences && typeof source.preferences === "object" ? source.preferences : {};
    const study = source.study && typeof source.study === "object" ? source.study : {};

    return {
        version: GO_CHU_PROFILE_VERSION,
        promptStats: source.promptStats && typeof source.promptStats === "object" ? source.promptStats : {},
        study: {
            totalSeconds: Math.max(0, Number(study.totalSeconds || 0)),
            days: study.days && typeof study.days === "object" ? study.days : {}
        },
        preferences: {
            topicId: GO_CHU_TOPICS.some(topic => topic.id === prefs.topicId) ? prefs.topicId : "all",
            levelMode: ["auto", "1", "2", "3", "4"].includes(String(prefs.levelMode)) ? String(prefs.levelMode) : "auto",
            memoryWordCount: [2, 3, 4].includes(Number(prefs.memoryWordCount)) ? Number(prefs.memoryWordCount) : 2,
            memorySeconds: [3, 5, 7].includes(Number(prefs.memorySeconds)) ? Number(prefs.memorySeconds) : 5
        }
    };
}

function loadProfileData(profileId){
    try {
        const raw = localStorage.getItem(profileDataKey(profileId));
        return raw ? normalizeProfileData(safeJsonParse(raw, {})) : null;
    } catch (error) {
        return null;
    }
}

function saveProfileData(profileId, data){
    try {
        localStorage.setItem(profileDataKey(profileId), JSON.stringify(normalizeProfileData(data)));
    } catch (error) {}
}

function initializeProfileSystem(){
    const startedAt = performance.now();
    profiles = loadProfilesRegistry();
    const isFirstSetup = profiles.length === 0;

    if(isFirstSetup){
        const first = { id: createProfileId(), name: "Bé 1", createdAt: Date.now() };
        profiles = [first];
        activeProfileId = first.id;
        activeProfileData = createDefaultProfileData(true);
        saveProfileData(first.id, activeProfileData);
        saveProfilesRegistry();
    }else{
        let storedActive = "";
        try {
            storedActive = localStorage.getItem(GO_CHU_ACTIVE_PROFILE_KEY) || "";
        } catch (error) {}

        const hasStoredActive = profiles.some(item => item.id === storedActive);
        activeProfileId = hasStoredActive ? storedActive : profiles[0].id;
        const loaded = loadProfileData(activeProfileId);
        activeProfileData = loaded || createDefaultProfileData(false);

        if(!loaded) saveProfileData(activeProfileId, activeProfileData);
        if(!hasStoredActive){
            try { localStorage.setItem(GO_CHU_ACTIVE_PROFILE_KEY, activeProfileId); } catch (error) {}
        }
    }

    applyProfileToRuntime(false, false);
    if(typeof goChuStartupMeasure === "function") goChuStartupMeasure("profile:init", startedAt);
    if(typeof goChuStartupMark === "function") goChuStartupMark("profileReady");
}

function getActiveProfile(){
    return profiles.find(profile => profile.id === activeProfileId) || profiles[0] || null;
}

function syncRuntimeIntoProfile(){
    if(!activeProfileData || !activeProfileId) return;
    activeProfileData.promptStats = promptStats && typeof promptStats === "object" ? promptStats : {};
    activeProfileData.preferences = {
        topicId: selectedTopicId,
        levelMode: selectedLevelMode,
        memoryWordCount,
        memorySeconds
    };
    saveProfileData(activeProfileId, activeProfileData);
    profileStudyDirtySeconds = 0;
}

function applyProfileToRuntime(rebuild = true, refreshUi = true){
    activeProfileData = normalizeProfileData(activeProfileData || createDefaultProfileData(false));
    promptStats = activeProfileData.promptStats;

    selectedTopicId = activeProfileData.preferences.topicId;
    selectedLevelMode = activeProfileData.preferences.levelMode;
    memoryWordCount = activeProfileData.preferences.memoryWordCount;
    memorySeconds = activeProfileData.preferences.memorySeconds;

    if(typeof normalizeSavedLevelForTopic === "function") normalizeSavedLevelForTopic();

    const topicSelect = document.getElementById("topicSelect");
    const levelSelect = document.getElementById("levelSelect");
    const memoryWordSelect = document.getElementById("memoryWordCount");
    const memorySecondsSelect = document.getElementById("memorySeconds");

    if(topicSelect) topicSelect.value = selectedTopicId;
    if(levelSelect) levelSelect.value = selectedLevelMode;
    if(memoryWordSelect) memoryWordSelect.value = String(memoryWordCount);
    if(memorySecondsSelect) memorySecondsSelect.value = String(memorySeconds);

    studySeconds = 0;
    if(studyTime) studyTime.textContent = formatStudyDuration(studySeconds);

    if(rebuild && currentMode === "easy"){
        texts = buildSmartEasyRound(currentPrompt);
        index = 0;
        if(!texts.length) texts = [...getTopicPool()];
        if(texts.length) showText();
    }

    if(!refreshUi) return;

    if(typeof updateSmartReviewBar === "function") updateSmartReviewBar();
    if(typeof updateMemoryModeBar === "function") updateMemoryModeBar();
    if(typeof updateListenModeBar === "function") updateListenModeBar();
    if(typeof updateTopicLevelBar === "function") updateTopicLevelBar();
    if(typeof updateProfileHud === "function") updateProfileHud();
    if(
        document.getElementById("profileDashboardOverlay") &&
        typeof renderProfileDashboard === "function"
    ){
        renderProfileDashboard();
    }
}

savePromptStats = function(){
    if(!activeProfileData) return;
    activeProfileData.promptStats = promptStats;
    saveProfileData(activeProfileId, activeProfileData);
};

saveTopicLevelSetting = function(key, value){
    if(!activeProfileData) return;
    if(key === GO_CHU_TOPIC_KEY) activeProfileData.preferences.topicId = String(value);
    if(key === GO_CHU_LEVEL_KEY) activeProfileData.preferences.levelMode = String(value);
    saveProfileData(activeProfileId, activeProfileData);
};

saveMemoryNumber = function(key, value){
    if(!activeProfileData) return;
    if(key === GO_CHU_MEMORY_WORDS_KEY) activeProfileData.preferences.memoryWordCount = Number(value);
    if(key === GO_CHU_MEMORY_SECONDS_KEY) activeProfileData.preferences.memorySeconds = Number(value);
    saveProfileData(activeProfileId, activeProfileData);
};

function getLocalDayKey(date = new Date()){
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

startStudyTimer = function(){
    if(profileStudyTimer) return;
    studyTime.textContent = formatStudyDuration(studySeconds);

    profileStudyTimer = setInterval(() => {
        studySeconds += 1;
        studyTime.textContent = formatStudyDuration(studySeconds);

        if(!activeProfileData) return;
        const dayKey = getLocalDayKey();
        activeProfileData.study.totalSeconds += 1;
        activeProfileData.study.days[dayKey] = Math.max(0, Number(activeProfileData.study.days[dayKey] || 0)) + 1;
        profileStudyDirtySeconds += 1;

        if(profileStudyDirtySeconds >= 15){
            syncRuntimeIntoProfile();
            const overlay = document.getElementById("profileDashboardOverlay");
            if(
                overlay && !overlay.classList.contains("hidden") &&
                typeof renderProfileDashboard === "function"
            ){
                renderProfileDashboard();
            }
        }
    }, 1000);
};

window.GO_CHU_PROFILE_RUNTIME_READY = true;
window.getGoChuProfileRuntimeHealth = function(){
    return {
        ready: Boolean(window.GO_CHU_PROFILE_RUNTIME_READY),
        profileCount: profiles.length,
        activeProfileId,
        activeProfileName: getActiveProfile()?.name || "",
        dashboardReady: Boolean(window.GO_CHU_PROFILE_DASHBOARD_READY)
    };
};

initializeProfileSystem();

document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "hidden") syncRuntimeIntoProfile();
});
window.addEventListener("beforeunload", syncRuntimeIntoProfile);
