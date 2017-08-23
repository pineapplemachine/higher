import {addIndexPatch} from "../core/sequence";
import {wrap} from "../core/wrap";

export const length = wrap({
    name: "length",
    summary: "Get the length of a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects asequence as input.
        `),
        returns: (`
            The function returns the number of elements in the input sequence.
            When the input sequence was known to be unbounded, the function
            returns #Infinity.
        `),
        warnings: (`
            When the input sequence is in fact unbounded without being
            known-unbounded, this function will produce an infinite loop.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "assumeLength",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function length(source){
        if(source.nativeLength){
            return soure.nativeLength();
        }else if(source.unbounded()){
            return Infinity;
        }else{
            return source.cacheUntilIndex(Infinity).length;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.repeat("hello", 2);
            hi.assert(seq.length() === "hello".length * 2);
        },
        "unboundedInput": hi => {
            hi.assert(hi.counter().length() === Infinity);
            hi.assert(hi.repeat("!").length() === Infinity);
        },
        "knownLengthInput": hi => {
            hi.assert(hi.range(0).length() === 0);
            hi.assert(hi.range(1).length() === 1);
            hi.assert(hi.range(10).length() === 10);
            hi.assert(hi.range(15).length() === 15);
        },
        "unknownLengthInput": hi => {
            const seq = hi.counter().from(i => i === 2).until(i => i === 6);
            hi.assert(seq.length() === 4);
        },
        "unknownLengthExternalNonModification": hi => {
            const seq = hi.counter().until(i => i >= 8);
            hi.assert(seq.front() === 0);
            hi.assert(seq.length() === 8);
            // Computing length does not modify the sequence's state,
            // as far as external observers are concerned.
            hi.assert(seq.front() === 0);
            hi.assertEqual(seq, [0, 1, 2, 3, 4, 5, 6, 7]);
        },
    },
});

export default length;
