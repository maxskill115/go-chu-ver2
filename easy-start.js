/* ===== PHASE 9 ĐỢT 11G - EASY STARTUP CỰC NHẸ =====
 * script.js cũ chứa gần như toàn Free mode + Settings + event handlers nhưng
 * chỉ dùng 2 dòng cuối để khởi động Easy. File này tách 2 dòng đó ra critical path.
 */
(function(){
    const startedAt = performance.now();

    startStudyTimer();
    setMode("easy");

    window.GO_CHU_EASY_CORE_STARTED = true;

    /*
     * script.js được post-load sau first paint nhưng vẫn còn 2 dòng legacy
     * startStudyTimer(); setMode("easy"); ở cuối để giữ source baseline ít động chạm.
     * startStudyTimer đã idempotent. setMode cần chặn đúng khi script.js đang được
     * post-loader execute, không chặn click Easy của người dùng.
     */
    const baseSetModeAfterEasyStart = setMode;
    setMode = function(mode){
        if(
            mode === "easy" &&
            currentMode === "easy" &&
            window.GO_CHU_EXECUTING_POST_SCRIPT === "script.js"
        ){
            window.GO_CHU_LEGACY_SCRIPT_EASY_SUPPRESSED = true;
            return;
        }
        return baseSetModeAfterEasyStart(mode);
    };

    if(typeof goChuStartupMeasure === "function"){
        goChuStartupMeasure("easy:bootstrap", startedAt);
    }
    if(typeof goChuStartupMark === "function"){
        goChuStartupMark("easy:coreStarted");
    }

    window.getGoChuEasyBootstrapHealth = function(){
        return {
            coreStarted: Boolean(window.GO_CHU_EASY_CORE_STARTED),
            legacyScriptEasySuppressed: Boolean(window.GO_CHU_LEGACY_SCRIPT_EASY_SUPPRESSED),
            currentMode
        };
    };
})();
