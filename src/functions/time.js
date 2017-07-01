// Get the amount of time in milliseconds it takes to evaluate a function.
// Uses performance.now where available, otherwise falls back to Date().getTime().
hi.time = function(call, ...args){
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
hi.timeAsync = function(call, ...args){
    return new hi.Promise((resolve, reject) => {
        hi.callAsync(() => resolve(hi.time(call, ...args)));
    });
};

// Get the amount of time in milliseconds it takes to consume a sequence.
// Calls the sequence's first method once per element.
hi.Sequence.prototype.time = function(){
    return hi.time(() => {
        while(!this.done()) this.nextFront();
    });
};

// Asynchronously get the amount of time in milliseconds it takes to consume
// a sequence. Calls the sequence's first method once per element.
hi.Sequence.prototype.timeAsync = function(){
    return hi.timeAsync(() => {
        while(!this.done()) this.nextFront();
    });
};
