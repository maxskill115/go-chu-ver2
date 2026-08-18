/* ===== PHASE 9 ĐỢT 11E - POST STARTUP FEATURE LOADER =====
 * Nạp ngay SAU script.js. Easy core đã activate trước khi file này chạy.
 *
 * Mục tiêu:
 * - cho browser paint prompt/input Easy trước;
 * - sau double RAF mới bắt đầu tải các module không cần cho first usable frame;
 * - script hậu kỳ vẫn execute đúng thứ tự dependency nhờ dynamic script async=false.
 */
(function(){
    const POST_STYLES = Object.freeze([
        "visual-prompt.css",
        "vietnamese-input.css",
        "accessibility.css",
        "asset-reliability.css"
    ]);

    const POST_SCRIPTS = Object.freeze([
        "data-poems.js",
        "visual-data.js",
        "twemoji-local-manifest.js",
        "visual-prompt.js",
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
        failedStyles: []
    };

    window.GO_CHU_POST_STARTUP_STYLES = POST_STYLES;
    window.GO_CHU_POST_STARTUP_SCRIPTS = POST_SCRIPTS;
    window.GO_CHU_POST_STARTUP_READY = false;

    function getFreeModeButton(){
        return document.querySelector('.mode-btn[data-mode="free"]');
    }

    function setFreeModePending(pending){
        const button = getFreeModeButton();
        if(!button) return;
        button.disabled = Boolean(pending);
        button.setAttribute("aria-busy", pending ? "true" : "false");
        if(pending){
            button.title = "Đang nạp chế độ Tự do…";
        }else if(button.title === "Đang nạp chế độ Tự do…"){
            button.removeAttribute("title");
        }
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
            /* Dynamic scripts mặc định async=true; phải tắt để giữ dependency order. */
            script.async = false;
            script.dataset.gochuPostScript = src;
            script.addEventListener("load", () => resolve({ src, ok: true }), { once: true });
            script.addEventListener("error", () => resolve({ src, ok: false }), { once: true });
            document.head.appendChild(script);
        });
    }

    function finishPostStartup(styleResults, scriptResults){
        state.loadedStyles = styleResults.filter(item => item.ok).length;
        state.failedStyles = styleResults.filter(item => !item.ok).map(item => item.href);
        state.loadedScripts = scriptResults.filter(item => item.ok).length;
        state.failedScripts = scriptResults.filter(item => !item.ok).map(item => item.src);
        state.ready = state.failedScripts.length === 0;
        state.loading = false;
        state.readyAt = performance.now();
        state.durationMs = state.readyAt - state.startedAt;

        window.GO_CHU_POST_STARTUP_READY = state.ready;
        setFreeModePending(!state.ready);

        window.dispatchEvent(new CustomEvent("gochu:post-startup-ready", {
            detail: {
                ready: state.ready,
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
        setFreeModePending(true);

        if(typeof goChuStartupMark === "function"){
            goChuStartupMark("postStartup:start");
        }

        /* CSS có thể tải song song. */
        const stylePromise = Promise.all(POST_STYLES.map(loadStyle));

        /*
         * Append toàn bộ script ngay để browser download song song.
         * async=false giữ execution theo insertion order cho classic dynamic scripts.
         */
        const scriptPromises = POST_SCRIPTS.map(appendOrderedScript);
        const scriptPromise = Promise.all(scriptPromises);

        Promise.all([stylePromise, scriptPromise])
            .then(([styleResults, scriptResults]) => finishPostStartup(styleResults, scriptResults))
            .catch(error => {
                state.loading = false;
                state.ready = false;
                state.readyAt = performance.now();
                state.durationMs = state.readyAt - state.startedAt;
                state.failedScripts.push(String(error?.message || error || "post-startup error"));
                setFreeModePending(true);
            });
    }

    function scheduleAfterFirstPaint(){
        /*
         * RAF #1 chạy trước first paint và chỉ schedule RAF #2.
         * Browser có cơ hội paint Easy core giữa hai callback.
         */
        requestAnimationFrame(() => {
            requestAnimationFrame(startPostStartup);
        });
    }

    window.getGoChuPostStartupHealth = function(){
        return {
            ...state,
            scriptCount: POST_SCRIPTS.length,
            styleCount: POST_STYLES.length,
            pendingScripts: Math.max(0, POST_SCRIPTS.length - state.loadedScripts - state.failedScripts.length),
            pendingStyles: Math.max(0, POST_STYLES.length - state.loadedStyles - state.failedStyles.length)
        };
    };

    setFreeModePending(true);
    scheduleAfterFirstPaint();
})();
