/* ===== PHASE 9 ĐỢT 11 - STARTUP PERFORMANCE MARKERS ===== */
(function(){
    const bootAt = performance.now();
    const marks = [];
    const measures = Object.create(null);

    function mark(name, detail = ""){
        const now = performance.now();
        const item = {
            name: String(name || "mark"),
            at: Math.round((now - bootAt) * 100) / 100,
            detail: String(detail || "")
        };
        marks.push(item);
        try { performance.mark(`go-chu:${item.name}`); } catch (error) {}
        return item;
    }

    function measure(name, startedAt){
        const duration = Math.max(0, performance.now() - Number(startedAt || 0));
        const key = String(name || "measure");
        if(!measures[key]) measures[key] = { count: 0, total: 0, max: 0, last: 0 };
        const entry = measures[key];
        entry.count += 1;
        entry.total += duration;
        entry.last = duration;
        entry.max = Math.max(entry.max, duration);
        return duration;
    }

    function report(){
        const measureRows = Object.fromEntries(
            Object.entries(measures).map(([key, value]) => [key, {
                count: value.count,
                lastMs: Math.round(value.last * 100) / 100,
                maxMs: Math.round(value.max * 100) / 100,
                avgMs: Math.round((value.total / Math.max(1, value.count)) * 100) / 100
            }])
        );

        return {
            bootElapsedMs: Math.round((performance.now() - bootAt) * 100) / 100,
            marks: marks.slice(),
            measures: measureRows
        };
    }

    function print(){
        const data = report();
        console.group(`⚡ go-chu startup: ${data.bootElapsedMs} ms`);
        console.table(data.marks);
        console.table(Object.entries(data.measures).map(([name, row]) => ({ name, ...row })));
        console.groupEnd();
        return data;
    }

    window.goChuStartupMark = mark;
    window.goChuStartupMeasure = measure;
    window.getGoChuStartupPerformance = report;
    window.printGoChuStartupPerformance = print;
    mark("bootstrap");
})();
