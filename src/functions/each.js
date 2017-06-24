hi.register("each", {
    functions: 1,
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(callback, source){
    for(let element of source){
        callback(element);
    }
    return source;
});
