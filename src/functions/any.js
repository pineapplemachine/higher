import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const any = wrap({
    name: "any",
    summary: "Get whether any elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether any of the elements in an input sequence satisfy an
            optional predicate or, if no predicate was provided, whether any
            elements of the input are truthy.
        `),
        expects: (`
            The function expects as input a sequence known to be bounded and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns @true when any element in the sequence
            satisfied the predicate or, if no predicate was given, if any of the
            elements were truthy. The function returns @false otherwise, or
            if the sequence was empty.
        `),
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "all", "none",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.predicate},
            sequences: {one: wrap.expecting.boundedSequence},
        },
    },
    implementation: (predicate, source) => {
        if(predicate){
            for(const element of source){
                if(predicate(element)) return true;
            }
        }else{
            for(const element of source){
                if(element){
                    return element;
                }
            }
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.any([true, false, true, false]));
            hi.assertNot(hi.any([false, 0, null]));
        },
        "basicUsagePredicate": (hi) => {
            const strings = ["hello", "world", "how", "are", "you"];
            hi.assert(hi.any(strings, (i) => i.startsWith("h"))); // "hello" starts with "h"
            hi.assertNot(hi.any(strings, (i) => i.startsWith("x"))); // None start with "x"
        },
        "allSatisfy": hi => {
            hi.assert(hi.any([1, true, "yes"]));
            hi.assert(hi.any(i => i % 2 === 0, [0, 0, 0, 2]));
        },
        "someSatisfy": hi => {
            hi.assert(hi.any([1, 2, false]));
            hi.assert(hi.any(i => i % 2 === 0, [0, 2, 3, 4, 5]));
        },
        "noneSatisfy": hi => {
            hi.assertNot(hi.any([0, null, false]));
            hi.assertNot(hi.any(i => i % 2 === 0, [1, 3, 9, 11]));
        },
        "emptyInput": hi => {
            hi.assertNot(hi.any([]));
            hi.assertNot(hi.any(i => true, []));
            hi.assertNot(hi.any(i => false, []));
        },
        "notKnownBoundedInput": (hi) => {
            hi.assertFail(() => hi.counter().until((i) => i === 100).any());
        },
        "unboundedInput": (hi) => {
            hi.assertFail(() => hi.repeatElement(0).any());
        },
    },
});

export default any;
