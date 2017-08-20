import {wrap} from "../core/wrap";

export const countLessThan = wrap({
    name: "countLessThan",
    summary: "Get whether the number of elements in a sequence satisfying a predicate is less than some value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence, a predicate
            function, and an integer as input.
        `),
        returns: (`
            The function returns #true when the number of elements in the input
            sequence satisfying the predicate was less than the number given.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage",
        ],
        related: [
            "count", "countEquals", "countGreaterThan",
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
        // Count is never less than zero or a negative number, or NaN or undefined.
        if(count <= 0 || (!count && count !== 0)) return false;
        // Count is always less than infinity.
        if(!isFinite(count)) return true;
        // Count must always be less than the input sequence's length.
        if(source.nativeLength && count > source.length()) return true;
        // None of those conditions were met, so just consume the sequence.
        let i = 0;
        for(const element of source){
            i += !!predicate(element);
            if(i >= count) return false;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const array = [1, 2, 3, 4, 5, 6];
            hi.assert(hi.countLessThan(4, array, even));
            hi.assertNot(hi.countLessThan(3, array, even));
        },
        "noElementsSatisfy": hi => {
            hi.assert(hi.range(12).countLessThan(1, i => false));
            hi.assertNot(hi.range(12).countLessThan(0, i => false));
        },
        "allElementsSatisfy": hi => {
            hi.assert(hi.range(12).countLessThan(13, i => true));
            hi.assert(hi.range(12).countLessThan(Infinity, i => true));
            hi.assertNot(hi.range(12).countLessThan(12, i => true));
            hi.assertNot(hi.range(12).countLessThan(11, i => true));
            hi.assertNot(hi.range(12).countLessThan(1, i => true));
            hi.assertNot(hi.range(12).countLessThan(0, i => true));
            hi.assertNot(hi.range(12).countLessThan(-1, i => true));
            hi.assertNot(hi.range(12).countLessThan(NaN, i => true));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().countLessThan(1, i => true));
            hi.assert(hi.emptySequence().countLessThan(Infinity, i => true));
            hi.assertNot(hi.emptySequence().countLessThan(0, i => true));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().countLessThan(1, i => true));
        },
    },
});

export default countLessThan;
