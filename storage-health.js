/* ===== VER2 PHASE 9 - STORAGE HEALTH / WRITE DEDUPE =====
 * Không đổi schema profile, không đổi cadence study timer.
 * Chỉ bỏ qua localStorage.setItem khi serialized value thực sự không đổi.
 */
const goChuStorageMetrics = {
    profileWrites: 0,
    profileWriteSkips: 0,
    registryWrites: 0,
    registryWriteSkips: 0,
    writeErrors: 0,
    lastWriteAt: 0
};

function goChuSerializeProfile(data){
    return JSON.stringify(normalizeProfileData(data));
}

function goChuWriteIfChanged(key, serialized, metricWrite, metricSkip){
    try {
        const previous = localStorage.getItem(key);
        if(previous === serialized){
            goChuStorageMetrics[metricSkip] += 1;
            return false;
        }

        localStorage.setItem(key, serialized);
        goChuStorageMetrics[metricWrite] += 1;
        goChuStorageMetrics.lastWriteAt = Date.now();
        return true;
    } catch (error) {
        goChuStorageMetrics.writeErrors += 1;
        return false;
    }
}

/*
 * Thay implementation Phase 7 bằng phiên bản tương đương về dữ liệu,
 * chỉ thêm compare-before-write. Luôn gọi normalizeProfileData cuối cùng,
 * nên modeStats Phase 9 vẫn được giữ nguyên.
 */
saveProfileData = function(profileId, data){
    if(!profileId) return;
    const key = profileDataKey(profileId);
    let serialized;

    try {
        serialized = goChuSerializeProfile(data);
    } catch (error) {
        goChuStorageMetrics.writeErrors += 1;
        return;
    }

    goChuWriteIfChanged(
        key,
        serialized,
        "profileWrites",
        "profileWriteSkips"
    );
};

/* Registry ít thay đổi nhưng nhiều luồng gọi lại. Giữ nguyên 2 key gốc. */
saveProfilesRegistry = function(){
    try {
        const registrySerialized = JSON.stringify(profiles);
        const registryChanged = localStorage.getItem(GO_CHU_PROFILES_KEY) !== registrySerialized;
        const activeSerialized = String(activeProfileId || "");
        const activeChanged = localStorage.getItem(GO_CHU_ACTIVE_PROFILE_KEY) !== activeSerialized;

        if(!registryChanged && !activeChanged){
            goChuStorageMetrics.registryWriteSkips += 1;
            return;
        }

        if(registryChanged){
            localStorage.setItem(GO_CHU_PROFILES_KEY, registrySerialized);
        }
        if(activeChanged){
            localStorage.setItem(GO_CHU_ACTIVE_PROFILE_KEY, activeSerialized);
        }

        goChuStorageMetrics.registryWrites += 1;
        goChuStorageMetrics.lastWriteAt = Date.now();
    } catch (error) {
        goChuStorageMetrics.writeErrors += 1;
    }
};

function getGoChuStorageEntries(){
    const rows = [];

    try {
        for(let index = 0; index < localStorage.length; index++){
            const key = localStorage.key(index);
            if(!key || !key.startsWith("goChuVer2.")) continue;
            const value = localStorage.getItem(key) || "";
            rows.push({ key, value });
        }
    } catch (error) {}

    return rows;
}

function getGoChuUtf8Bytes(text){
    const value = String(text || "");
    try {
        if(typeof TextEncoder !== "undefined"){
            return new TextEncoder().encode(value).byteLength;
        }
    } catch (error) {}
    return value.length * 2;
}

function getGoChuStorageHealth(){
    const entries = getGoChuStorageEntries();
    const rows = entries.map(item => {
        const bytes = getGoChuUtf8Bytes(item.key) + getGoChuUtf8Bytes(item.value);
        return {
            key: item.key,
            bytes,
            kb: Number((bytes / 1024).toFixed(2))
        };
    }).sort((a, b) => b.bytes - a.bytes);

    const totalBytes = rows.reduce((sum, item) => sum + item.bytes, 0);
    const profileRows = rows.filter(item => item.key.startsWith(GO_CHU_PROFILE_PREFIX));

    return {
        appKeyCount: rows.length,
        profileCount: Array.isArray(profiles) ? profiles.length : 0,
        profileKeyCount: profileRows.length,
        totalBytes,
        totalKB: Number((totalBytes / 1024).toFixed(2)),
        largestKeys: rows.slice(0, 10),
        metrics: { ...goChuStorageMetrics }
    };
}

function printGoChuStorageHealth(){
    const report = getGoChuStorageHealth();
    console.group(`💾 go-chu-ver2 storage: ${report.totalKB} KB / ${report.appKeyCount} keys`);
    console.table(report.largestKeys);
    console.table([report.metrics]);
    console.groupEnd();
    return report;
}

window.goChuStorageMetrics = goChuStorageMetrics;
window.getGoChuStorageHealth = getGoChuStorageHealth;
window.printGoChuStorageHealth = printGoChuStorageHealth;
