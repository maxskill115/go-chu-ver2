/* ===== PHASE 9 ĐỢT 11D - EASY ENTRY TRANSITION GATE =====
 * Nạp sau startup-runtime-instrument.js và trước script.js.
 *
 * Điều tra 11D:
 * - showText() trong setMode("easy") đã gọi các wrapper UI.
 * - khi chuỗi setMode unwind, nhiều module lại update lần hai.
 * - base showText() focus input ngay giữa lúc layout Easy đang đổi; trên mobile
 *   việc này có thể bật keyboard + resize viewport trước khi render hoàn tất.
 *
 * Gate này giữ core prompt/input đồng bộ, còn UI phụ được coalesce và flush
 * sau first paint. Không thay nội dung học / correct-wrong / adaptive logic.
 */
(function(){
    let transitionActive = false;
    let flushFrame1 = 0;
    let flushFrame2 = 0;
    let desktopFocusFrame1 = 0;
    let desktopFocusFrame2 = 0;

    const pending = {
        smart: false,
        topic: false,
        visual: null,
        listen: false,
        memory: false,
        progress: false,
        guide: false
    };

    const metrics = {
        easyEntries: 0,
        bootFramesCancelled: 0,
        deferredCalls: 0,
        auxFlushes: 0,
        lastSyncEntryMs: 0,
        lastAuxFlushMs: 0,
        lastEntryAt: 0,
        mobileAutofocusSkipped: 0,
        desktopAutofocusDeferred: 0
    };

    function isCoarsePointer(){
        try {
            return Boolean(
                window.matchMedia?.("(pointer: coarse)")?.matches ||
                Number(navigator.maxTouchPoints || 0) > 0
            );
        } catch (error) {
            return false;
        }
    }

    function cancelBootUiFrames(){
        try {
            if(typeof goChuSmartReviewUiFrame !== "undefined" && goChuSmartReviewUiFrame){
                cancelAnimationFrame(goChuSmartReviewUiFrame);
                goChuSmartReviewUiFrame = 0;
                pending.smart = true;
                metrics.bootFramesCancelled += 1;
            }
        } catch (error) {}

        try {
            if(typeof goChuTopicLevelUiFrame !== "undefined" && goChuTopicLevelUiFrame){
                cancelAnimationFrame(goChuTopicLevelUiFrame);
                goChuTopicLevelUiFrame = 0;
                pending.topic = true;
                metrics.bootFramesCancelled += 1;
            }
        } catch (error) {}

        try {
            if(typeof goChuVisualFrame !== "undefined" && goChuVisualFrame){
                cancelAnimationFrame(goChuVisualFrame);
                goChuVisualFrame = 0;
                pending.visual = currentPrompt || "";
                metrics.bootFramesCancelled += 1;
            }
        } catch (error) {}
    }

    const original = {
        smart: typeof scheduleSmartReviewBarUpdate === "function" ? scheduleSmartReviewBarUpdate : null,
        topic: typeof scheduleTopicLevelBarUpdate === "function" ? scheduleTopicLevelBarUpdate : null,
        visual: typeof schedulePromptVisual === "function" ? schedulePromptVisual : null,
        listen: typeof updateListenModeBar === "function" ? updateListenModeBar : null,
        memory: typeof updateMemoryModeBar === "function" ? updateMemoryModeBar : null,
        progress: typeof renderPromptWordProgress === "function" ? renderPromptWordProgress : null,
        guide: typeof updateVietnameseInputGuide === "function" ? updateVietnameseInputGuide : null
    };

    function scheduleAuxFlush(){
        if(flushFrame1 || flushFrame2) return;

        /* Double RAF: frame 1 cho core prompt/input được paint trước. */
        flushFrame1 = requestAnimationFrame(() => {
            flushFrame1 = 0;
            flushFrame2 = requestAnimationFrame(() => {
                flushFrame2 = 0;
                const startedAt = performance.now();

                const jobs = {
                    smart: pending.smart,
                    topic: pending.topic,
                    visual: pending.visual,
                    listen: pending.listen,
                    memory: pending.memory,
                    progress: pending.progress,
                    guide: pending.guide
                };

                pending.smart = false;
                pending.topic = false;
                pending.visual = null;
                pending.listen = false;
                pending.memory = false;
                pending.progress = false;
                pending.guide = false;

                /* Progress trước để chữ có semantic spans; network visual cuối cùng. */
                if(jobs.progress && original.progress) original.progress();
                if(jobs.guide && original.guide) original.guide();
                if(jobs.listen && original.listen) original.listen();
                if(jobs.memory && original.memory) original.memory();
                if(jobs.smart && original.smart) original.smart();
                if(jobs.topic && original.topic) original.topic();
                if(jobs.visual !== null && original.visual) original.visual(jobs.visual || currentPrompt);

                metrics.auxFlushes += 1;
                metrics.lastAuxFlushMs = performance.now() - startedAt;
                if(typeof goChuStartupMeasure === "function"){
                    goChuStartupMeasure("easy:auxUiFlush", startedAt);
                }
            });
        });
    }

    function deferOrRun(key, value, callback){
        if(!transitionActive) return callback();
        metrics.deferredCalls += 1;
        if(key === "visual") pending.visual = value;
        else pending[key] = true;
        scheduleAuxFlush();
        return undefined;
    }

    if(original.smart){
        scheduleSmartReviewBarUpdate = function(){
            return deferOrRun("smart", true, () => original.smart());
        };
    }

    if(original.topic){
        scheduleTopicLevelBarUpdate = function(){
            return deferOrRun("topic", true, () => original.topic());
        };
    }

    if(original.visual){
        schedulePromptVisual = function(prompt = currentPrompt){
            const value = String(prompt || "");
            return deferOrRun("visual", value, () => original.visual(value));
        };
        updatePromptVisual = function(prompt = currentPrompt){
            return schedulePromptVisual(prompt);
        };
    }

    if(original.listen){
        updateListenModeBar = function(){
            return deferOrRun("listen", true, () => original.listen());
        };
    }

    if(original.memory){
        updateMemoryModeBar = function(){
            return deferOrRun("memory", true, () => original.memory());
        };
    }

    if(original.progress){
        renderPromptWordProgress = function(){
            return deferOrRun("progress", true, () => original.progress());
        };
    }

    if(original.guide){
        updateVietnameseInputGuide = function(){
            return deferOrRun("guide", true, () => original.guide());
        };
    }

    cancelBootUiFrames();

    const baseSetModeForEasyEntryTransition = setMode;
    setMode = function(mode){
        if(mode !== "easy"){
            return baseSetModeForEasyEntryTransition(mode);
        }

        const startedAt = performance.now();
        metrics.easyEntries += 1;
        metrics.lastEntryAt = Date.now();
        transitionActive = true;
        window.__goChuEasyEntryTransitionActive = true;
        cancelBootUiFrames();

        /*
         * Base showText() gọi input.focus(). Disable tạm để focus là no-op trong
         * critical path; memory wrapper sẽ có thể đổi disabled nội bộ, nhưng sau
         * setMode ta khôi phục trạng thái học thường.
         */
        const wasDisabled = Boolean(input?.disabled);
        if(input) input.disabled = true;

        let resultValue;
        try {
            resultValue = baseSetModeForEasyEntryTransition(mode);
        } finally {
            transitionActive = false;
            window.__goChuEasyEntryTransitionActive = false;

            if(input && currentMode === "easy"){
                const memoryCounting = Boolean(
                    typeof memoryModeActive !== "undefined" && memoryModeActive &&
                    typeof memoryRemaining !== "undefined" && memoryRemaining > 0
                );
                if(!memoryCounting) input.disabled = wasDisabled;
            }

            scheduleAuxFlush();
            metrics.lastSyncEntryMs = performance.now() - startedAt;
            if(typeof goChuStartupMeasure === "function"){
                goChuStartupMeasure("easy:entrySyncGate", startedAt);
            }

            cancelAnimationFrame(desktopFocusFrame1);
            cancelAnimationFrame(desktopFocusFrame2);

            if(isCoarsePointer()){
                /* Mobile: để bé chủ động chạm ô gõ, tránh keyboard resize lúc vào mode. */
                metrics.mobileAutofocusSkipped += 1;
            }else{
                metrics.desktopAutofocusDeferred += 1;
                desktopFocusFrame1 = requestAnimationFrame(() => {
                    desktopFocusFrame1 = 0;
                    desktopFocusFrame2 = requestAnimationFrame(() => {
                        desktopFocusFrame2 = 0;
                        if(currentMode !== "easy" || !input || input.disabled) return;
                        try { input.focus({ preventScroll: true }); }
                        catch (error) { input.focus(); }
                    });
                });
            }
        }

        return resultValue;
    };

    window.getGoChuEasyEntryTransitionHealth = function(){
        return {
            ...metrics,
            transitionActive,
            pending: {
                smart: pending.smart,
                topic: pending.topic,
                visual: pending.visual !== null,
                listen: pending.listen,
                memory: pending.memory,
                progress: pending.progress,
                guide: pending.guide
            },
            coarsePointer: isCoarsePointer(),
            currentMode
        };
    };
})();
