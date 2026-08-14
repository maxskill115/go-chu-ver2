/* ===== VER2 PHASE 9 - ASSET RELIABILITY =====
 * Không thay asset gốc. Chỉ hiện fallback khi ../IMG/... tải lỗi.
 * Twemoji Phase 3 đã có img.onerror fallback riêng nên không probe tại đây.
 */
const goChuAssetProbeCache = new Map();
let goChuAssetReliabilityInitialized = false;

const GO_CHU_STATIC_UI_ASSETS = [
    { selector: ".title-icon", property: "--ui-icon-url", fallback: "⌨️", label: "Title icon" },
    { selector: '.mode-btn[data-mode="easy"] .ui-icon', property: "--ui-icon-url", fallback: "🔤", label: "Easy mode icon" },
    { selector: '.mode-btn[data-mode="hard"] .ui-icon', property: "--ui-icon-url", fallback: "🧠", label: "Hard mode icon" },
    { selector: '.mode-btn[data-mode="free"] .ui-icon', property: "--ui-icon-url", fallback: "✍️", label: "Free mode icon" },
    { selector: ".free-btn-icon", property: "--ui-icon-url", fallback: "✍️", label: "Free action icon" }
];

function extractCssUrl(value){
    const text = String(value || "").trim();
    const match = text.match(/^url\((['"]?)(.*?)\1\)$/i);
    return match ? match[2] : "";
}

function resolveAssetUrl(url){
    try {
        return new URL(String(url || ""), document.baseURI).href;
    } catch (error) {
        return String(url || "");
    }
}

function probeAssetUrl(url){
    const resolved = resolveAssetUrl(url);
    if(!resolved) return Promise.resolve(false);
    if(goChuAssetProbeCache.has(resolved)) return goChuAssetProbeCache.get(resolved);

    const promise = new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = resolved;
    });

    goChuAssetProbeCache.set(resolved, promise);
    return promise;
}

function getElementAssetUrl(element, property, fallbackUrl = ""){
    if(!element) return "";
    const inlineValue = element.style?.getPropertyValue(property) || "";
    const computedValue = getComputedStyle(element).getPropertyValue(property) || "";
    return extractCssUrl(inlineValue) || extractCssUrl(computedValue) || fallbackUrl;
}

function applyAssetProbeState(element, status, fallback, label, url){
    if(!element) return;
    element.dataset.assetProbe = status;
    element.dataset.assetFallback = fallback || "";
    element.dataset.assetLabel = label || "UI asset";
    element.dataset.assetUrl = url || "";
    element.classList.toggle("go-chu-asset-missing", status === "missing");
    element.classList.toggle("go-chu-asset-ok", status === "ok");
}

async function probeElementAsset(element, options){
    if(!element) return false;
    const property = options.property || "--ui-icon-url";
    const url = getElementAssetUrl(element, property, options.fallbackUrl || "");

    if(!url){
        applyAssetProbeState(element, "missing", options.fallback, options.label, "");
        return false;
    }

    const resolved = resolveAssetUrl(url);
    const probeToken = `${resolved}|${Date.now()}|${Math.random()}`;
    element.dataset.assetProbeToken = probeToken;
    applyAssetProbeState(element, "pending", options.fallback, options.label, resolved);

    const ok = await probeAssetUrl(resolved);
    if(element.dataset.assetProbeToken !== probeToken) return ok;

    applyAssetProbeState(element, ok ? "ok" : "missing", options.fallback, options.label, resolved);
    return ok;
}

function probeStaticUiAssets(){
    GO_CHU_STATIC_UI_ASSETS.forEach(rule => {
        document.querySelectorAll(rule.selector).forEach(element => {
            probeElementAsset(element, rule);
        });
    });
}

function getFreePoemVisibleAssetTargets(){
    return [
        document.getElementById("freePoemIcon"),
        document.getElementById("freePoemViewIcon")
    ].filter(Boolean);
}

function probeFreePoemVisibleAssets(){
    getFreePoemVisibleAssetTargets().forEach(element => {
        probeElementAsset(element, {
            property: "--free-poem-icon-url",
            fallbackUrl: "../IMG/gochu_tudo (1).png",
            fallback: "📖",
            label: "Free poem icon"
        });
    });
}

function observeFreePoemAssetChanges(){
    if(typeof MutationObserver === "undefined") return;

    getFreePoemVisibleAssetTargets().forEach(element => {
        const observer = new MutationObserver(() => probeFreePoemVisibleAssets());
        observer.observe(element, { attributes: true, attributeFilter: ["style"] });
    });
}

function getGoChuAssetHealth(){
    const elements = Array.from(document.querySelectorAll("[data-asset-probe]"));
    const items = elements.map(element => ({
        label: element.dataset.assetLabel || "UI asset",
        status: element.dataset.assetProbe || "unknown",
        url: element.dataset.assetUrl || "",
        fallback: element.dataset.assetFallback || ""
    }));

    return {
        initialized: goChuAssetReliabilityInitialized,
        total: items.length,
        ok: items.filter(item => item.status === "ok").length,
        missing: items.filter(item => item.status === "missing").length,
        pending: items.filter(item => item.status === "pending").length,
        items
    };
}

function printGoChuAssetHealth(){
    const report = getGoChuAssetHealth();
    console.group(`🖼️ go-chu-ver2 UI assets: ${report.ok} ok / ${report.missing} missing / ${report.pending} pending`);
    console.table(report.items);
    console.groupEnd();
    return report;
}

function initGoChuAssetReliability(){
    if(goChuAssetReliabilityInitialized) return;
    goChuAssetReliabilityInitialized = true;
    probeStaticUiAssets();
    probeFreePoemVisibleAssets();
    observeFreePoemAssetChanges();
    if(typeof goChuStartupMark === "function") goChuStartupMark("assetProbe:started");
}

function scheduleGoChuAssetReliability(){
    const run = () => initGoChuAssetReliability();
    if("requestIdleCallback" in window){
        window.requestIdleCallback(run, { timeout: 1200 });
    }else{
        setTimeout(run, 700);
    }
}

window.getGoChuAssetHealth = getGoChuAssetHealth;
window.printGoChuAssetHealth = printGoChuAssetHealth;
window.initGoChuAssetReliability = initGoChuAssetReliability;

if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", scheduleGoChuAssetReliability, { once: true });
}else{
    scheduleGoChuAssetReliability();
}
