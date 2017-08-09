import {wrap} from "../core/wrap";

export const lastElement = wrap({
    names: ["lastElement", "tailElement"],
    summary: "Get the last element in a sequence optionally satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and an optional predicate function
            as input.
            The input sequence must be either reversible or known-bounded.
        `),
        returns: (`
            The function returns the last element in the sequence satisfying
            the predicate or, if no predicate was given, the last element in
            the sequence.
            When the input sequence was empty, or a predicate was given and no
            element satisfied it, the function returns #undefined.
        `),
        warnings: (`
            This function will produce an infinite loop if the input sequence
            is unbounded and a predicate function not satisfied by any element
            in that sequence is given as input.
        `),
        returnType: {
            "typeof last element of inputSequence": (`
                When no predicate function was given and the input sequence was
                not empty.
            `),
            "typeof last element of inputSequence satisfying the predicate": (`
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
            "last", "lastElementElse", "firstElement",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.predicate},
            sequences: {one: wrap.expecting.either(
                wrap.expecting.boundedSequence,
                wrap.expecting.reversibleSequence
            )},
        },
    },
    implementation: (predicate, source) => {
        if(source.back){
            if(predicate){
                while(!source.done()){
                    const element = source.nextBack();
                    if(predicate(element)) return element;
                }
                return undefined;
            }else if(!source.done()){
                return source.back();
            }else{
                return undefined;
            }
        }else if(source.overrides.reverse){
            const reversed = source.reverse();
            if(predicate){
                while(!reversed.done()){
                    const element = reversed.nextFront();
                    if(predicate(element)) return element;
                }
                return undefined;
            }else if(!reversed.done()){
                return reversed.front();
            }else{
                return undefined;
            }
        }else if(predicate){ // Arguments validation implies that source.bounded()
            let lastElement = undefined;
            for(const element of source){
                if(predicate(element)) lastElement = element;
            }
            return lastElement;
        }else{
            let lastElement = undefined;
            for(const element of source) lastElement = element;
            return lastElement;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["hello", "world"];
            hi.assert(hi.lastElement(strings) === "world");
        },
        "basicUsagePredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assert(hi.lastElement(even, [1, 2, 3, 4, 5]) === 4);
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().lastElement());
        },
        "emptyInputPredicate": hi => {
            hi.assertUndefined(hi.emptySequence().lastElement(i => true));
            hi.assertUndefined(hi.emptySequence().lastElement(i => false));
        },
        "unidirectionalInput": hi => {
            const even = i => i % 2 === 0;
            const seq = () => (
                hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeBounded()
            );
            hi.assert(seq().lastElement() === 7);
            hi.assert(seq().lastElement(even) === 6);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "reversibleInput": hi => {
            const seq = () => hi.flatten([[1, 2, 3], [4, 5]]);
            const even = i => i % 2 === 0;
            hi.assert(seq().lastElement() === 5);
            hi.assert(seq().lastElement(even) === 4);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "unboundedBidirectionalInput": hi => {
            hi.assert(hi.counter().lastElement() === Infinity);
            hi.assert(hi.counter().lastElement(i => true) === Infinity);
        },
    },
});

export const tailElement = lastElement;

export default lastElement;