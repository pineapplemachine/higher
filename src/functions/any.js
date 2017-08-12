import {wrap} from "../core/wrap";

export const any = wrap({
    name: "any",
    summary: "Get whether any elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether any of the elements in an input sequence satisfy an
            optional predicate or, if no predicate was provided, whether any
            elements of the input are truthy.
            Behaves like the \`||\` operator.
        `),
        expects: (`
            The function expects as input a known-bounded sequence and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns the first truthy element or, if there was no
            truthy element, the last falsey element when no predicate was given.
            It returns the first truthy predicate return value or, if the
            predicate was not satisfied by any element, the last falsey
            return value when a predicate was specified.
            The function returns #undefined when the input sequence was empty.
        `),
        returnType: {
            "typeof first truthy element": (`
                When no predicate was given and any element of the input
                sequence was truthy.
            `),
            "typeof last falsey element": (`
                When no predicate was given and no element of the sequence
                was truthy, but there was at least one element in the sequence.
            `),
            "typeof first truthy predicate return value": (`
                When a predicate was given and any element of the input
                satisfied the predicate.
            `),
            "typeof last falsey predicate return value": (`
                When a predicate was given and no elements of the input
                satisfied the predicate.
            `),
            "undefined": (`
                When the input sequence was empty.
            `),
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "all", "none", "anyPass",
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
            let result = undefined;
            for(const element of source){
                result = predicate(element);
                if(result) return result;
            }
            return result;
        }else{
            let lastElement = undefined;
            for(const element of source){
                if(element) return element;
                lastElement = element;
            }
            return lastElement;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.any([true, false, true, false]));
            hi.assertNot(hi.any([false, 0, null]));
        },
        "basicUsagePredicate": hi => {
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
        "notKnownBoundedInput": hi => {
            hi.assertFail(() => hi.counter().until((i) => i === 100).any());
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.repeatElement(0).any());
        },
        "returnsFirstTruthy": hi => {
            const firstElement = i => i && i[0];
            hi.assert(hi.any([0, 0, 1, true]) === 1);
            hi.assert(hi.any(["hello"]) === "hello");
            hi.assert(hi.any([false, false, false, false, true]) === true);
            hi.assert(hi.any(firstElement, [[false], [false], [1], [false]]) === 1);
            hi.assert(hi.any(firstElement, [0, 0, 0, ["hello"]]) === "hello");
        },
        "returnsLastFalsey": hi => {
            const firstElement = i => i && i[0];
            hi.assert(hi.any([false, 0]) === 0);
            hi.assert(hi.any([null, 0, undefined]) === undefined);
            hi.assert(hi.any(firstElement, [[false], [false], [0]]) === 0);
            hi.assert(hi.any(firstElement, [0, 0, 0, [""]]) === "");
        },
    },
});

export default any;
