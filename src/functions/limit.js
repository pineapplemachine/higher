import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {HeadSequence} from "./head";

export const defaultLimitLength = 1000;

export const limit = wrap({
    name: "limit",
    summary: "Get a sequence limited to a given length if it didn't already have known length.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and an optional number as input.
            When no number was provided, #${defaultLimitLength} is used as a
            default.
        `),
        returns: (`
            When the input sequence was known-bounded or the given length limit
            was #Infinity, the function returns its input.
            Otherwise the function returns a sequence which enumerates the number
            of elements specified or, if the sequence was found to contain fewer
            elements than that, all the elements of the input sequence.
        `),
        returnType: "sequence",
        examples: [
            "basicUsageKnownBounded", "basicUsageNotKnownBounded", "basicUsageUnbounded",
        ],
        related: [
            "assumeBounded", "assumeLength", "head",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: "?",
            sequences: 1
        }
    },
    implementation: (lengthLimit, source) => {
        if(source.bounded()){
            return source;
        }else{
            const length = Math.max(0, ((lengthLimit || lengthLimit === 0) ?
                lengthLimit : defaultLimitLength
            ));
            if(!isFinite(length)){
                return source;
            }else if(source.nativeSlice){
                return source.nativeSlice(0, length);
            }else{
                return new HeadSequence(length, source);
            }
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageKnownBounded": hi => {
            const seq = hi([1, 2, 3, 4, 5]);
            // When the input was known-bounded, returns that input regardless of length.
            hi.assert(seq.limit(10) === seq);
            hi.assert(seq.limit(2) === seq);
            // When no number is provided, 1000 is used as a default length limit.
            hi.assert(seq.limit() === seq);
        },
        "basicUsageNotKnownBounded": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            // When the input was not known-bounded, enumerates only the first so many elements.
            hi.assert(seq().limit(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
            hi.assert(seq().limit(10), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
            hi.assert(seq().limit(2), [0, 1]);
        },
        "basicUsageUnbounded": hi => {
            const seq = () => hi.counter();
            hi.assertEqual(seq().limit(8), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "zeroLengthLimit": hi => {
            hi.assertEmpty(hi.counter().limit(0));
        },
        "unspecifiedLengthLimit": hi => {
            const seq = hi.counter().limit();
            hi.assert(seq.bounded());
            hi.assert(seq.length() === defaultLimitLength);
        },
        "infiniteLengthLimit": hi => {
            const boundedSeq = hi.range(10);
            hi.assert(boundedSeq.limit(Infinity) === boundedSeq);
            const unboundedSeq = hi.counter();
            hi.assert(unboundedSeq.limit(Infinity) === unboundedSeq);
        },
        "knownBoundedNonSlicingInput": hi => {
            const seq = hi.range(10).from(i => i >= 5);
            hi.assert(seq.limit() === seq);
        },
        "notKnownBoundedNonSlicingInput": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8).from(i => true);
            hi.assertEqual(seq.copy().limit(), seq);
        },
    },
});

export default limit;
