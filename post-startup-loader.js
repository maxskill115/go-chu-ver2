/* ===== PHASE 9 ĐỢT 11E/11F - POST STARTUP FEATURE LOADER =====
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
        runtimeChecks: {}
    };

    window.GO_CHU_POST_STARTUP_STYLES = POST_STYLES;
    window.GO_CHU_POST_STARTUP_SCRIPTS = POST_SCRIPTS;
    window.GO_CHU_POST_STARTUP_READY = false;

    function getSecondaryModeButtons(){
        return Array.from(document.querySelectorAll('.mode-btn[data-mode="hard"], .mode-btn[data-mode="free"]'));
    }

    function setSecondaryModesPending(pending){
        getSecondaryModeButtons().forEach(button => {
            button.disabled = Boolean(pending);
            button.setAttribute("aria-busy", pending ? "true" : "false");
            if(pending){
                button.title = "Đang nạp tính năng bổ sung…";
            }else if(button.title === "Đang nạp tính năng bổ sung…"){
                button.removeAttribute("title");
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

    function validatePostRuntime(){
        const checks = {
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
        setSecondaryModesPending(!state.ready);

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
        setSecondaryModesPending(true);
        if(typeof goChuStartupMark === "function") goChuStartupMark("postStartup:start");

        const stylePromise = Promise.all(POST_STYLES.map(loadStyle));
        const scriptPromise = Promise.all(POST_SCRIPTS.map(appendOrderedScript));

        Promise.all([stylePromise, scriptPromise])
            .then(([styleResults, scriptResults]) => finishPostStartup(styleResults, scriptResults))
            .catch(error => {
                state.loading = false;
                state.ready = false;
                state.readyAt = performance.now();
                state.durationMs = state.readyAt - state.startedAt;
                state.failedScripts.push(String(error?.message || error || "post-startup error"));
                setSecondaryModesPending(true);
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
            memoryTopicBridgeReady: Boolean(window.GO_CHU_MEMORY_TOPIC_BRIDGE_READY)
        };
    };

    setSecondaryModesPending(true);
    scheduleAfterFirstPaint();
})();
