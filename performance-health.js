/* ===== PERFORMANCE HEALTH / FREEZE DIAGNOSTICS =====
 * Theo dõi long task + runtime error với overhead rất thấp.
 * Không thay đổi logic học.
 */
const goChuPerformanceHealth = {
    startedAt: Date.now(),
    longTaskCount: 0,
    longTaskTotalMs: 0,
    maxLongTaskMs: 0,
    recentLongTasks: [],
    errorCount: 0,
    recentErrors: []
};

function pushBounded(list, value, limit = 20){
    list.push(value);
    if(list.length > limit) list.splice(0, list.length - limit);
}

function recordGoChuRuntimeError(type, message){
    goChuPerformanceHealth.errorCount += 1;
    pushBounded(goChuPerformanceHealth.recentErrors, {
        at: Date.now(),
        type,
        message: String(message || "Unknown error").slice(0, 500)
    });
}

window.addEventListener("error", event => {
    recordGoChuRuntimeError("error", event?.message || event?.error?.message || "Runtime error");
});

window.addEventListener("unhandledrejection", event => {
    const reason = event?.reason;
    recordGoChuRuntimeError("unhandledrejection", reason?.message || reason || "Unhandled promise rejection");
});

if(typeof PerformanceObserver !== "undefined"){
    try {
        const observer = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
                const duration = Math.round(Number(entry.duration || 0));
                goChuPerformanceHealth.longTaskCount += 1;
                goChuPerformanceHealth.longTaskTotalMs += duration;
                goChuPerformanceHealth.maxLongTaskMs = Math.max(goChuPerformanceHealth.maxLongTaskMs, duration);
                pushBounded(goChuPerformanceHealth.recentLongTasks, {
                    at: Date.now(),
                    duration,
                    name: entry.name || "longtask"
                });
            });
        });
        observer.observe({ type: "longtask", buffered: true });
    } catch (error) {
        // Safari/Firefox có thể chưa hỗ trợ Long Tasks API.
    }
}

function getGoChuPerformanceHealth(){
    const count = goChuPerformanceHealth.longTaskCount;
    return {
        uptimeSeconds: Math.round((Date.now() - goChuPerformanceHealth.startedAt) / 1000),
        longTaskCount: count,
        longTaskTotalMs: goChuPerformanceHealth.longTaskTotalMs,
        maxLongTaskMs: goChuPerformanceHealth.maxLongTaskMs,
        averageLongTaskMs: count ? Math.round(goChuPerformanceHealth.longTaskTotalMs / count) : 0,
        errorCount: goChuPerformanceHealth.errorCount,
        recentLongTasks: [...goChuPerformanceHealth.recentLongTasks],
        recentErrors: [...goChuPerformanceHealth.recentErrors]
    };
}

function printGoChuPerformanceHealth(){
    const report = getGoChuPerformanceHealth();
    console.group(`⚡ go-chu-ver2 performance: ${report.longTaskCount} long task / ${report.errorCount} error`);
    console.log(report);
    if(report.recentLongTasks.length) console.table(report.recentLongTasks);
    if(report.recentErrors.length) console.table(report.recentErrors);
    console.groupEnd();
    return report;
}

window.goChuPerformanceHealth = goChuPerformanceHealth;
window.getGoChuPerformanceHealth = getGoChuPerformanceHealth;
window.printGoChuPerformanceHealth = printGoChuPerformanceHealth;
