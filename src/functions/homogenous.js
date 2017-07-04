hi.register("homogenous", {
    functions: "?",
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(compare, source){
    const compareFunc = compare || hi.defaultComparisonFunction;
    let first = true;
    let firstElement = null;
    for(const element of source){
        if(first){
            firstElement = element;
            first = false;
        }else if(!compareFunc(element, firstElement)){
            return false;
        }
    }
    return true;
});
