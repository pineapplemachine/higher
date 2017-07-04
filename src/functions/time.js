import Sequence from "../core/sequence";

// Get the amount of time in milliseconds it takes to evaluate a function.
// Uses performance.now where available, otherwise falls back to Date().getTime().
const time = function(call, ...args){
    if(performance){
        const start = performance.now();
        call(...args);
        return performance.now() - start;
    }else{
        const start = new Date().getTime();
        call(...args);
        return new Date().getTime() - start;
    }
};

// Asynchronously determine the amount of time in milliseconds it takes to
// evaluate a function.
const timeAsync = function(call, ...args){
    return new hi.Promise((resolve, reject) => {
        hi.callAsync(() => resolve(time(call, ...args)));
    });
};

// Get the amount of time in milliseconds it takes to consume a sequence.
// Calls the sequence's first method once per element.
Sequence.prototype.time = function(){
    return time(() => {
        while(!this.done()) this.nextFront();
    });
};

// Asynchronously get the amount of time in milliseconds it takes to consume
// a sequence. Calls the sequence's first method once per element.
Sequence.prototype.timeAsync = function(){
    return timeAsync(() => {
        while(!this.done()) this.nextFront();
    });
};

export default {time, timeAsync};
