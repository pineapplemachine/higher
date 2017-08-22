import {wrap} from "../core/wrap";

export const defaultMaxRelation = (a, b) => (a < b);

export const max = wrap({
    name: "max",
    summary: "Get the maximum element in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as input and an optional
            [relational function].
            When no relational function was given, \`a < b\` is used as a default.
        `),
        returns: (`
            The function returns the maximum element in the sequence according
            to the relational function. Functionally, this would be the same
            as [stable-sorting](stable sort) the sequence according to that
            function and taking its back element.
        `),
        related: [
            "min",
        ],
        examples: [
            "basicUsage", "withRelationalFunction"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.relation},
            sequences: {one: wrap.expecting.boundedSequence},
        },
    },
    implementation: (relate, source) => {
        const relateFunc = relate || defaultMaxRelation;
        let max = undefined;
        let first = true;
        for(const element of source){
            if(first){
                max = element;
                first = false;
            }else if(relateFunc(max, element)){
                max = element;
            }
        }
        return max;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.max([1, 2, 3, 4, 5]) === 5);
        },
        "withRelationalFunction": hi => {
            const strings = ["hello", "how", "goes", "it"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.max(strings, byLength) === "hello");
        },
        "stability": hi => {
            const strings = ["abc", "hello", "xyz", "world"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.max(strings, byLength) === "hello");
            hi.assert(hi.reverse(strings).max(byLength) === "world");
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().max());
        },
        "notKnownBoundedInput": hi => {
            hi.assertFail(() => hi.counter().until(i => i === 20).max());
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().max());
        },
    },
});

export default max;
