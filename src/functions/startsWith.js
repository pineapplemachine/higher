// Determine equality of one or more sequences given a comparison function.
// When only one sequence is given as input, the output is always true.
// When no comparison function is given, (a, b) => (a == b) is used as a default.
hi.register("startsWith", {
    functions: "?",
    sequences: 2,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(compare, sources){
    const source = sources[0];
    const search = sources[1];
    if(hi.canGetLength(source) && hi.canGetLength(search)){
        // Can't start with a sequence longer than the sequence itself.
        if(hi.getLength(source) < hi.getLength(search)) return false;
    }
    const sequence = hi.asSequence(source);
    const compareFunc = compare || ((a, b) => (a == b));
    for(const element of search){
        if(sequence.done() || !compareFunc(sequence.nextFront(), element)){
            return false;
        }
    }
    return true;
});
