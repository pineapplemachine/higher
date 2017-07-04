// Find the last occurrence of a substring as judged by a comparison function.
// When no comparison function is given, (a, b) => (a == b) is used as a default.
hi.register("findLast", {
    functions: "?",
    sequences: 2,
    // Also generate an async version of this function
    async: true,
}, function(compare, sequences){
    const source = sequences[0];
    const search = sequences[1];
    const compareFunc = compare || hi.defaultComparisonFunction;
    // Handle empty or unbounded search subject
    if(search.done() || search.unbounded()){
        return undefined;
    }
    // Handle case where search length is known to be at least source length
    if(search.length && hi.canGetLength(source)){
        const searchLength = search.length();
        const sourceLength = hi.getLength(source);
        if(searchLength === sourceLength && hi.equals.raw(compareFunc, [search, source])){
            return new hi.FindSequenceResult(hi.asSequence(source), 0, sourceLength);
        }else if(searchLength > sourceLength){
            return undefined;
        }
    }
    // Source sequence absolutely must be bidirectional and have known length
    if(!source.length || !source.back){
        source.forceEager();
    }
    // Search sequence absolutely must be copyable and bidirectional
    if(!search.copy || !search.back){
        search.forceEager();
    }
    const searchElement = search.nextBack();
    // Handle single-element search subject
    if(search.done()){
        let index = 0;
        while(!source.done()){
            if(compareFunc(source.nextBack(), searchElement)){
                return new hi.FindSequenceResult(
                    source, index, index + 1
                );
            }
            index++;
        }
        return undefined;
    }
    // Handle search subject of two or more elements
    const findObject = {
        threadType: hi.BackwardFindSequenceThread,
        stepThreads: hi.stepFindThreads,
        compare: compareFunc,
        source: source,
        search: search,
        searchElement: searchElement,
        nextSearchElement: search.nextBack(),
        searchThreads: [],
        index: source.length(),
    };
    while(!source.done()){
        const result = findObject.stepThreads(source.nextBack());
        if(result) return result;
        findObject.index--;
    }
    return undefined;
});

// Finding the first instance of a substring is overwhelmingly the most
// common use case for substring searching, so alias "find" to "findFirst"
// for maximum user convenience and minimum user confusion.
hi.alias("find", "findFirst");
