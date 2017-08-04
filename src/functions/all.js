import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const all = wrap({
    name: "all",
    summary: "Get whether all elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether all the elements in an input sequence satisfy an
            optional predicate or, if no predicate was provided, whether all
            the elements of the input are truthy.
        `),
        expects: (`
            The function expects as input a sequence known to be bounded and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns @true when all the elements in the sequence
            satisfied the predicate or, if no predicate was given, if all the
            elements were truthy.
            It also returns @true if the sequence was empty.
            The function returns the first falsey element otherwise.
        `),
        returnType: {
            "typeof first falsey element": (`
                When no predicate was given and any element of the input
                sequence was falsey.
            `),
            "false": (`
                When a predicate was given and any element of the input
                sequence did not satisfy the predicate.
            `),
            "true": (`
                When no predicate was given and all elements of the input
                were truthy, or when a predicate was given and all elements
                satisfied it, or when the input sequence was empty.
            `),
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "any", "none",
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
                if(!predicate(element)) return false;
            }
        }else{
            for(const element of source){
                if(!element) return element;
            }
        }
        return true;
    },
    tests: {
        "basicUsage": hi => {
            hi.assert(hi.all([true, true, true]));
            hi.assertNot(hi.all([true, false]));
        },
        "basicUsagePredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assert(hi.all(even, [2, 4, 6, 8, 10]));
            hi.assertNot(hi.all(even, [1, 2, 3, 4, 5]));
        },
        "allSatisfy": hi => {
            hi.assert(hi.all([1, true, "yes"]));
            hi.assert(hi.all(i => i % 2 === 0, [0, 0, 0, 2]));
        },
        "someSatisfy": hi => {
            hi.assertNot(hi.all([1, 2, false]));
            hi.assertNot(hi.all(i => i % 2 === 0, [0, 2, 3, 4, 5]));
        },
        "noneSatisfy": hi => {
            hi.assertNot(hi.all([0, null, false]));
            hi.assertNot(hi.all(i => i % 2 === 0, [1, 3, 9, 11]));
        },
        "emptyInput": hi => {
            hi.assert(hi.all([]));
            hi.assert(hi.all(i => true, []));
            hi.assert(hi.all(i => false, []));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().all(i => i < 100));
        },
    },
});

export default all;
