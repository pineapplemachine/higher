/**
 * Get the maximum value in a sequence as judged by a comparison function.
 * If no comparison function is provided, then (a, b) => (a < b) is used.
 * @param {*} relate
 * @param {*} source
 * @returns `undefined` when the input sequence was empty.
 */
const max = (relate, source) => {
    const combine = (relate ?
        (a, b) => (relate(b, a) ? a : b) :
        (a, b) => (b < a ? a : b)
    );
    return hi.reduce.raw(combine, source).last();
};

export const registration = {
    name: "max",
    expected: {
        functions: 1,
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: max,
};

export default max;
