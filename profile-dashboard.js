/* ===== PHASE 9 ĐỢT 11H - PROFILE DASHBOARD / MANAGEMENT POST-STARTUP =====
 * profile-stats.js critical chỉ giữ runtime/data/preferences/study timer.
 * File này chứa toàn bộ HUD/dashboard/profile management/backup UI.
 */

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
        if(typeof memoryRemaining !== "undefined") memoryRemaining = 0;
        normalPanel.classList.remove("memory-mode-active");
        if(typeof setMemoryPromptHidden === "function") setMemoryPromptHidden(false);
        input.disabled = false;
        const nextBtn = document.getElementById("nextBtn");
        if(nextBtn) nextBtn.disabled = false;
    }
}

function switchProfile(profileId){
    if(profileId === activeProfileId || !profiles.some(profile => profile.id === profileId)) return;

    syncRuntimeIntoProfile();
    stopTransientLearningModes();

    activeProfileId = profileId;
    activeProfileData = loadProfileData(profileId) || createDefaultProfileData(false);
    saveProfilesRegistry();
    applyProfileToRuntime(true, true);

    if(typeof showCenterToast === "function"){
        const profile = getActiveProfile();
        showCenterToast(`👤 ${profile ? profile.name : "Đã đổi hồ sơ"}`, "correct");
    }
}

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
            return { ...topic, attempts, correct, wrong, accuracy: attempts ? correct / attempts : 0 };
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
    const overlay = ensureProfileDashboard();
    renderProfileDashboard();
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
    applyProfileToRuntime(true, true);
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
        applyProfileToRuntime(true, true);
        renderProfileDashboard();
        if(typeof showCenterToast === "function") showCenterToast("✅ Đã nhập backup", "correct");
    } catch (error) {
        if(typeof showCenterToast === "function") showCenterToast("File backup không hợp lệ", "incorrect");
    }
}

window.GO_CHU_PROFILE_DASHBOARD_READY = true;
ensureProfileHud();
updateProfileHud();
