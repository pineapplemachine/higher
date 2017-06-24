hi.register("consume", {
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(source){
    if(isSequence(source)){
        while(!source.done()) source.popFront();
    }else{
        for(let element of source){}
    }
});
