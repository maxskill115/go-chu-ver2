/* ===== PHASE 10 - PRE-RENDERED GOOGLE TTS MANIFEST =====
 * File này được tools/render_google_tts.py ghi lại sau khi render MP3.
 * Bản mặc định để trống để repo vẫn chạy bằng Web Speech fallback.
 */
window.GO_CHU_TTS_MANIFEST = Object.freeze({});
window.GO_CHU_TTS_META = Object.freeze({
    version: 1,
    provider: "google-cloud-text-to-speech",
    languageCode: "vi-VN",
    voice: "",
    speakingRate: null,
    generatedAt: null,
    count: 0
});
