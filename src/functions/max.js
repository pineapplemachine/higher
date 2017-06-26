// Get the maximum value in a sequence as judged by a comparison function
// If no comparison function is provided, then (a, b) => (a < b) is used.
// Returns undefined when the input sequence was empty.
hi.register("max", {
    functions: 1,
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(compare, source){
    const combine = (compare ?
        (a, b) => (compare(b, a) ? a : b) :
        (a, b) => (b < a ? a : b)
    );
    return hi.reduce.raw(combine, source).last();
});
