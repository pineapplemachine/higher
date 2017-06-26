// Get the first element in a sequence or, if a predicate is passed,
// get the first element meeting that predicate.
// Returns undefined if there was no such element.
hi.register("first", {
    functions: "?",
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
}, function(predicate, source){
    if(predicate){
        for(const element of source){
            if(predicate(element)) return element;
        }
    }else{
        for(const element of source) return element;
    }
    return undefined;
});

// Separate async implementation to handle reject callback when there
// is no first element.
hi.register("firstAsync", {
    functions: "?",
    sequences: 1,
    isAsync: true,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
}, function(predicate, source){
    return new Promise((resolve, reject) => {
        hi.callAsync(() => {
            if(predicate){
                for(const element of source){
                    if(predicate(element)) resolve(element);
                }
            }else{
                for(const element of source) resolve(element);
            }
            reject();
        });
    });
});
