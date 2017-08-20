import {wrap} from "../core/wrap";

export const countEquals = wrap({
    name: "countEquals",
    summary: "Get whether the number of elements in a sequence satisfying a predicate is equal to some value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence, a predicate
            function, and an integer as input.
        `),
        returns: (`
            The function returns #true when the number of elements in the input
            sequence satisfying the predicate was exactly equal to the number
            given.
        `),
        returnType: "number",
        examples: [
            "basicUsage",
        ],
        related: [
            "count", "countLessThan", "countGreaterThan",
            "countAtLeast", "countAtMost",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            numbers: 1,
            functions: {one: wrap.expecting.predicate},
            sequences: {one: wrap.expecting.boundedSequence},
        }
    },
    implementation: (count, predicate, source) => {
        // Count is never negative, infinite, or NaN or undefined.
        if(count < 0 || !isFinite(count) || (!count && count !== 0)) return false;
        // Count must always be less than the input sequence's length.
        if(source.nativeLength && count > source.length()) return false;
        // None of those conditions were met, so just consume the sequence.
        let i = 0;
        for(const element of source){
            i += !!predicate(element);
            if(i > count) return false;
        }
        return i === count;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5, 6];
            const even = i => i % 2 === 0;
            const lessThanFive = i => i < 5;
            hi.assert(hi.countEquals(3, array, even));
            hi.assert(hi.countEquals(4, array, lessThanFive));
        },
        "noElementsSatisfy": hi => {
            hi.assert(hi.range(12).countEquals(0, i => false));
            hi.assertNot(hi.range(12).countEquals(2, i => false));
        },
        "allElementsSatisfy": hi => {
            hi.assert(hi.range(12).countEquals(12, i => true));
            hi.assertNot(hi.range(12).countEquals(0, i => true));
            hi.assertNot(hi.range(12).countEquals(11, i => true));
            hi.assertNot(hi.range(12).countEquals(13, i => true));
            hi.assertNot(hi.range(12).countEquals(Infinity, i => true));
            hi.assertNot(hi.range(12).countEquals(NaN, i => true));
            hi.assertNot(hi.range(12).countEquals(-1, i => true));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().countEquals(0, i => true));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().countEquals(1, i => true));
        },
    },
});

export default countEquals;
