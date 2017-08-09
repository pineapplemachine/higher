import {wrap} from "../core/wrap";

export const firstElementElse = wrap({
    names: ["firstElementElse", "headElementElse"],
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
            When the input sequence was empty, or a predicate was given and no
            element satisfied it, the function invokes the callback and forwards
            its returned value.
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
            "basicUsage", "basicUsagePredicate", "emptyInput",
        ],
        related: [
            "first", "firstElement", "lastElementElse",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {
                amount: [1, 2],
                first: wrap.expecting.callback,
                second: wrap.expecting.predicate,
            },
            sequences: 1,
        },
    },
    implementation: (functions, source) => {
        const callback = functions[0];
        const predicate = functions[1];
        if(predicate){
            for(const element of source){
                if(predicate(element)) return element;
            }
        }else if(!source.done()){
            return source.front();
        }
        return callback();
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const nope = () => "nope";
            hi.assert(hi(["hello", "world"]).firstElementElse(nope) === "hello");
            hi.assert(hi.emptySequence().firstElementElse(nope) === "nope");
        },
        "basicUsagePredicate": hi => {
            const array = [1, 2, 3, 4, 5];
            const bang = () => "!";
            const even = i => i % 2 === 0;
            const negative = i => i < 0;
            hi.assert(hi.firstElementElse(array, bang, even) === 2);
            hi.assert(hi.firstElementElse(array, bang, negative) === "!");
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().firstElementElse(() => 0) === 0);
        },
        "emptyInputPredicate": hi => {
            hi.assert(hi.emptySequence().firstElementElse(() => 0, i => true) === 0);
            hi.assert(hi.emptySequence().firstElementElse(() => 0, i => false) === 0);
        },
        "elseThrowError": hi => {
            hi.assertFail(() =>
                hi.emptySequence().firstElementElse(() => {throw new Error();})
            );
        },
    },
});

export const headElementElse = firstElementElse;

export default firstElementElse;
