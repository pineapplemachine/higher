import {wrap} from "../core/wrap";

export const countAtLeast = wrap({
    name: "countAtLeast",
    summary: "Get whether the number of elements in a sequence satisfying a predicate is at least some value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence, a predicate
            function, and an integer as input.
        `),
        returns: (`
            The function returns #true when the number of elements in the input
            sequence satisfying the predicate was at least the number given.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage",
        ],
        related: [
            "count", "countEquals", "countLessThan",
            "countGreaterThan", "countAtMost",
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
        // Count is never equal to or greater than Infinity, NaN, or undefined.
        if(!isFinite(count) || (!count && count !== 0)) return false;
        // Count is always greater than or equal to zero or a negative number.
        if(count <= 0) return true;
        // Count can never be greater than the input sequence's length.
        if(source.nativeLength && count > source.nativeLength()) return false;
        // None of those conditions were met, so just consume the sequence.
        let i = 0;
        for(const element of source){
            i += !!predicate(element);
            if(i >= count) return true;
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const array = [1, 2, 3, 4, 5, 6];
            hi.assert(hi.countAtLeast(2, array, even));
            hi.assert(hi.countAtLeast(3, array, even));
            hi.assertNot(hi.countAtLeast(4, array, even));
        },
        "noElementsSatisfy": hi => {
            hi.assert(hi.range(12).countAtLeast(0, i => false));
            hi.assert(hi.range(12).countAtLeast(-1, i => false));
            hi.assertNot(hi.range(12).countAtLeast(1, i => false));
            hi.assertNot(hi.range(12).countAtLeast(Infinity, i => false));
            hi.assertNot(hi.range(12).countAtLeast(NaN, i => false));
        },
        "allElementsSatisfy": hi => {
            hi.assert(hi.range(12).countAtLeast(12, i => true));
            hi.assert(hi.range(12).countAtLeast(11, i => true));
            hi.assert(hi.range(12).countAtLeast(0, i => true));
            hi.assert(hi.range(12).countAtLeast(-1, i => true));
            hi.assertNot(hi.range(12).countAtLeast(13, i => true));
            hi.assertNot(hi.range(12).countAtLeast(100, i => true));
            hi.assertNot(hi.range(12).countAtLeast(Infinity, i => true));
            hi.assertNot(hi.range(12).countAtLeast(NaN, i => true));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().countAtLeast(0, i => true));
            hi.assertNot(hi.emptySequence().countAtLeast(1, i => true));
            hi.assertNot(hi.emptySequence().countAtLeast(Infinity, i => true));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().countAtLeast(1, i => true));
        },
    },
});

export default countAtLeast;
