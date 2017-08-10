import {wrap} from "../core/wrap";

export const defaultLexOrderOrder = (a, b) => (a > b) - (a < b);

// Get the lexicographic ordering of two sequences.
// Returns +1 when the first input follows the second.
// Returns 0 when the inputs are equal.
// Returns -1 when the first input precedes the second.
export const lexOrder = wrap({
    name: "lexOrder",
    summary: "Get the lexicographic ordering of two sequences.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        details: (`
            This function is an [ordering function] which describes a
            lexicographic ordering of sequences.
        `),
        expects: (`
            The function expects two sequences as input and an optional
            [ordering function].
            When no ordering function was given, \`(a > b) - (a < b)\` is used
            as a default.
        `),
        returns: (`
            The function returns [#-1] when the first input sequence preceded
            the second, [#+1] when the first sequence followed the second, and
            #0 when the input sequences were equivalent.
        `),
        warnings: (`
            This function will produce an infinite loop when the input sequences
            are equivalent and both unbounded.
        `),
        returnType: "number",
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.ordering},
            sequences: 2,
        }
    },
    implementation: (order, sequences) => {
        const orderFunc = order || defaultLexOrderOrder;
        const a = sequences[0];
        const b = sequences[1];
        for(const element of b){
            if(a.done()) return -1;
            const cmp = orderFunc(a.nextFront(), element);
            if(cmp != 0) return cmp;
        }
        return a.done() ? 0 : 1;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.lexOrder([1, 1, 0], [1, 1, 1]) < 0);
            hi.assert(hi.lexOrder([1, 1, 1], [1, 0, 0]) > 0);
            hi.assert(hi.lexOrder([1, 1, 1], [1, 1, 1]) === 0);
        },
        "stringInputs": hi => {
            hi.assert(hi.lexOrder("ab", "abc") === -1);
            hi.assert(hi.lexOrder("abc", "ab") === +1);
            hi.assert(hi.lexOrder("abc", "abx") === -1);
            hi.assert(hi.lexOrder("abx", "abc") === +1);
            hi.assert(hi.lexOrder("abc", "abc") === 0);
        },
        "emptyInputs": hi => {
            hi.assert(hi.lexOrder(hi.emptySequence(), [1]) === -1);
            hi.assert(hi.lexOrder([1], hi.emptySequence()) === +1);
            hi.assert(hi.lexOrder(hi.emptySequence(), hi.emptySequence()) === 0);
        },
    },
});

export default lexOrder;
