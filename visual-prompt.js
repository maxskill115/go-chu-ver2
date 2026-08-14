/* ===== VER2 PHASE 3 - HIỂN THỊ HÌNH + CHỮ ===== */
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

    return {
        ...rule,
        src: `${GO_CHU_VISUAL_ASSET_BASE}/${rule.code}.svg`
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

    image.onload = () => {
        image.classList.remove("hidden");
        fallback.classList.add("hidden");
    };

    image.onerror = () => {
        image.classList.add("hidden");
        fallback.classList.remove("hidden");
    };

    image.src = visual.src;
}

const baseShowTextForVisual = showText;
showText = function(){
    baseShowTextForVisual();
    updatePromptVisual(currentPrompt);
};

ensurePromptVisual();
