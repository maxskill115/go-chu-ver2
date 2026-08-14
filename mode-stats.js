/* ===== VER2 PHASE 9 - THỐNG KÊ RIÊNG NÂNG CAO / TỰ DO =====
 * Module này được nạp SAU script.js để có thể bọc cả checkNext() và submitFreeAnswer().
 * Hard/Free tuyệt đối không ghi vào promptStats và không tham gia weakness/adaptive Easy.
 */
function createEmptyModeStats(){
    return {
        hard: { correct: 0, wrong: 0, lastCorrectAt: 0, lastWrongAt: 0 },
        free: { correct: 0, wrong: 0, lastCorrectAt: 0, lastWrongAt: 0 }
    };
}

function normalizeModeStats(source){
    const input = source && typeof source === "object" ? source : {};
    const output = createEmptyModeStats();

    ["hard", "free"].forEach(mode => {
        const item = input[mode] && typeof input[mode] === "object" ? input[mode] : {};
        output[mode] = {
            correct: Math.max(0, Number(item.correct || 0)),
            wrong: Math.max(0, Number(item.wrong || 0)),
            lastCorrectAt: Math.max(0, Number(item.lastCorrectAt || 0)),
            lastWrongAt: Math.max(0, Number(item.lastWrongAt || 0))
        };
    });

    return output;
}

const baseNormalizeProfileDataForModeStats = normalizeProfileData;
normalizeProfileData = function(data){
    const normalized = baseNormalizeProfileDataForModeStats(data);
    normalized.modeStats = normalizeModeStats(data?.modeStats);
    return normalized;
};

const baseCreateDefaultProfileDataForModeStats = createDefaultProfileData;
createDefaultProfileData = function(useLegacy = false){
    const data = baseCreateDefaultProfileDataForModeStats(useLegacy);
    data.modeStats = createEmptyModeStats();
    return data;
};

function readStoredModeStats(profileId){
    if(!profileId) return createEmptyModeStats();
    try {
        const raw = localStorage.getItem(profileDataKey(profileId));
        const parsed = safeJsonParse(raw, {});
        return normalizeModeStats(parsed?.modeStats);
    } catch (error) {
        return createEmptyModeStats();
    }
}

function hydrateActiveModeStatsFromStorage(){
    if(!activeProfileData || !activeProfileId) return createEmptyModeStats();
    activeProfileData.modeStats = readStoredModeStats(activeProfileId);
    return activeProfileData.modeStats;
}

function ensureActiveModeStats(){
    if(!activeProfileData) return createEmptyModeStats();
    activeProfileData.modeStats = normalizeModeStats(activeProfileData.modeStats);
    return activeProfileData.modeStats;
}

function recordStandaloneModeResult(mode, isCorrect){
    if(!["hard", "free"].includes(mode) || !activeProfileData || !activeProfileId) return;

    const stats = ensureActiveModeStats();
    const entry = stats[mode];
    const now = Date.now();

    if(isCorrect){
        entry.correct += 1;
        entry.lastCorrectAt = now;
    }else{
        entry.wrong += 1;
        entry.lastWrongAt = now;
    }

    saveProfileData(activeProfileId, activeProfileData);

    const overlay = document.getElementById("profileDashboardOverlay");
    if(overlay && !overlay.classList.contains("hidden")){
        renderProfileDashboard();
    }
}

function getStandaloneModeSummary(mode){
    const stats = ensureActiveModeStats();
    const entry = stats[mode] || createEmptyModeStats()[mode];
    const correct = Math.max(0, Number(entry.correct || 0));
    const wrong = Math.max(0, Number(entry.wrong || 0));
    const attempts = correct + wrong;
    return {
        correct,
        wrong,
        attempts,
        accuracy: attempts ? correct / attempts : 0
    };
}

let hardWrongRecordedForPrompt = false;
let hardCorrectRecordedForPrompt = false;
let freeWrongRecordedForTarget = false;
let freeCorrectRecordedForTarget = false;

function resetHardModeAttemptGuard(){
    hardWrongRecordedForPrompt = false;
    hardCorrectRecordedForPrompt = false;
}

function resetFreeModeAttemptGuard(){
    freeWrongRecordedForTarget = false;
    freeCorrectRecordedForTarget = false;
}

const baseShowTextForModeStats = showText;
showText = function(){
    resetHardModeAttemptGuard();
    return baseShowTextForModeStats();
};

const baseSetFreeTargetForModeStats = setFreeTarget;
setFreeTarget = function(text){
    resetFreeModeAttemptGuard();
    return baseSetFreeTargetForModeStats(text);
};

