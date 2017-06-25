// Concatenate elements of an input sequence as a string.
hi.register("string", {
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(source){
    let string = "";
    for(let element of source) string += element;
    return string;
});
