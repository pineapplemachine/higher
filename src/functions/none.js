import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const none = wrap({
    name: "none",
    summary: "Get whether none of the elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether none of the elements in an input sequence satisfy an
            optional predicate or, if no predicate was provided, whether all
            the elements of the input are falsey.
        `),
        expects: (`
            The function expects as input a known-bounded sequence and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns #false when any element in the sequence
            satisfied the predicate or, if no predicate was given, if any
            of the elements were truthy. The function returns #true otherwise,
            including if the input sequence was empty.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "all", "none", "nonePass",
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
                if(predicate(element)) return false;
            }
        }else{
            for(const element of source){
                if(element) return false;
            }
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.none([false, false, false]));
            hi.assertNot(hi.none([false, false, true]));
        },
        "basicUsagePredicate": (hi) => {
            const odd = i => i % 2 === 1;
            hi.assert(hi.none(odd, [2, 4, 6, 8, 10]));
            hi.assertNot(hi.none(odd, [1, 2, 3, 4, 5]));
        },
        "allSatisfy": hi => {
            hi.assertNot(hi.none([1, true, "yes"]));
            hi.assertNot(hi.none(i => i % 2 === 0, [0, 0, 0, 2]));
        },
        "someSatisfy": hi => {
            hi.assertNot(hi.none([1, 2, false]));
            hi.assertNot(hi.none(i => i % 2 === 0, [0, 2, 3, 4, 5]));
        },
        "noneSatisfy": hi => {
            hi.assert(hi.none([0, null, false]));
            hi.assert(hi.none(i => i % 2 === 0, [1, 3, 9, 11]));
        },
        "emptyInput": hi => {
            hi.assert(hi.none([]));
            hi.assert(hi.none(i => true, []));
            hi.assert(hi.none(i => false, []));
        },
        "notKnownBoundedInput": (hi) => {
            hi.assertFail(() => hi.counter().until((i) => i === 100).none());
        },
        "unboundedInput": (hi) => {
            hi.assertFail(() => hi.repeatElement(0).none());
        },
    },
});

export default none;
