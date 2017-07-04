// Determine equality of one or more sequences given a comparison function.
// When only one sequence is given as input, the output is always true.
// When no comparison function is given, (a, b) => (a === b) is used as a default.
hi.register("endsWith", {
    functions: "?",
    sequences: 2,
    // Also generate an async version of this function
    async: true,
}, function(compare, sources){
    const source = sources[0];
    const search = sources[1];
    if(source.length && search.length){
        // Can't end with a sequence longer than the sequence itself.
        if(source.length() < search.length()) return false;
    }
    // If either input isn't bidirectional, it needs to be fully in memory.
    if(!source.back) source.forceEager();
    if(!search.back) search.forceEager();
    const compareFunc = compare || hi.defaultComparisonFunction;
    while(!search.done()){
        if(source.done() || !compareFunc(source.nextBack(), search.nextBack())){
            return false;
        }
    }
    return true;
});
