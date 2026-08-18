/* ===== PHASE 9 ĐỢT 11F - MEMORY/TOPIC BRIDGE =====
 * memory-mode.js post-load thay implementation buildMemoryRound thật.
 * File này nạp ngay sau memory-mode.js để gắn lại filter chủ đề vốn trước đây
 * nằm trong topic-level.js khi Memory còn critical-path.
 */
(function(){
    if(typeof buildMemoryRound !== "function") return;

    const baseBuildMemoryRoundForLateTopic = buildMemoryRound;
    buildMemoryRound = function(previousPrompt = ""){
        const filtered = baseBuildMemoryRoundForLateTopic(previousPrompt)
            .filter(prompt => typeof promptMatchesTopic !== "function" || promptMatchesTopic(prompt, selectedTopicId));

        if(previousPrompt && filtered.length > 1 && filtered[0] === previousPrompt){
            const swapIndex = filtered.findIndex((prompt, i) => i > 0 && prompt !== previousPrompt);
            if(swapIndex > 0){
                [filtered[0], filtered[swapIndex]] = [filtered[swapIndex], filtered[0]];
            }
        }
        return filtered;
    };

    window.GO_CHU_MEMORY_TOPIC_BRIDGE_READY = true;
})();
