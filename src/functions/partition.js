hi.register("partition", {
    functions: 1,
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(predicate, source){
    if(!validAsBoundedSequence(source)){
        throw "Failed to partition sequence: Can't partition an unbounded sequence.";
    }
    let a = [];
    let b = [];
    for(let element of source){
        if(predicate(element)) a.push(element);
        else b.push(element);
    }
    return [a, b];
});
