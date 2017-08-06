import {wrap} from "../core/wrap";

export const count = wrap({
    name: "count",
    summary: "Get the number of elements in a sequence that satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence and a predicate
            function as input.
        `),
        returns: (`
            The function returns the number of elements in the input sequence
            which satisfied the predicate.
            The function returns #0 when the input sequence was empty.
        `),
        developers: (`
            When the purpose of finding the count is to compare it to some
            number, consider using @countEquals, @countLessThan, @countGreaterThan,
            @countAtLeast, and @countAtMost instead. Where this function must
            always fully consume the input sequence, those companion functions
            are not always so compelled.
        `),
        returnType: "number",
        examples: [
            "basicUsage",
        ],
        related: [
            "countBy", "countEquals", "countLessThan",
            "countGreaterThan", "countAtLeast", "countAtMost",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {one: wrap.expecting.predicate},
            sequences: {one: wrap.expecting.boundedSequence},
        }
    },
    implementation: (predicate, source) => {
        let i = 0;
        for(const element of source) i += !!predicate(element);
        return i;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const lessThanFive = i => i < 5;
            const array = [1, 2, 3, 4, 5, 6];
            hi.assert(hi.count(array, even) === 3);
            hi.assert(hi.count(array, lessThanFive) === 4);
        },
        "noElementsSatisfy": hi => {
            hi.assert(hi.range(12).count(i => false) === 0);
        },
        "allElementsSatisfy": hi => {
            hi.assert(hi.range(12).count(i => true) === 12);
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().count(i => true) === 0);
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().count(i => true));
        },
    },
});

export default count;
