import {wrap} from "../core/wrap";

export const firstElement = wrap({
    names: ["firstElement", "headElement"],
    summary: "Get the first element in a sequence optionally satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and an optional predicate function
            as input.
        `),
        returns: (`
            The function returns the first element in the sequence satisfying
            the predicate or, if no predicate was given, the first element in
            the sequence.
            If the input sequence was empty, the function returns @undefined.
        `),
        warnings: (`
            This function will produce an infinite loop if the input sequence
            is unbounded and a predicate function not satisfied by any element
            in that sequence is given as input.
        `),
        returnType: {
            "typeof first element of inputSequence": (`
                When no predicate function was given and the input sequence was
                not empty.
            `),
            "typeof first element of inputSequence satisfying the predicate": (`
                When a predicate function was given and the input sequence was
                not empty.
            `),
            "undefined": (`
                When the input sequence was empty.
            `),
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "first", "firstElementElse", "emptyInput",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.predicate},
            sequences: 1,
        },
    },
    implementation: (predicate, source) => {
        if(predicate){
            for(const element of source){
                if(predicate(element)) return element;
            }
        }else if(!source.done()){
            return source.front();
        }
        return undefined;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["hello", "world"];
            hi.assert(hi.firstElement(strings) === "hello");
        },
        "basicUsagePredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assert(hi.firstElement(even, [1, 3, 5, 6, 7, 8]) === 6);
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().firstElement());
        },
        "emptyInputPredicate": hi => {
            hi.assertUndefined(hi.emptySequence().firstElement(i => true));
            hi.assertUndefined(hi.emptySequence().firstElement(i => false));
        },
    },
});

export const headElement = firstElement;

export default firstElement;
