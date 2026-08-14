/* ===== VER2 PHASE 7 - HỒ SƠ BÉ + THỐNG KÊ ===== */
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
        activeProfileId = profiles.some(item => item.id === storedActive) ? storedActive : profiles[0].id;
        activeProfileData = loadProfileData(activeProfileId) || createDefaultProfileData(false);
        saveProfileData(activeProfileId, activeProfileData);
        saveProfilesRegistry();
    }

    applyProfileToRuntime(false);
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

function stopTransientLearningModes(){
    if(typeof smartReviewActive !== "undefined") smartReviewActive = false;

    if(typeof listenModeActive !== "undefined" && listenModeActive){
        listenModeActive = false;
        if(typeof speechSupported === "function" && speechSupported()) window.speechSynthesis.cancel();
        if(typeof applyListenPromptVisibility === "function") applyListenPromptVisibility();
    }

    if(typeof memoryModeActive !== "undefined" && memoryModeActive){
        memoryModeActive = false;
        if(typeof clearMemoryTimers === "function") clearMemoryTimers();
        memoryRemaining = 0;
        normalPanel.classList.remove("memory-mode-active");
        if(typeof setMemoryPromptHidden === "function") setMemoryPromptHidden(false);
        input.disabled = false;
        const nextBtn = document.getElementById("nextBtn");
        if(nextBtn) nextBtn.disabled = false;
    }
}

function applyProfileToRuntime(rebuild = true){
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
        if(!texts.length) texts = getTopicPool();
        if(texts.length) showText();
    }

    if(typeof updateSmartReviewBar === "function") updateSmartReviewBar();
    if(typeof updateMemoryModeBar === "function") updateMemoryModeBar();
    if(typeof updateListenModeBar === "function") updateListenModeBar();
    if(typeof updateTopicLevelBar === "function") updateTopicLevelBar();
    updateProfileHud();
    renderProfileDashboard();
}

function switchProfile(profileId){
    if(profileId === activeProfileId || !profiles.some(profile => profile.id === profileId)) return;

    syncRuntimeIntoProfile();
    stopTransientLearningModes();

    activeProfileId = profileId;
    activeProfileData = loadProfileData(profileId) || createDefaultProfileData(false);
    saveProfilesRegistry();
    applyProfileToRuntime(true);

    if(typeof showCenterToast === "function"){
        const profile = getActiveProfile();
        showCenterToast(`👤 ${profile ? profile.name : "Đã đổi hồ sơ"}`, "correct");
    }
}

/* ===== GẮN LOCALSTORAGE HIỆN CÓ VÀO HỒ SƠ ĐANG ACTIVE ===== */
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

/* startStudyTimer được gọi sau cùng trong script.js, nên override tại đây. */
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
            if(!document.getElementById("profileDashboardOverlay")?.classList.contains("hidden")){
                renderProfileDashboard();
            }
        }
    }, 1000);
};

function formatProfileDuration(seconds){
    const total = Math.max(0, Math.floor(Number(seconds || 0)));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if(hours > 0) return `${hours}g ${minutes}p`;
    if(minutes > 0) return `${minutes} phút`;
    return `${total} giây`;
}

function getProfileStatsSummary(){
    const stats = promptStats || {};
    let correct = 0;
    let wrong = 0;

    Object.values(stats).forEach(entry => {
        correct += Number(entry?.correct || 0);
        wrong += Number(entry?.wrong || 0);
    });

    const attempts = correct + wrong;
    return {
        correct,
        wrong,
        attempts,
        accuracy: attempts ? correct / attempts : 0,
        weakCount: Object.values(stats).filter(entry => Math.max(0, Number(entry?.wrong || 0) * 2 - Number(entry?.correct || 0)) > 0).length
    };
}

function getTopWeakPrompts(limit = 10){
    return Object.entries(promptStats || {})
        .map(([prompt, entry]) => ({
            prompt,
            correct: Number(entry?.correct || 0),
            wrong: Number(entry?.wrong || 0),
            weakness: Math.max(0, Number(entry?.wrong || 0) * 2 - Number(entry?.correct || 0))
        }))
        .filter(item => item.weakness > 0)
        .sort((a, b) => b.weakness - a.weakness || b.wrong - a.wrong)
        .slice(0, limit);
}

function getTopicStatsRows(){
    return GO_CHU_TOPICS
        .filter(topic => topic.id !== "all")
        .map(topic => {
            let correct = 0;
            let wrong = 0;
            Object.entries(promptStats || {}).forEach(([prompt, entry]) => {
                if(!promptMatchesTopic(prompt, topic.id)) return;
                correct += Number(entry?.correct || 0);
                wrong += Number(entry?.wrong || 0);
            });
            const attempts = correct + wrong;
            return {
                ...topic,
                attempts,
                correct,
                wrong,
                accuracy: attempts ? correct / attempts : 0
            };
        });
}

