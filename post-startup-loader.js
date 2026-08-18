/* ===== PHASE 9 ĐỢT 11E/11F/11G - POST STARTUP FEATURE LOADER =====
 * Easy core activate trước; feature không cần cho first usable frame tải sau double RAF.
 */
(function(){
    const POST_STYLES = Object.freeze([
        "listen-mode.css",
        "ux-hotfix.css",
        "memory-mode.css",
        "visual-prompt.css",
        "vietnamese-input.css",
        "accessibility.css",
        "asset-reliability.css"
    ]);

    const POST_SCRIPTS = Object.freeze([
        "script.js",
        "data-poems.js",
        "tts-manifest.js",
        "visual-data.js",
        "twemoji-local-manifest.js",
        "visual-prompt.js",
        "listen-mode.js",
        "ux-hotfix.js",
        "tts-local.js",
        "memory-mode.js",
        "memory-topic-bridge.js",
        "vietnamese-input.js",
        "vietnamese-dashboard.js",
        "stability-fixes.js",
        "mode-stats.js",
        "storage-health.js",
        "asset-reliability.js",
        "accessibility.js",
        "performance-health.js",
        "debug-smoke.js"
    ]);

    const state = {
        scheduledAt: performance.now(),
        startedAt: 0,
        readyAt: 0,
        durationMs: 0,
        ready: false,
        loading: false,
        loadedScripts: 0,
        failedScripts: [],
        loadedStyles: 0,
        failedStyles: [],
        runtimeValidated: false,
        runtimeChecks: {},
        appUiLoaded: false
    };

    window.GO_CHU_POST_STARTUP_STYLES = POST_STYLES;
    window.GO_CHU_POST_STARTUP_SCRIPTS = POST_SCRIPTS;
    window.GO_CHU_POST_STARTUP_READY = false;
    window.GO_CHU_EXECUTING_POST_SCRIPT = "";

    function getPendingControls(){
        return [
            ...document.querySelectorAll('.mode-btn[data-mode="hard"], .mode-btn[data-mode="free"]'),
            document.getElementById("settingsToggleBtn")
        ].filter(Boolean);
    }

    function setPostUiPending(pending){
        getPendingControls().forEach(control => {
            control.disabled = Boolean(pending);
            control.setAttribute("aria-busy", pending ? "true" : "false");
            if(pending){
                control.dataset.postStartupTitle = control.title || "";
                control.title = "Đang nạp tính năng bổ sung…";
            }else if(control.title === "Đang nạp tính năng bổ sung…"){
                const previous = control.dataset.postStartupTitle || "";
                if(previous) control.title = previous;
                else control.removeAttribute("title");
                delete control.dataset.postStartupTitle;
            }
        });
    }

    function loadStyle(href){
        return new Promise(resolve => {
            if(document.querySelector(`link[data-gochu-post-style="${href}"]`)){
                resolve({ href, ok: true, reused: true });
                return;
            }
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            link.dataset.gochuPostStyle = href;
            link.addEventListener("load", () => resolve({ href, ok: true }), { once: true });
            link.addEventListener("error", () => resolve({ href, ok: false }), { once: true });
            document.head.appendChild(link);
        });
    }

    function appendOrderedScript(src){
        return new Promise(resolve => {
            if(document.querySelector(`script[data-gochu-post-script="${src}"]`)){
                resolve({ src, ok: true, reused: true });
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.async = false;
            script.dataset.gochuPostScript = src;
            script.addEventListener("load", () => resolve({ src, ok: true }), { once: true });
            script.addEventListener("error", () => resolve({ src, ok: false }), { once: true });
            document.head.appendChild(script);
        });
    }

    async function loadPostScripts(){
        const results = [];

        /*
         * script.js là source legacy lớn chứa Free/Settings handlers và 2 dòng
         * startup cũ. Load riêng đầu tiên để easy-start.js có thể nhận diện đúng
         * lời gọi setMode("easy") legacy và suppress nó mà không chặn click user.
         */
        window.GO_CHU_EXECUTING_POST_SCRIPT = "script.js";
        const appUiResult = await appendOrderedScript("script.js");
        window.GO_CHU_EXECUTING_POST_SCRIPT = "";
        results.push(appUiResult);
        state.appUiLoaded = Boolean(appUiResult.ok);

        const remaining = POST_SCRIPTS.filter(src => src !== "script.js");
        const restResults = await Promise.all(remaining.map(appendOrderedScript));
        results.push(...restResults);
        return results;
    }

    function validatePostRuntime(){
        const checks = {
            appUi: state.appUiLoaded && typeof showCenterToast === "function" && typeof submitFreeAnswer === "function",
            legacyEasySuppressed: Boolean(window.GO_CHU_LEGACY_SCRIPT_EASY_SUPPRESSED),
            freeData: typeof freePoems !== "undefined" && Array.isArray(freePoems),
            listen: typeof setListenMode === "function" && typeof toggleListenMode === "function",
            tts: typeof getGoChuTtsHealth === "function",
            memory: typeof setMemoryMode === "function" && Boolean(window.GO_CHU_MEMORY_BEHAVIOR_READY),
            memoryTopic: Boolean(window.GO_CHU_MEMORY_TOPIC_BRIDGE_READY),
            vietnameseInput: typeof refreshVietnameseProgressUI === "function",
            modeStats: typeof getStandaloneModeSummary === "function",
            storage: typeof getGoChuStorageHealth === "function",
            performance: typeof getGoChuPerformanceHealth === "function"
        };
        state.runtimeChecks = checks;
        state.runtimeValidated = Object.values(checks).every(Boolean);
        return state.runtimeValidated;
    }

    function finishPostStartup(styleResults, scriptResults){
        state.loadedStyles = styleResults.filter(item => item.ok).length;
        state.failedStyles = styleResults.filter(item => !item.ok).map(item => item.href);
        state.loadedScripts = scriptResults.filter(item => item.ok).length;
        state.failedScripts = scriptResults.filter(item => !item.ok).map(item => item.src);

        const runtimeOk = validatePostRuntime();
        if(!runtimeOk){
            const missing = Object.entries(state.runtimeChecks)
                .filter(([, value]) => !value)
                .map(([name]) => name);
            state.failedScripts.push(`runtime:${missing.join(",")}`);
        }

        state.ready = state.failedScripts.length === 0 && runtimeOk;
        state.loading = false;
        state.readyAt = performance.now();
        state.durationMs = state.readyAt - state.startedAt;
        window.GO_CHU_POST_STARTUP_READY = state.ready;
        setPostUiPending(!state.ready);

        window.dispatchEvent(new CustomEvent("gochu:post-startup-ready", {
            detail: {
                ready: state.ready,
                runtimeValidated: state.runtimeValidated,
                runtimeChecks: { ...state.runtimeChecks },
                failedScripts: [...state.failedScripts],
                failedStyles: [...state.failedStyles]
            }
        }));

        if(typeof goChuStartupMark === "function"){
            goChuStartupMark("postStartup:ready", state.ready ? "ok" : "partial");
        }
    }

    function startPostStartup(){
        if(state.loading || state.ready) return;
        state.loading = true;
        state.startedAt = performance.now();
        setPostUiPending(true);
        if(typeof goChuStartupMark === "function") goChuStartupMark("postStartup:start");

        const stylePromise = Promise.all(POST_STYLES.map(loadStyle));
        const scriptPromise = loadPostScripts();

        Promise.all([stylePromise, scriptPromise])
            .then(([styleResults, scriptResults]) => finishPostStartup(styleResults, scriptResults))
            .catch(error => {
                window.GO_CHU_EXECUTING_POST_SCRIPT = "";
                state.loading = false;
                state.ready = false;
                state.readyAt = performance.now();
                state.durationMs = state.readyAt - state.startedAt;
                state.failedScripts.push(String(error?.message || error || "post-startup error"));
                setPostUiPending(true);
            });
    }

    function scheduleAfterFirstPaint(){
        requestAnimationFrame(() => {
            requestAnimationFrame(startPostStartup);
        });
    }

    window.getGoChuPostStartupHealth = function(){
        return {
            ...state,
            scriptCount: POST_SCRIPTS.length,
            styleCount: POST_STYLES.length,
            pendingScripts: Math.max(0, POST_SCRIPTS.length - state.loadedScripts),
            pendingStyles: Math.max(0, POST_STYLES.length - state.loadedStyles),
            memoryBehaviorReady: Boolean(window.GO_CHU_MEMORY_BEHAVIOR_READY),
            memoryTopicBridgeReady: Boolean(window.GO_CHU_MEMORY_TOPIC_BRIDGE_READY),
            easyCoreStarted: Boolean(window.GO_CHU_EASY_CORE_STARTED),
            legacyScriptEasySuppressed: Boolean(window.GO_CHU_LEGACY_SCRIPT_EASY_SUPPRESSED)
        };
    };

    setPostUiPending(true);
    scheduleAfterFirstPaint();
})();
