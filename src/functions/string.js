// Concatenate elements of an input sequence as a string.
hi.register("string", {
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(source){
    if(!hi.validAsBoundedSequence(source)){
        throw "Failed to create string: Input sequence is not known to be bounded.";
    }
    let string = "";
    for(const element of source) string += element;
    return string;
});
