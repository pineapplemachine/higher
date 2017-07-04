// Find the first occurrence of a substring as judged by a comparison function.
// When no comparison function is given, (a, b) => (a == b) is used as a default.
hi.register("findFirst", {
    functions: "?",
    sequences: 2,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(compare, sequences){
    const source = sequences[0];
    const search = hi.asSequence(sequences[1]);
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
    // Search sequence absolutely must be copyable
    if(!search.copy){
        search.forceEager();
    }
    const searchElement = search.nextFront();
    // Handle single-element search subject
    if(search.done()){
        let index = 0;
        for(const element of source){
            if(compareFunc(element, searchElement)){
                return new hi.FindSequenceResult(
                    hi.asSequence(source), index, index + 1
                );
            }
            index++;
        }
        return undefined;
    }
    // Handle search subject of two or more elements
    const findObject = {
        threadType: hi.ForwardFindSequenceThread,
        stepThreads: hi.stepFindThreads,
        compare: compareFunc,
        source: source,
        search: search,
        searchElement: searchElement,
        nextSearchElement: search.nextFront(),
        searchThreads: [],
        index: 0,
    };
    for(const element of source){
        const result = findObject.stepThreads(element);
        if(result){
            result.source = hi.asSequence(source);
            return result;
        }
        findObject.index++;
    }
    return undefined;
});

// Finding the first instance of a substring is overwhelmingly the most
// common use case for substring searching, so alias "find" to "findFirst"
// for maximum user convenience and minimum user confusion.
hi.alias("find", "findFirst");
