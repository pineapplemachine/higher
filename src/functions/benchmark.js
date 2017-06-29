// Get the time in milliseconds it takes to call a function a given number of
// times.
hi.benchmark = function(count, call, ...args){
    return hi.time(() => {
        for(let i = 0; i < count; i++) call(...args);
    });
};

hi.benchmarkAsync = function(count, call, ...args){
    return hi.timeAsync(() => {
        for(let i = 0; i < count; i++) call(...args);
    });
};