const baseCheckNextForModeStats = checkNext;
checkNext = function(){
    if(currentMode !== "hard"){
        return baseCheckNextForModeStats();
    }

    const isCorrect = normalizeForCompare(input.value) === normalizeForCompare(currentPrompt);
    const resultValue = baseCheckNextForModeStats();

    if(isCorrect){
        if(!hardCorrectRecordedForPrompt){
            hardCorrectRecordedForPrompt = true;
            recordStandaloneModeResult("hard", true);
        }
    }else if(!hardWrongRecordedForPrompt){
        hardWrongRecordedForPrompt = true;
        recordStandaloneModeResult("hard", false);
    }

    return resultValue;
};

const baseSubmitFreeAnswerForModeStats = submitFreeAnswer;
submitFreeAnswer = function(){
    if(!freeTarget) return baseSubmitFreeAnswerForModeStats();

    const isCorrect = normalizeForCompare(freeInput.value) === normalizeForCompare(freeTarget);
    const resultValue = baseSubmitFreeAnswerForModeStats();

    if(isCorrect){
        if(!freeCorrectRecordedForTarget){
            freeCorrectRecordedForTarget = true;
            recordStandaloneModeResult("free", true);
        }
    }else if(!freeWrongRecordedForTarget){
        freeWrongRecordedForTarget = true;
        recordStandaloneModeResult("free", false);
    }

    return resultValue;
};

/*
 * Phase 9 đợt 11:
 * hydrate modeStats TRƯỚC base apply để dashboard (nếu đang mở) render đúng profile mới.
 */
const baseApplyProfileToRuntimeForModeStats = applyProfileToRuntime;
applyProfileToRuntime = function(rebuild = true, refreshUi = true){
    hydrateActiveModeStatsFromStorage();
    const resultValue = baseApplyProfileToRuntimeForModeStats(rebuild, refreshUi);
    ensureActiveModeStats();
    resetHardModeAttemptGuard();
    resetFreeModeAttemptGuard();
    return resultValue;
};

function ensureModeStatsDashboardSection(){
    const dashboard = document.querySelector(".profile-dashboard-card");
    const backupSection = dashboard?.querySelector(".profile-backup-section");
    if(!dashboard || !backupSection) return null;

    let section = document.getElementById("profileModeStatsSection");
    if(section) return section;

    section = document.createElement("section");
    section.id = "profileModeStatsSection";
    section.innerHTML = `
        <h3>🎯 Theo chế độ</h3>
        <div id="profileModeStats" class="profile-topic-stats"></div>
        <div class="profile-caption">Nâng cao/Tự do chỉ thống kê riêng, không ảnh hưởng Ôn lại hay Auto level của Đơn giản.</div>
    `;
    dashboard.insertBefore(section, backupSection);
    return section;
}

function createModeStatsRow(label, summary){
    const row = document.createElement("div");
    row.className = "profile-topic-row";

    const name = document.createElement("span");
    name.textContent = label;

    const value = document.createElement("span");
    value.textContent = summary.attempts
        ? `${summary.attempts} lượt · ${Math.round(summary.accuracy * 100)}% · đúng ${summary.correct} / sai ${summary.wrong}`
        : "chưa học";

    row.append(name, value);
    return row;
}

function replaceProfileSummaryValue(label, value){
    const grid = document.getElementById("profileSummaryGrid");
    if(!grid) return;

    const card = Array.from(grid.querySelectorAll(".profile-summary-card"))
        .find(item => item.querySelector("span")?.textContent === label);
    const strong = card?.querySelector("strong");
    if(strong) strong.textContent = value;
}

function renderModeStatsDashboard(){
    ensureModeStatsDashboardSection();
    const wrap = document.getElementById("profileModeStats");
    if(!wrap) return;

    const easy = getProfileStatsSummary();
    const hard = getStandaloneModeSummary("hard");
    const free = getStandaloneModeSummary("free");

    wrap.innerHTML = "";
    wrap.appendChild(createModeStatsRow("⌨️ Đơn giản", easy));
    wrap.appendChild(createModeStatsRow("🧩 Nâng cao", hard));
    wrap.appendChild(createModeStatsRow("📝 Tự do", free));

    const totalCorrect = easy.correct + hard.correct + free.correct;
    const totalWrong = easy.wrong + hard.wrong + free.wrong;
    const totalAttempts = totalCorrect + totalWrong;

    replaceProfileSummaryValue("Lượt luyện", String(totalAttempts));
    replaceProfileSummaryValue("Đúng", String(totalCorrect));
    replaceProfileSummaryValue("Sai", String(totalWrong));
    replaceProfileSummaryValue("Chính xác", totalAttempts ? `${Math.round(totalCorrect / totalAttempts * 100)}%` : "—");
}

const baseRenderProfileDashboardForModeStats = renderProfileDashboard;
renderProfileDashboard = function(){
    baseRenderProfileDashboardForModeStats();
    renderModeStatsDashboard();
};

/* Startup chỉ hydrate in-memory; không save/render dashboard eager. */
hydrateActiveModeStatsFromStorage();
