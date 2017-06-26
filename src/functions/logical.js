// Get whether any element in a sequence matches a predicate or,
// if no predicate is provided, whether any of the elements are truthy.
// With no predicate, returns the first truthy element, or false if there
// is no truthy element.
// Returns false when the input is an empty sequence.
hi.register("any", {
    functions: "?",
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(predicate, source){
    if(predicate){
        for(const element of source){
            if(predicate(element)) return true;
        }
    }else{
        for(const element of source){
            if(element) return element;
        }
    }
    return false;
});

// Get whether all elements in a sequence match a predicate or,
// if no predicate is provided, whether all the elements are truthy.
// Returns true when the input is an empty sequence.
hi.register("all", {
    functions: "?",
    sequences: 1,
    allowIterables: true,
    async: true,
}, function(predicate, source){
    if(predicate){
        for(const element of source){
            if(!predicate(element)) return false;
        }
    }else{
        for(const element of source){
            if(!element) return false;
        }
    }
    return true;
});

// Get whether none of the elements in a sequence match a predicate or,
// if no predicate is provided, whether all the elements are falsey.
// Returns true when the input is an empty sequence.
hi.register("none", {
    functions: "?",
    sequences: 1,
    allowIterables: true,
    async: true,
}, function(predicate, source){
    if(predicate){
        for(const element of source){
            if(predicate(element)) return false;
        }
    }else{
        for(const element of source){
            if(element) return false;
        }
    }
    return true;
});
