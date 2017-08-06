import {wrap} from "../core/wrap";

export const countGreaterThan = wrap({
    name: "countGreaterThan",
    summary: "Get whether the number of elements in a sequence satisfying a predicate is greater than some value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence, a predicate
            function, and an integer as input.
        `),
        returns: (`
            The function returns #true when the number of elements in the input
            sequence satisfying the predicate was greater than the number given.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage",
        ],
        related: [
            "count", "countEquals", "countLessThan", "countAtLeast", "countAtMost",
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
        // Count is never greater than Infinity, NaN, or undefined.
        if(!isFinite(count) || (!count && count !== 0)) return false;
        // Count is always greater than a negative number.
        if(count < 0) return true;
        // Count can never be greater than the input sequence's length.
        if(source.length && count >= source.length()) return false;
        // None of those conditions were met, so just consume the sequence.
        let i = 0;
        for(const element of source){
            i += !!predicate(element);
            if(i > count) return true;
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const array = [1, 2, 3, 4, 5, 6];
            hi.assert(hi.countGreaterThan(2, array, even));
            hi.assertNot(hi.countGreaterThan(3, array, even));
        },
        "noElementsSatisfy": hi => {
            hi.assertNot(hi.range(12).countGreaterThan(0, i => false));
            hi.assertNot(hi.range(12).countGreaterThan(1, i => false));
            hi.assertNot(hi.range(12).countGreaterThan(Infinity, i => false));
            hi.assertNot(hi.range(12).countGreaterThan(NaN, i => false));
            hi.assert(hi.range(12).countGreaterThan(-1, i => false));
        },
        "allElementsSatisfy": hi => {
            hi.assert(hi.range(12).countGreaterThan(11, i => true));
            hi.assert(hi.range(12).countGreaterThan(0, i => true));
            hi.assert(hi.range(12).countGreaterThan(-1, i => true));
            hi.assertNot(hi.range(12).countGreaterThan(12, i => true));
            hi.assertNot(hi.range(12).countGreaterThan(13, i => true));
            hi.assertNot(hi.range(12).countGreaterThan(100, i => true));
            hi.assertNot(hi.range(12).countGreaterThan(Infinity, i => true));
            hi.assertNot(hi.range(12).countGreaterThan(NaN, i => true));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().countGreaterThan(-1, i => true));
            hi.assertNot(hi.emptySequence().countGreaterThan(0, i => true));
            hi.assertNot(hi.emptySequence().countGreaterThan(Infinity, i => true));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().countGreaterThan(1, i => true));
        },
    },
});

export default countGreaterThan;
