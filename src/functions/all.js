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
            The function returns @false otherwise.
        `),
        throws: (`
            The function throws a @NotBoundedError when the input sequence was
            not known to be bounded.
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
                message: "Failed to determine whether all elements satisfied the predicate",
            });
            for(const element of source){
                if(!predicate(element)) return false;
            }
        }else{
            NotBoundedError.enforce(source, {
                message: "Failed to determine whether all elements were truthy",
            });
            for(const element of source){
                if(element) return element;
            }
        }
        return true;
    },
    tests: {
        "truthyOnly": (hi) => {
            const truthy = [true, {}, [], "someValue", 42, new Date(), -42, 3.14, -3.14, Infinity, -Infinity];
            const result = hi.all(truthy);
            hi.assertEqual(result, true);
        },
        "withPredicate": (hi) => {
            const evensOnly = [2, 4, 6, 8, 10];
            const result = hi.all((n) => n % 2 === 0, evensOnly);
            hi.assertEqual(result, true);
        },
        "sequenceWithPredicate": (hi) => {
            const evensOnly = [2, 4, 6, 8, 10];
            const result = hi(evensOnly).all((n) => n % 2 === 0);
            hi.assertEqual(result, true);
        },
    },
});

export default all;
