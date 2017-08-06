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
            Behaves like the \`&&\` operator.
        `),
        expects: (`
            The function expects as input a known-bounded sequence and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns the first falsey element or, if there was no
            falsey element, the last truthy element when no predicate was given.
            It returns the first falsey predicate return value or, if the
            predicate was satisfied by every element, the last truthy
            return value when a predicate was specified.
            The function returns #true when the input sequence was empty.
        `),
        returnType: {
            "typeof first falsey element": (`
                When no predicate was given and any element of the input
                sequence was falsey.
            `),
            "typeof last truthy element": (`
                When no predicate was given and no element of the sequence
                was falsey, but there was at least one element in the sequence.
            `),
            "typeof first falsey predicate return value": (`
                When a predicate was given and any element of the input
                failed to satisfy the predicate.
            `),
            "typeof last truthy predicate return value": (`
                When a predicate was given and every element of the input
                satisfied the predicate.
            `),
            "true": (`
                When the input sequence was empty.
            `),
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "any", "none", "allPass",
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
            let result = true;
            for(const element of source){
                result = predicate(element);
                if(!result) return result;
            }
            return result;
        }else{
            let lastElement = true;
            for(const element of source){
                if(!element) return element;
                lastElement = element;
            }
            return lastElement;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
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
        "returnsFirstFalsey": hi => {
            const firstElement = i => i && i[0];
            hi.assert(hi.all([0, 0, 1, true]) === 0);
            hi.assert(hi.all(["hello", null, 0]) === null);
            hi.assert(hi.all([true, 1, false, 1, 0]) === false);
            hi.assert(hi.all(firstElement, [[1], [1], [false], [1]]) === false);
            hi.assert(hi.all(firstElement, [["x"], ["y"], ["z"], [null]]) === null);
        },
        "returnsLastTruthy": hi => {
            const firstElement = i => i && i[0];
            hi.assert(hi.all([true, 1]) === 1);
            hi.assert(hi.all([1, "yes", Infinity]) === Infinity);
            hi.assert(hi.all(firstElement, [[1], [true], [100]]) === 100);
            hi.assert(hi.all(firstElement, [[1], [1], ["hello"]]) === "hello");
        },
    },
});

export default all;
