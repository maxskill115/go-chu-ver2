/* ===== VER2 PHASE 3 + OFFLINE VISUAL + PHASE 9 PERF ===== */
const goChuVisualMatchCache = new Map();
let goChuVisualFrame = 0;
let goChuVisualRequestToken = 0;

function normalizeVisualPrompt(text){
    return normalizeParagraph(String(text || ""))
        .normalize("NFC")
        .toLocaleLowerCase("vi-VN")
        .trim();
}

const GO_CHU_COMPILED_VISUAL_RULES = promptVisualRules.map(rule => ({
    rule,
    exact: new Set((Array.isArray(rule.exact) ? rule.exact : []).map(normalizeVisualPrompt).filter(Boolean)),
    contains: (Array.isArray(rule.contains) ? rule.contains : []).map(normalizeVisualPrompt).filter(Boolean)
}));

function visualRuleMatches(compiled, normalized){
    if(compiled.exact.has(normalized)) return true;
    return compiled.contains.some(phrase => normalized.includes(phrase));
}

function getPromptVisual(prompt){
    const normalized = normalizeVisualPrompt(prompt);
    if(!normalized) return null;
    if(goChuVisualMatchCache.has(normalized)) return goChuVisualMatchCache.get(normalized);

    const compiled = GO_CHU_COMPILED_VISUAL_RULES.find(item => visualRuleMatches(item, normalized));
    if(!compiled){
        goChuVisualMatchCache.set(normalized, null);
        return null;
    }

    const rule = compiled.rule;
    const localMap = window.GO_CHU_TWEMOJI_LOCAL || {};
    const localSrc = localMap[rule.code] || "";
    const cdnSrc = `${GO_CHU_VISUAL_ASSET_BASE}/${rule.code}.svg`;
    const visual = { ...rule, src: localSrc || cdnSrc, localSrc, cdnSrc };
    goChuVisualMatchCache.set(normalized, visual);
    return visual;
}

function ensurePromptVisual(){
    let wrap = document.getElementById("promptVisualWrap");
    if(wrap) return wrap;

    wrap = document.createElement("div");
    wrap.id = "promptVisualWrap";
    wrap.className = "prompt-visual-wrap hidden";
    wrap.setAttribute("aria-live", "polite");

    const image = document.createElement("img");
    image.id = "promptVisualImage";
    image.className = "prompt-visual-image";
    image.decoding = "async";
    image.loading = "lazy";
    try { image.fetchPriority = "low"; } catch (error) {}

    const fallback = document.createElement("span");
    fallback.id = "promptVisualFallback";
    fallback.className = "prompt-visual-fallback hidden";
    fallback.setAttribute("aria-hidden", "true");

    wrap.append(image, fallback);
    normalPanel.insertBefore(wrap, textDiv);
    return wrap;
}

function hidePromptVisual(){
    cancelAnimationFrame(goChuVisualFrame);
    goChuVisualFrame = 0;
    goChuVisualRequestToken += 1;

    const wrap = document.getElementById("promptVisualWrap");
    const image = document.getElementById("promptVisualImage");
    const fallback = document.getElementById("promptVisualFallback");
    if(!wrap || !image || !fallback) return;

    wrap.classList.add("hidden");
    image.classList.add("hidden");
    fallback.classList.add("hidden");
    image.removeAttribute("src");
    image.alt = "";
    image.dataset.visualSource = "";
}

function updatePromptVisualNow(prompt, requestToken){
    if(requestToken !== goChuVisualRequestToken) return;
    if(currentMode !== "easy" || prompt !== currentPrompt){
        hidePromptVisual();
        return;
    }

    const visual = getPromptVisual(prompt);
    if(!visual){
        hidePromptVisual();
        return;
    }

    const wrap = ensurePromptVisual();
    const image = document.getElementById("promptVisualImage");
    const fallback = document.getElementById("promptVisualFallback");

    wrap.classList.remove("hidden");
    fallback.textContent = visual.fallback || "🖼️";
    fallback.classList.add("hidden");
    image.classList.add("hidden");
    image.alt = visual.alt || "Hình minh họa";

    let triedCdn = !visual.localSrc;

    image.onload = () => {
        if(requestToken !== goChuVisualRequestToken || prompt !== currentPrompt) return;
        image.classList.remove("hidden");
        fallback.classList.add("hidden");
        image.dataset.visualSource = visual.localSrc && image.src.includes(visual.localSrc)
            ? "local"
            : "cdn";
    };

    image.onerror = () => {
        if(requestToken !== goChuVisualRequestToken || prompt !== currentPrompt) return;
        if(!triedCdn && visual.cdnSrc && image.src !== visual.cdnSrc){
            triedCdn = true;
            image.dataset.visualSource = "cdn-fallback";
            image.src = visual.cdnSrc;
            return;
        }

        image.classList.add("hidden");
        fallback.classList.remove("hidden");
        image.dataset.visualSource = "emoji";
    };

    image.dataset.visualSource = visual.localSrc ? "local-pending" : "cdn-pending";
    image.src = visual.src;
}

function schedulePromptVisual(prompt = currentPrompt){
    cancelAnimationFrame(goChuVisualFrame);
    const requestToken = ++goChuVisualRequestToken;

    if(currentMode !== "easy"){
        hidePromptVisual();
        return;
    }

    goChuVisualFrame = requestAnimationFrame(() => {
        goChuVisualFrame = 0;
        updatePromptVisualNow(String(prompt || ""), requestToken);
    });
}

function updatePromptVisual(prompt){
    schedulePromptVisual(prompt);
}

function getGoChuVisualHealth(){
    const localMap = window.GO_CHU_TWEMOJI_LOCAL || {};
    const meta = window.GO_CHU_TWEMOJI_META || {};
    const uniqueCodes = [...new Set(promptVisualRules.map(rule => rule.code))];
    const localCount = uniqueCodes.filter(code => Boolean(localMap[code])).length;
    const image = document.getElementById("promptVisualImage");

    return {
        twemojiVersion: meta.version || "17.0.3",
        uniqueCodes: uniqueCodes.length,
        localCount,
        coveragePercent: uniqueCodes.length ? Math.round((localCount / uniqueCodes.length) * 100) : 0,
        currentSource: image?.dataset?.visualSource || "",
        currentPromptHasRule: Boolean(getPromptVisual(currentPrompt)),
        matchCacheSize: goChuVisualMatchCache.size
    };
}

window.getGoChuVisualHealth = getGoChuVisualHealth;

const baseShowTextForVisual = showText;
showText = function(){
    baseShowTextForVisual();
    schedulePromptVisual(currentPrompt);
};

const baseSetModeForVisual = setMode;
setMode = function(mode){
    baseSetModeForVisual(mode);
    if(mode === "easy") schedulePromptVisual(currentPrompt);
    else hidePromptVisual();
};
