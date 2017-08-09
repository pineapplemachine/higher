import {wrap} from "../core/wrap";

export const lastElementElse = wrap({
    names: ["lastElementElse", "tailElementElse"],
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
            element satisfied it, the function invokes the callback and forwards
            its returned value.
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
            "last", "lastElement", "firstElementElse",
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
            sequences: {one: wrap.expecting.either(
                wrap.expecting.boundedSequence,
                wrap.expecting.reversibleSequence
            )},
        },
    },
    implementation: (functions, source) => {
        const callback = functions[0];
        const predicate = functions[1];
        if(source.back){
            if(predicate){
                while(!source.done()){
                    const element = source.nextBack();
                    if(predicate(element)) return element;
                }
                return callback();
            }else if(!source.done()){
                return source.back();
            }else{
                return callback();
            }
        }else if(source.overrides.reverse){
            const reversed = source.reverse();
            if(predicate){
                while(!reversed.done()){
                    const element = reversed.nextFront();
                    if(predicate(element)) return element;
                }
                return callback();
            }else if(!reversed.done()){
                return reversed.front();
            }else{
                return callback();
            }
        }else if(predicate){ // Arguments validation implies that source.bounded()
            let lastElement = undefined;
            let anyElement = false;
            for(const element of source){
                if(predicate(element)){
                    lastElement = element;
                    anyElement = true;
                }
            }
            return anyElement ? lastElement : callback();
        }else if(source.done()){
            return callback();
        }else{
            let lastElement = undefined;
            for(const element of source) lastElement = element;
            return lastElement;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const nope = () => "nope";
            hi.assert(hi(["hello", "world"]).lastElementElse(nope) === "world");
            hi.assert(hi.emptySequence().lastElementElse(nope) === "nope");
        },
        "basicUsagePredicate": hi => {
            const array = [1, 2, 3, 4, 5];
            const bang = () => "!";
            const even = i => i % 2 === 0;
            const negative = i => i < 0;
            hi.assert(hi.lastElementElse(array, bang, even) === 4);
            hi.assert(hi.lastElementElse(array, bang, negative) === "!");
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().lastElementElse(() => 0) === 0);
        },
        "emptyInputPredicate": hi => {
            hi.assert(hi.emptySequence().lastElementElse(() => 0, i => true) === 0);
            hi.assert(hi.emptySequence().lastElementElse(() => 0, i => false) === 0);
        },
        "unidirectionalInput": hi => {
            const bang = () => "!";
            const even = i => i % 2 === 0;
            const seq = () => (
                hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeBounded()
            );
            hi.assert(seq().lastElementElse(bang) === 7);
            hi.assert(seq().lastElementElse(bang, even) === 6);
            hi.assert(seq().lastElementElse(bang, i => false) === "!");
        },
        "reversibleInput": hi => {
            const seq = () => hi.flatten([[1, 2, 3], [4, 5]]);
            const even = i => i % 2 === 0;
            hi.assert(seq().lastElementElse(() => "!") === 5);
            hi.assert(seq().lastElementElse(() => "!", even) === 4);
            hi.assert(seq().lastElementElse(() => "!", i => false) === "!");
        },
        "unboundedBidirectionalInput": hi => {
            hi.assert(hi.counter().lastElementElse(() => 0) === Infinity);
            hi.assert(hi.counter().lastElementElse(() => 0, i => true) === Infinity);
        },
        "elseThrowError": hi => {
            hi.assertFail(() =>
                hi.emptySequence().lastElementElse(() => {throw new Error();})
            );
        },
    },
});

export const tailElementElse = lastElementElse;

export default lastElementElse;
