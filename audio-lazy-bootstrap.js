/* ===== PHASE 9 ĐỢT 11B - KHÔNG TẢI AUDIO TRƯỚC TƯƠNG TÁC =====
 * Phải nạp trước script-core.js.
 * Giữ API `new Audio(url)` tương thích nhưng trì hoãn gắn src cho tới
 * pointer/keyboard đầu tiên. Nhờ vậy MP3/WAV không chen vào startup network.
 */
(function(){
    const NativeAudio = window.Audio;
    if(typeof NativeAudio !== "function" || window.__goChuLazyAudioInstalled) return;

    let userActivated = false;
    const pending = new Set();

    function unlockAudio(){
        if(userActivated) return;
        userActivated = true;
        pending.forEach(record => {
            if(record.audio && record.src && !record.audio.getAttribute("src")){
                record.audio.src = record.src;
            }
        });
        pending.clear();
    }

    document.addEventListener("pointerdown", unlockAudio, { capture: true, once: true, passive: true });
    document.addEventListener("keydown", unlockAudio, { capture: true, once: true });

    function LazyAudio(src){
        const audio = new NativeAudio();
        const deferredSrc = src ? String(src) : "";
        audio.preload = "none";

        const record = { audio, src: deferredSrc };
        if(deferredSrc){
            if(userActivated) audio.src = deferredSrc;
            else pending.add(record);
        }

        const nativePlay = audio.play.bind(audio);
        audio.play = function(){
            if(deferredSrc && !audio.getAttribute("src")){
                if(!userActivated){
                    const error = typeof DOMException === "function"
                        ? new DOMException("Audio waits for user activation", "NotAllowedError")
                        : new Error("Audio waits for user activation");
                    return Promise.reject(error);
                }
                audio.src = deferredSrc;
                pending.delete(record);
            }
            return nativePlay();
        };

        return audio;
    }

    LazyAudio.prototype = NativeAudio.prototype;
    window.Audio = LazyAudio;
    window.__goChuLazyAudioInstalled = true;
    window.getGoChuAudioBootstrapHealth = function(){
        return {
            installed: true,
            userActivated,
            pendingAudioSources: pending.size
        };
    };
})();
