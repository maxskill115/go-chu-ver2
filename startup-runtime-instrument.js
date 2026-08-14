/* ===== PHASE 9 ĐỢT 11 - RUNTIME STARTUP MEASURE =====
 * Nạp sau các wrapper học chính và trước script.js để đo đúng startup setMode("easy").
 */
(function(){
    if(typeof goChuStartupMark !== "function" || typeof goChuStartupMeasure !== "function") return;

    const measuredSetMode = setMode;
    setMode = function(mode){
        const startedAt = performance.now();
        if(mode === "easy") goChuStartupMark("setModeEasy:start");
        const result = measuredSetMode(mode);
        goChuStartupMeasure(`setMode:${mode}`, startedAt);

        if(mode === "easy"){
            goChuStartupMark("setModeEasy:end");
            requestAnimationFrame(() => {
                goChuStartupMark("easy:firstPaint");
                requestAnimationFrame(() => {
                    const usable = Boolean(input && !input.disabled && currentPrompt);
                    goChuStartupMark("easy:firstInputReady", usable ? currentPrompt : "not-ready");
                });
            });
        }
        return result;
    };

    const measuredShowText = showText;
    showText = function(){
        const startedAt = performance.now();
        const result = measuredShowText();
        goChuStartupMeasure(`showText:${currentMode}`, startedAt);
        return result;
    };

    goChuStartupMark("runtimeWrappersReady");
})();
