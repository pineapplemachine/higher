/**
 * Get the product of the numbers in a sequence.
 * @param {*} source
 * @returns 1 when the input is empty.
 */
const product = (source) => {
    let prod = 1;
    for(const value of source) prod *= value;
    return prod;
};

export const registration = {
    name: "product",
    expected: {
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: product,
};

export default product;
