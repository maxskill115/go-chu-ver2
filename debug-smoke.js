/* ===== VER2 PHASE 9 - DEBUG SMOKE TESTS =====
 * Không tự chạy trong sử dụng bình thường.
 * Chạy bằng:
 *   - URL thêm ?debug=1
 *   - hoặc Console: runGoChuSmokeTests()
 */
function runGoChuSmokeTests(){
    const results = [];

    function test(name, condition, detail = ""){
        results.push({ name, pass: Boolean(condition), detail });
    }

    try {
        test("Topic: con mèo → Động vật", promptMatchesTopic("con mèo", "animals"));
        test("Topic: mặt trời → Thiên nhiên", promptMatchesTopic("mặt trời", "nature"));
        test("Topic: mặt trời không → Cơ thể", !promptMatchesTopic("mặt trời", "body"));
        test("Topic: màu cam → Màu sắc", promptMatchesTopic("màu cam", "colors"));
        test("Topic: màu cam không → Đồ ăn", !promptMatchesTopic("màu cam", "food"));
        test("Topic: quả cam → Đồ ăn", promptMatchesTopic("quả cam màu vàng", "food"));
    } catch (error) {
        test("Topic mapping", false, error.message);
    }

    try {
        test("Telex bé", vietnameseWordToInputSequence("bé", "telex") === "bes", vietnameseWordToInputSequence("bé", "telex"));
        test("Telex mèo", vietnameseWordToInputSequence("mèo", "telex") === "meof", vietnameseWordToInputSequence("mèo", "telex"));
        test("Telex tiếng", vietnameseWordToInputSequence("tiếng", "telex") === "tieengs", vietnameseWordToInputSequence("tiếng", "telex"));
        test("VNI bé", vietnameseWordToInputSequence("bé", "vni") === "be1", vietnameseWordToInputSequence("bé", "vni"));
        test("VNI chữ", vietnameseWordToInputSequence("chữ", "vni") === "chu74", vietnameseWordToInputSequence("chữ", "vni"));
    } catch (error) {
        test("Telex/VNI mapping", false, error.message);
    }

    try {
        const accentOnly = findAccentOnlyDifferences("con mèo", "con meo");
        const normalWrong = findAccentOnlyDifferences("con mèo", "con mep");
        test("Accent-only: meo → mèo", accentOnly.length === 1 && accentOnly[0].expected === "mèo");
        test("Không nhầm lỗi chữ thành lỗi dấu", normalWrong.length === 0);
        test("Accent-only: di → đi", findAccentOnlyDifferences("đi học", "di học").length === 1);
    } catch (error) {
        test("Accent detection", false, error.message);
    }

    try {
        const level = getEffectiveLearningLevel();
        test("Auto/locked level nằm 1-4", [1, 2, 3, 4].includes(Number(level)), String(level));
        test("Topic hiện tại có pool", getTopicPool(selectedTopicId).length > 0, `${selectedTopicId}: ${getTopicPool(selectedTopicId).length}`);
    } catch (error) {
        test("Level/topic pool", false, error.message);
    }

    try {
        const profile = typeof getActiveProfile === "function" ? getActiveProfile() : null;
        test("Có hồ sơ active", Boolean(profile && profile.id), profile?.name || "");
        test("Profile data có promptStats", Boolean(activeProfileData && activeProfileData.promptStats && typeof activeProfileData.promptStats === "object"));
        test("Profile data có modeStats tách riêng", Boolean(
            activeProfileData &&
            activeProfileData.modeStats &&
            typeof activeProfileData.modeStats.hard === "object" &&
            typeof activeProfileData.modeStats.free === "object"
        ));
    } catch (error) {
        test("Profile system", false, error.message);
    }

    try {
        const round = buildSmartEasyRound("");
        const hasAdjacentDuplicate = round.some((prompt, index) => index > 0 && prompt === round[index - 1]);
        test("Smart round không lặp liền nhau", !hasAdjacentDuplicate, `${round.length} prompt`);
    } catch (error) {
        test("Smart round", false, error.message);
    }

    try {
        test("Runtime: showText tồn tại", typeof showText === "function");
        test("Runtime: setMode tồn tại", typeof setMode === "function");
        test("Runtime: checkNext tồn tại", typeof checkNext === "function");
        test("Runtime: nextPromptForCurrentMode tồn tại", typeof nextPromptForCurrentMode === "function");
        test("Runtime: submitFreeAnswer tồn tại", typeof submitFreeAnswer === "function");
        test("Runtime: setListenMode tồn tại", typeof setListenMode === "function");
        test("Runtime: setMemoryMode tồn tại", typeof setMemoryMode === "function");
        test(
            "Invariant: Listen và Memory không cùng active",
            !(Boolean(listenModeActive) && Boolean(memoryModeActive)),
            `listen=${Boolean(listenModeActive)}, memory=${Boolean(memoryModeActive)}`
        );
    } catch (error) {
        test("Runtime wrapper chain", false, error.message);
    }

    try {
        const hardSummary = getStandaloneModeSummary("hard");
        const freeSummary = getStandaloneModeSummary("free");
        test("Hard stats schema hợp lệ", hardSummary.attempts === hardSummary.correct + hardSummary.wrong);
        test("Free stats schema hợp lệ", freeSummary.attempts === freeSummary.correct + freeSummary.wrong);
        test(
            "Hard/Free không nằm trong promptStats adaptive",
            !Object.prototype.hasOwnProperty.call(promptStats || {}, "__hard__") &&
            !Object.prototype.hasOwnProperty.call(promptStats || {}, "__free__")
        );
    } catch (error) {
        test("Standalone mode stats", false, error.message);
    }

    try {
        const settingsButton = document.getElementById("settingsToggleBtn");
        const gameButton = document.getElementById("game-menu");
        const profileButton = document.getElementById("profileDashboardBtn");
        const resultEl = document.getElementById("result");
        const gameCard = document.querySelector(".game-selector-card");
        const profileCard = document.querySelector(".profile-dashboard-card");

        test("A11y: Settings có aria-controls", settingsButton?.getAttribute("aria-controls") === "settingsPanel");
        test("A11y: Game menu có aria-controls", gameButton?.getAttribute("aria-controls") === "game-selector-overlay");
        test("A11y: Profile có aria-controls", profileButton?.getAttribute("aria-controls") === "profileDashboardOverlay");
        test("A11y: result có aria-live", resultEl?.getAttribute("aria-live") === "polite");
        test("A11y: game selector là dialog", gameCard?.getAttribute("role") === "dialog" && gameCard?.getAttribute("aria-modal") === "true");
        test("A11y: profile dashboard là dialog", profileCard?.getAttribute("role") === "dialog" && profileCard?.getAttribute("aria-modal") === "true");
    } catch (error) {
        test("Accessibility semantics", false, error.message);
    }

    try {
        test("Storage health API tồn tại", typeof getGoChuStorageHealth === "function" && typeof printGoChuStorageHealth === "function");
        const report = getGoChuStorageHealth();
        test("Storage report hợp lệ", Number.isFinite(report.totalBytes) && report.totalBytes >= 0 && Array.isArray(report.largestKeys), `${report.totalKB} KB`);
        test("Storage report thấy profile", report.profileCount >= 1 && report.profileKeyCount >= 1, `${report.profileCount} profile / ${report.profileKeyCount} key`);

        const skipBefore = Number(goChuStorageMetrics?.profileWriteSkips || 0);
        saveProfileData(activeProfileId, activeProfileData);
        saveProfileData(activeProfileId, activeProfileData);
        const skipAfter = Number(goChuStorageMetrics?.profileWriteSkips || 0);
        test("No-op profile save được skip", skipAfter > skipBefore, `${skipBefore} → ${skipAfter}`);

        const registrySkipBefore = Number(goChuStorageMetrics?.registryWriteSkips || 0);
        saveProfilesRegistry();
        saveProfilesRegistry();
        const registrySkipAfter = Number(goChuStorageMetrics?.registryWriteSkips || 0);
        test("No-op registry save được skip", registrySkipAfter > registrySkipBefore, `${registrySkipBefore} → ${registrySkipAfter}`);
    } catch (error) {
        test("Storage health/dedupe", false, error.message);
    }

    const passed = results.filter(item => item.pass).length;
    const failed = results.length - passed;

    console.group(`🧪 go-chu-ver2 smoke tests: ${passed}/${results.length} passed`);
    console.table(results.map(item => ({
        status: item.pass ? "PASS" : "FAIL",
        test: item.name,
        detail: item.detail
    })));
    if(failed){
        console.error(`Có ${failed} smoke test thất bại.`);
    }else{
        console.info("Tất cả smoke test đều đạt.");
    }
    console.groupEnd();

    return { passed, failed, total: results.length, results };
}

window.runGoChuSmokeTests = runGoChuSmokeTests;

try {
    const params = new URLSearchParams(window.location.search);
    if(params.get("debug") === "1"){
        setTimeout(runGoChuSmokeTests, 0);
    }
} catch (error) {}