function ensureProfileHud(){
    const hudTop = document.querySelector(".hud-top");
    if(!hudTop) return;

    let button = document.getElementById("profileDashboardBtn");
    if(!button){
        button = document.createElement("button");
        button.id = "profileDashboardBtn";
        button.className = "hud-icon-btn profile-hud-btn";
        button.type = "button";
        button.textContent = "👤";
        button.setAttribute("aria-label", "Hồ sơ và thống kê");
        button.addEventListener("click", () => {
            playClickSound();
            openProfileDashboard();
        });
        gameMenuBtn.insertAdjacentElement("afterend", button);
    }

    ensureProfileDashboard();
}

function updateProfileHud(){
    const button = document.getElementById("profileDashboardBtn");
    const profile = getActiveProfile();
    if(button && profile){
        button.title = `Hồ sơ: ${profile.name}`;
        button.dataset.profileName = profile.name;
    }
}

function ensureProfileDashboard(){
    let overlay = document.getElementById("profileDashboardOverlay");
    if(overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "profileDashboardOverlay";
    overlay.className = "profile-dashboard-overlay hidden";
    overlay.innerHTML = `
        <div class="profile-dashboard-card" role="dialog" aria-modal="true" aria-labelledby="profileDashboardTitle">
            <div class="profile-dashboard-header">
                <div>
                    <h2 id="profileDashboardTitle">👤 Hồ sơ & tiến độ</h2>
                    <div id="activeProfileCaption" class="profile-caption"></div>
                </div>
                <button id="profileDashboardClose" class="profile-close-btn" type="button" aria-label="Đóng">×</button>
            </div>

            <section class="profile-manager-section">
                <div class="profile-manager-grid">
                    <label>Hồ sơ<select id="profileSelect" class="profile-control"></select></label>
                    <label>Tên bé<input id="profileNameInput" class="profile-control" type="text" maxlength="40" /></label>
                </div>
                <div class="profile-action-row">
                    <button id="profileAddBtn" type="button">＋ Thêm bé</button>
                    <button id="profileRenameBtn" type="button">✏ Đổi tên</button>
                    <button id="profileDeleteBtn" type="button" class="danger-soft">🗑 Xóa hồ sơ</button>
                </div>
            </section>

            <section>
                <h3>📊 Tổng quan</h3>
                <div id="profileSummaryGrid" class="profile-summary-grid"></div>
            </section>

            <div class="profile-dashboard-columns">
                <section>
                    <h3>🔁 Hay sai nhất</h3>
                    <div id="profileWeakList" class="profile-weak-list"></div>
                </section>
                <section>
                    <h3>📚 Theo chủ đề</h3>
                    <div id="profileTopicStats" class="profile-topic-stats"></div>
                </section>
            </div>

            <section class="profile-backup-section">
                <h3>💾 Dữ liệu</h3>
                <div class="profile-action-row">
                    <button id="profileExportBtn" type="button">⬇ Xuất backup</button>
                    <button id="profileImportBtn" type="button">⬆ Nhập backup</button>
                    <button id="profileResetBtn" type="button" class="danger-soft">↺ Reset tiến độ bé này</button>
                </div>
                <input id="profileImportFile" type="file" accept="application/json,.json" hidden />
            </section>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", event => {
        if(event.target === overlay) closeProfileDashboard();
    });
    overlay.querySelector(".profile-dashboard-card").addEventListener("click", event => event.stopPropagation());
    document.getElementById("profileDashboardClose").addEventListener("click", closeProfileDashboard);
    document.getElementById("profileSelect").addEventListener("change", event => switchProfile(event.target.value));
    document.getElementById("profileAddBtn").addEventListener("click", addProfileFromDashboard);
    document.getElementById("profileRenameBtn").addEventListener("click", renameActiveProfileFromDashboard);
    document.getElementById("profileDeleteBtn").addEventListener("click", deleteActiveProfileFromDashboard);
    document.getElementById("profileExportBtn").addEventListener("click", exportProfilesBackup);
    document.getElementById("profileImportBtn").addEventListener("click", () => document.getElementById("profileImportFile").click());
    document.getElementById("profileImportFile").addEventListener("change", importProfilesBackup);
    document.getElementById("profileResetBtn").addEventListener("click", resetActiveProfileProgress);

    document.addEventListener("keydown", event => {
        if(event.key === "Escape" && !overlay.classList.contains("hidden")) closeProfileDashboard();
    });

    return overlay;
}

function openProfileDashboard(){
    syncRuntimeIntoProfile();
    renderProfileDashboard();
    const overlay = ensureProfileDashboard();
    overlay.classList.remove("hidden");
    document.body.classList.add("profile-dashboard-open");
}

function closeProfileDashboard(){
    const overlay = document.getElementById("profileDashboardOverlay");
    if(overlay) overlay.classList.add("hidden");
    document.body.classList.remove("profile-dashboard-open");
}

function createSummaryCard(label, value){
    const card = document.createElement("div");
    card.className = "profile-summary-card";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    card.append(strong, span);
    return card;
}

function renderProfileDashboard(){
    const overlay = document.getElementById("profileDashboardOverlay");
    if(!overlay) return;

    const profile = getActiveProfile();
    if(!profile) return;

    const profileSelect = document.getElementById("profileSelect");
    const profileNameInput = document.getElementById("profileNameInput");
    const caption = document.getElementById("activeProfileCaption");

    profileSelect.innerHTML = "";
    profiles.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        option.selected = item.id === activeProfileId;
        profileSelect.appendChild(option);
    });
    profileNameInput.value = profile.name;
    caption.textContent = `Đang xem: ${profile.name}`;

    const summary = getProfileStatsSummary();
    const todaySeconds = Number(activeProfileData?.study?.days?.[getLocalDayKey()] || 0);
    const totalSeconds = Number(activeProfileData?.study?.totalSeconds || 0);
    const summaryGrid = document.getElementById("profileSummaryGrid");
    summaryGrid.innerHTML = "";
    [
        ["Lượt luyện", String(summary.attempts)],
        ["Đúng", String(summary.correct)],
        ["Sai", String(summary.wrong)],
        ["Chính xác", summary.attempts ? `${Math.round(summary.accuracy * 100)}%` : "—"],
        ["Học hôm nay", formatProfileDuration(todaySeconds)],
        ["Tổng thời gian", formatProfileDuration(totalSeconds)],
        ["Cần ôn", String(summary.weakCount)]
    ].forEach(([label, value]) => summaryGrid.appendChild(createSummaryCard(label, value)));

    const weakList = document.getElementById("profileWeakList");
    weakList.innerHTML = "";
    const weak = getTopWeakPrompts(10);
    if(!weak.length){
        const empty = document.createElement("div");
        empty.className = "profile-empty";
        empty.textContent = "Chưa có từ/câu cần ôn.";
        weakList.appendChild(empty);
    }else{
        weak.forEach((item, idx) => {
            const row = document.createElement("div");
            row.className = "profile-weak-row";
            const name = document.createElement("span");
            name.textContent = `${idx + 1}. ${item.prompt}`;
            const score = document.createElement("small");
            score.textContent = `sai ${item.wrong} · đúng ${item.correct}`;
            row.append(name, score);
            weakList.appendChild(row);
        });
    }

    const topicStats = document.getElementById("profileTopicStats");
    topicStats.innerHTML = "";
    getTopicStatsRows().forEach(item => {
        const row = document.createElement("div");
        row.className = "profile-topic-row";
        const label = document.createElement("span");
        label.textContent = `${item.icon} ${item.label}`;
        const value = document.createElement("span");
        value.textContent = item.attempts ? `${item.attempts} lượt · ${Math.round(item.accuracy * 100)}%` : "chưa học";
        row.append(label, value);
        topicStats.appendChild(row);
    });

    document.getElementById("profileDeleteBtn").disabled = profiles.length <= 1;
    updateProfileHud();
}

function getNextProfileName(){
    let index = profiles.length + 1;
    let candidate = `Bé ${index}`;
    const names = new Set(profiles.map(profile => profile.name.toLocaleLowerCase("vi-VN")));
    while(names.has(candidate.toLocaleLowerCase("vi-VN"))){
        index += 1;
        candidate = `Bé ${index}`;
    }
    return candidate;
}

function addProfileFromDashboard(){
    syncRuntimeIntoProfile();
    const profile = { id: createProfileId(), name: getNextProfileName(), createdAt: Date.now() };
    profiles.push(profile);
    saveProfileData(profile.id, createDefaultProfileData(false));
    saveProfilesRegistry();
    switchProfile(profile.id);
    renderProfileDashboard();
}

function renameActiveProfileFromDashboard(){
    const inputEl = document.getElementById("profileNameInput");
    const nextName = String(inputEl?.value || "").trim().slice(0, 40);
    if(!nextName){
        if(typeof showCenterToast === "function") showCenterToast("Tên bé không được để trống", "incorrect");
        return;
    }

    const profile = getActiveProfile();
    if(!profile) return;
    profile.name = nextName;
    saveProfilesRegistry();
    renderProfileDashboard();
}

function deleteActiveProfileFromDashboard(){
    if(profiles.length <= 1){
        if(typeof showCenterToast === "function") showCenterToast("Cần giữ ít nhất 1 hồ sơ", "incorrect");
        return;
    }

    const profile = getActiveProfile();
    if(!profile || !window.confirm(`Xóa hồ sơ “${profile.name}” và toàn bộ tiến độ của bé này?`)) return;

    syncRuntimeIntoProfile();
    try { localStorage.removeItem(profileDataKey(profile.id)); } catch (error) {}
    profiles = profiles.filter(item => item.id !== profile.id);
    const next = profiles[0];
    activeProfileId = next.id;
    activeProfileData = loadProfileData(next.id) || createDefaultProfileData(false);
    saveProfilesRegistry();
    stopTransientLearningModes();
    applyProfileToRuntime(true);
    renderProfileDashboard();
}

function resetActiveProfileProgress(){
    const profile = getActiveProfile();
    if(!profile || !window.confirm(`Reset toàn bộ thống kê và thời gian học của “${profile.name}”?`)) return;

    activeProfileData.promptStats = {};
    activeProfileData.study = { totalSeconds: 0, days: {} };
    promptStats = activeProfileData.promptStats;
    studySeconds = 0;
    studyTime.textContent = formatStudyDuration(0);
    saveProfileData(activeProfileId, activeProfileData);
    if(typeof updateSmartReviewBar === "function") updateSmartReviewBar();
    if(currentMode === "easy") rebuildTopicLearningRound();
    renderProfileDashboard();
}

function exportProfilesBackup(){
    syncRuntimeIntoProfile();
    const dataMap = {};
    profiles.forEach(profile => {
        dataMap[profile.id] = loadProfileData(profile.id) || createDefaultProfileData(false);
    });

    const payload = {
        app: "go-chu-ver2",
        version: 1,
        exportedAt: new Date().toISOString(),
        activeProfileId,
        profiles,
        data: dataMap
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `go-chu-ver2-backup-${getLocalDayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function validateImportedBackup(payload){
    return Boolean(
        payload &&
        payload.app === "go-chu-ver2" &&
        Number(payload.version) === 1 &&
        Array.isArray(payload.profiles) &&
        payload.profiles.length > 0 &&
        payload.profiles.length <= 30 &&
        payload.data && typeof payload.data === "object"
    );
}

async function importProfilesBackup(event){
    const inputEl = event.target;
    const file = inputEl.files?.[0];
    inputEl.value = "";
    if(!file) return;

    try {
        const payload = JSON.parse(await file.text());
        if(!validateImportedBackup(payload)) throw new Error("invalid backup");
        if(!window.confirm("Nhập backup sẽ thay thế toàn bộ hồ sơ hiện có trên máy này. Tiếp tục?")) return;

        syncRuntimeIntoProfile();
        profiles.forEach(profile => {
            try { localStorage.removeItem(profileDataKey(profile.id)); } catch (error) {}
        });

        const usedIds = new Set();
        const newProfiles = [];
        const oldToNewId = {};

        payload.profiles.forEach((item, index) => {
            const oldId = String(item?.id || "");
            let id = /^[a-zA-Z0-9_-]{3,80}$/.test(oldId) && !usedIds.has(oldId) ? oldId : createProfileId();
            while(usedIds.has(id)) id = createProfileId();
            usedIds.add(id);
            oldToNewId[oldId] = id;
            newProfiles.push({
                id,
                name: String(item?.name || `Bé ${index + 1}`).trim().slice(0, 40) || `Bé ${index + 1}`,
                createdAt: Number(item?.createdAt || Date.now())
            });
            saveProfileData(id, normalizeProfileData(payload.data[oldId] || {}));
        });

        profiles = newProfiles;
        activeProfileId = oldToNewId[String(payload.activeProfileId || "")] || profiles[0].id;
        activeProfileData = loadProfileData(activeProfileId) || createDefaultProfileData(false);
        saveProfilesRegistry();
        stopTransientLearningModes();
        applyProfileToRuntime(true);
        renderProfileDashboard();
        if(typeof showCenterToast === "function") showCenterToast("✅ Đã nhập backup", "correct");
    } catch (error) {
        if(typeof showCenterToast === "function") showCenterToast("File backup không hợp lệ", "incorrect");
    }
}

initializeProfileSystem();
ensureProfileHud();
updateProfileHud();
renderProfileDashboard();

document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "hidden") syncRuntimeIntoProfile();
});
window.addEventListener("beforeunload", syncRuntimeIntoProfile);
