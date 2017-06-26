// Produce a fully in-memory array from the contents of a sequence.
// Optionally accepts a numeric argument indicating the maximum number of
// elements to output to the array.
// Will throw an error if the function receives an unbounded sequence and
// no length limit.
// When the input is an array, returns a copy of that array.
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
        if(hi.isArray(source)){
            return source.slice();
        }
        if(!source.bounded()){
            throw hi.internal.unboundedError("write", "array");
        }
        const result = [];
        for(const element of source){
            result.push(element);
        }
        return result;
    }else{
        if(hi.isArray(source)) return source.slice(
            0, limit < source.length ? limit : source.length
        );
        const result = [];
        let i = 0;
        for(const element of source){
            if(i++ >= limit) break;
            result.push(element);
        }
        return result;
    }
});
