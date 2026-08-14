/* ===== VER2 PHASE 3 + OFFLINE VISUAL ===== */
function normalizeVisualPrompt(text){
    return normalizeParagraph(String(text || ""))
        .normalize("NFC")
        .toLocaleLowerCase("vi-VN");
}

function getPromptVisual(prompt){
    const normalized = normalizeVisualPrompt(prompt);
    if(!normalized) return null;

    const rule = promptVisualRules.find(item =>
        item.keywords.some(keyword => normalized.includes(keyword))
    );

    if(!rule) return null;

    const localMap = window.GO_CHU_TWEMOJI_LOCAL || {};
    const localSrc = localMap[rule.code] || "";
    const cdnSrc = `${GO_CHU_VISUAL_ASSET_BASE}/${rule.code}.svg`;

    return {
        ...rule,
        src: localSrc || cdnSrc,
        localSrc,
        cdnSrc
    };
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
    image.loading = "eager";

    const fallback = document.createElement("span");
    fallback.id = "promptVisualFallback";
    fallback.className = "prompt-visual-fallback hidden";
    fallback.setAttribute("aria-hidden", "true");

    wrap.append(image, fallback);
    normalPanel.insertBefore(wrap, textDiv);
    return wrap;
}

function hidePromptVisual(){
    const wrap = ensurePromptVisual();
    const image = document.getElementById("promptVisualImage");
    const fallback = document.getElementById("promptVisualFallback");

    wrap.classList.add("hidden");
    image.classList.add("hidden");
    fallback.classList.add("hidden");
    image.removeAttribute("src");
    image.alt = "";
    image.dataset.visualSource = "";
}

function updatePromptVisual(prompt){
    if(currentMode !== "easy"){
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
        image.classList.remove("hidden");
        fallback.classList.add("hidden");
        image.dataset.visualSource = visual.localSrc && image.src.includes(visual.localSrc)
            ? "local"
            : "cdn";
    };

    image.onerror = () => {
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
        currentPromptHasRule: Boolean(getPromptVisual(currentPrompt))
    };
}

window.getGoChuVisualHealth = getGoChuVisualHealth;

const baseShowTextForVisual = showText;
showText = function(){
    baseShowTextForVisual();
    updatePromptVisual(currentPrompt);
};

ensurePromptVisual();
