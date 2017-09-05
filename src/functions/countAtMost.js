import {wrap} from "../core/wrap";

export const countAtMost = wrap({
    name: "countAtMost",
    summary: "Get whether the number of elements in a sequence satisfying a predicate is at most some value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence, a predicate
            function, and an integer as input.
        `),
        returns: (`
            The function returns #true when the number of elements in the input
            sequence satisfying the predicate was no more than the number given.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage",
        ],
        related: [
            "count", "countEquals", "countLessThan",
            "countGreaterThan", "countAtLeast",
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
        // Count is never equal to or less than NaN, undefined, or a negative number.
        if(count < 0 || (!count && count !== 0)) return false;
        // Count is always less than infinity.
        if(!isFinite(count)) return true;
        // Count is always less than or equal to the input sequence's length.
        if(source.nativeLength && count >= source.nativeLength()) return true;
        // None of those conditions were met, so just consume the sequence.
        let i = 0;
        for(const element of source){
            i += !!predicate(element);
            if(i > count) return false;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const array = [1, 2, 3, 4, 5, 6];
            hi.assert(hi.countAtMost(4, array, even));
            hi.assert(hi.countAtMost(5, array, even));
            hi.assertNot(hi.countAtMost(2, array, even));
        },
        "noElementsSatisfy": hi => {
            hi.assert(hi.range(12).countAtMost(0, i => false));
            hi.assert(hi.range(12).countAtMost(12, i => false));
            hi.assert(hi.range(12).countAtMost(13, i => false));
            hi.assert(hi.range(12).countAtMost(Infinity, i => false));
            hi.assertNot(hi.range(12).countAtMost(-1, i => false));
            hi.assertNot(hi.range(12).countAtMost(NaN, i => false));
        },
        "allElementsSatisfy": hi => {
            hi.assert(hi.range(12).countAtMost(12, i => true));
            hi.assert(hi.range(12).countAtMost(13, i => true));
            hi.assert(hi.range(12).countAtMost(100, i => true));
            hi.assert(hi.range(12).countAtMost(Infinity, i => true));
            hi.assertNot(hi.range(12).countAtMost(0, i => true));
            hi.assertNot(hi.range(12).countAtMost(-1, i => true));
            hi.assertNot(hi.range(12).countAtMost(NaN, i => true));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().countAtMost(0, i => true));
            hi.assert(hi.emptySequence().countAtMost(10, i => true));
            hi.assertNot(hi.emptySequence().countAtMost(-1, i => true));
            hi.assertNot(hi.emptySequence().countAtMost(NaN, i => true));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().countAtMost(1, i => true));
        },
    },
});

export default countAtMost;
