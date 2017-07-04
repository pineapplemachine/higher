/**
 * Get the lexicographic ordering of two sequences.
 * Returns +1 when the first input follows the second.
 * Returns 0 when the inputs are equal.
 * Returns -1 when the first input precedes the second.
 * @param {*} order
 * @param {*} sequences
 */
const lexOrder = (order, sequences) => {
    const orderFunc = order || ((a, b) => (a < b ? -1 : (a > b) ? +1 : 0));
    const a = hi.asSequence(sequences[0]);
    const b = sequences[1];
    for(const element of b){
        if(a.done()) return -1;
        const cmp = orderFunc(a.nextFront(), element);
        if(cmp != 0) return cmp;
    }
    return a.done() ? 0 : 1;
};

export const registration = {
    name: "lexOrder",
    expected: {
        functions: "?",
        sequences: 2,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: lexOrder,
};

export default lexOrder;
