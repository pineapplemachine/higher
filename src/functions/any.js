import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const any = wrap({
    name: "any",
    summary: "Get whether any elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
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
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1,
            allowIterables: true,
        },
    },
    implementation: (predicate, source) => {
        if(predicate){
            NotBoundedError.enforce(source, {
                message: "Failed to determine whether any elements satisfied the predicate",
            });
            for(const element of source){
                if(predicate(element)) return true;
            }
        }else{
            NotBoundedError.enforce(source, {
                message: "Failed to determine whether any elements were truthy",
            });
            for(const element of source){
                if(element){
                    return element;
                }
            }
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": (hi) => {
            const pets = [
                {
                    name: "Barley",
                    age: 8,
                    vaccinated: true,
                },
                {
                    name: "Boots",
                    age: 4,
                    vaccinated: false,
                },
                {
                    name: "Whiskers",
                    age: 1,
                    vaccinated: false,
                },
            ];

            const anyUnvaccinated = hi.any(pets, (p) => p.age > 1 && p.vaccinated === false);
            hi.assertEqual(anyUnvaccinated, true);
        },
        "truthyOnly": (hi) => {
            const truthy = [true, {}, [], "someValue", 42, new Date(), -42, 3.14, -3.14, Infinity, -Infinity];
            const result = hi.any(truthy);
            hi.assertEqual(result, true);
        },
        "falsyOnly": (hi) => {
            const falsy = [false, 0, "", null, undefined, NaN];
            const result = hi.any(falsy);
            hi.assertEqual(result, false);
        },
        "withPredicate": (hi) => {
            // ensure that when one even value is present in the provided
            // input array, that the "even only" predicate returns true.
            const evenAndOdd = [1, 3, 5, 7, 9, 10, 11];
            const result = hi.any((n) => n % 2 === 0, evenAndOdd);
            hi.assertEqual(result, true);
        },
        "withPredicateFailureMode": (hi) => {
            // provide an "even only" predicate, but providing an array
            // with only odd values should fail.
            const oddOnly = [1, 3, 5];
            const result = hi.any((n) => n % 2 === 0, oddOnly);
            hi.assertEqual(result, false);
        },
        "sequenceWithPredicate": (hi) => {
            const evenAndOdd = [1, 3, 5, 7, 9, 10, 11];
            const result = hi(evenAndOdd).any((n) => n % 2 === 0);
            hi.assertEqual(result, true);
        },
        "predicateAndSourceReversed": (hi) => {
            const evenAndOdd = [1, 3, 5, 7, 9, 10, 11];
            const result = hi.any(evenAndOdd, (n) => n % 2 === 0);
            hi.assertEqual(result, true);
        },
        "predicateAndSourceReversedFailureMode": (hi) => {
            const oddOnly = [1, 3, 5];
            const result = hi.any(oddOnly, (n) => n % 2 === 0);
            hi.assertEqual(result, false);
        },
        "noInputs": (hi) => {
            hi.assertEqual(hi.emptySequence().any(), false);
        },
        "notKnownBoundedInput": (hi) => {
            hi.assertFail(
                (error) => (error.type === "NotBoundedError"),
                () => hi.recur((i) => i + 1).seed(0).until(100).any()
            );
        },
        "unboundedInput": (hi) => {
            hi.assertFail(
                (error) => (error.type === "NotBoundedError"),
                () => hi.repeatElement(0).any()
            );
        },
    },
});

export default any;
