// Get the time in milliseconds it takes to call a function a given number of
// times.
const benchmark = function(count, call, ...args){
    return hi.time(() => {
        for(let i = 0; i < count; i++) call(...args);
    });
};

const benchmarkAsync = function(count, call, ...args){
    return hi.timeAsync(() => {
        for(let i = 0; i < count; i++) call(...args);
    });
};

export default {benchmark, benchmarkAsync};
