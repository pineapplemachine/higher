// Produce a fully in-memory array from the contents of a sequence.
// Optionally accepts a numeric argument indicating the maximum number of
// elements to output to the array.
// Will throw an error if the function receives an unbounded sequence and
// no length limit.
hi.register("array", {
    numbers: "?",
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(limit, source){
    if(limit <= 0){
        return [];
    }else if(!limit){
        if(!source.bounded()){
            throw sequenceBoundsError("write", "array");
        }
        let result = [];
        for(let element of source){
            result.push(element);
        }
        return result;
    }else{
        let result = [];
        let i = 0;
        for(let element of source){
            if(i++ >= limit) break;
            result.push(element);
        }
        return result;
    }
});
