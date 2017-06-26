// Get the product of the numbers in a sequence.
// Returns 1 when the input is empty.
hi.register("product", {
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
    // Also generate an async version of this function
    async: true,
}, function(source){
    let product = 1;
    for(const value of source) product *= value;
    return product;
});
