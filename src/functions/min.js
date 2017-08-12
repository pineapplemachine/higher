import {wrap} from "../core/wrap";

export const defaultMinRelation = (a, b) => (a < b);

export const min = wrap({
    name: "min",
    summary: "Get the minimum element in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as input and an optional
            [relational function].
            When no relational function was given, \`a < b\` is used as a default.
        `),
        returns: (`
            The function returns the minimum element in the sequence according
            to the relational function. Functionally, this would be the same
            as [stable-sorting](stable sort) the sequence according to that
            function and taking its front element.
        `),
        related: [
            "max"
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
        const relateFunc = relate || defaultMinRelation;
        let min = undefined;
        let first = true;
        for(const element of source){
            if(first){
                min = element;
                first = false;
            }else if(relateFunc(element, min)){
                min = element;
            }
        }
        return min;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.min([5, 4, 3, 2, 1]) === 1);
        },
        "withRelationalFunction": hi => {
            const strings = ["hello", "how", "goes", "it"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.min(strings, byLength) === "it");
        },
        "stability": hi => {
            const strings = ["abc", "hello", "xyz", "world"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.min(strings, byLength) === "abc");
            hi.assert(hi.reverse(strings).min(byLength) === "xyz");
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().min());
        },
        "notKnownBoundedInput": hi => {
            hi.assertFail(() => hi.counter().until(i => i === 20).min());
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().min());
        },
    },
});

export default min;
