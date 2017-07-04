hi.register("write", {
    numbers: "?",
    sequences: 2,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(limit, sequences){
    const source = sequences[0];
    const target = sequences[1];
    if(!hi.isArray(target)){
        throw "Failed to write sequence because the target isn't an array.";
    }
    const iter = source.next ? source : source[Symbol.iterator]();
    let i = 0;
    if(limit === 0){
        // Do nothing
    }else if(!limit){
        if(!source.bounded()){
            throw hi.internal.unboundedError("write", "write");
        }
        let item = iter.next();
        while(!item.done && i < target.length){
            target[i++] = item.value;
            item = iter.next();
        }
        while(!item.done){
            target.push(item.value);
            item = iter.next();
        }
    }else{
        let item = iter.next();
        const firstLimit = target.length < limit ? target.length : limit;
        while(!item.done && i < firstLimit){
            target[i++] = item.value;
            item = iter.next();
        }
        while(!item.done && i < limit){
            target.push(item.value);
            item = iter.next();
            i++;
        }
    }
    return target;
});
