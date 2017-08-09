import {error} from "../core/error";
import {Expecting} from "../core/expecting";
import {wrap} from "../core/wrap";

import {ArgumentsError} from "../errors/ArgumentsError";

import {ArraySequence} from "./arrayAsSequence";
import {EmptySequence} from "./emptySequence";
import {OnDemandSequence} from "./onDemandSequence";
import {ReverseSequence} from "./reverse";

// Get a sequence for enumerating the last so many elements of the input.
// The resulting sequence may be shorter than the length specified, but
// will never be longer.
export const tail = wrap({
    name: "tail",
    summary: "Get a sequence enumerating the last so many elements of an input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as input and the number of trailing
            elements to acquire.
        `),
        returns: (`
            The function returns a sequence enumerating the trailing so many
            elements of the input sequence.
            If there were fewer elements in the input sequence than were
            requested, then the outputted sequence will be the same length as
            the input and shorter than the number of elements requested.
        `),
        examples: [
            "basicUsage"
        ],
        related: [
            "last", "dropLast", "head",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: {one: wrap.expecting.either(
                wrap.expecting.boundedSequence,
                wrap.expecting.bidirectionalSequence
            )},
        }
    },
    implementation: (count, source) => {
        if(count <= 0){
            return new EmptySequence();
        }else if(!isFinite(count)){
            return source;
        }else if(source.length && source.slice){
            const sourceLength = source.length();
            return (sourceLength <= count ?
                source : source.slice(sourceLength - count, sourceLength)
            );
        }else if(source.back){
            if(source.length && source.length() <= count) return source;
            else return new OnDemandSequence({
                done: () => source.done(),
                back: () => source.back(),
                dump: () => {
                    const array = [];
                    while(!source.done() && array.length < count){
                        array.push(source.nextBack());
                    }
                    return new ReverseSequence(new ArraySequence(array));
                },
            });
        }else{ // Argument validation implies source.bounded()
            if(source.length && source.length() <= count) return source;
            else return new OnDemandSequence({
                done: () => source.done(),
                dump: () => {
                    const array = [];
                    for(const element of source) array.push(element);
                    return new ArraySequence(array).slice(
                        Math.max(0, array.length - count), array.length
                    );
                },
            });
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [0, 1, 2, 3, 4, 5];
            hi.assertEqual(hi.tail(3, array), [3, 4, 5]);
        },
        "zeroLength": hi => {
            hi.assertEmpty(hi.emptySequence().tail(0));
            hi.assertEmpty(hi.range(10).tail(0));
            hi.assertEmpty(hi("hello").tail(0));
        },
        "infiniteLength": hi => {
            const boundedSeq = hi.range(10);
            hi.assert(boundedSeq.tail(Infinity) === boundedSeq);
            const unboundedSeq = hi.counter();
            hi.assert(unboundedSeq.tail(Infinity) === unboundedSeq);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().tail(0));
            hi.assertEmpty(hi.emptySequence().tail(1));
            hi.assertEmpty(hi.emptySequence().tail(100));
        },
        "boundedSlicingInput": hi => {
            const array = [0, 1, 2, 3, 4, 5, 6, 7];
            hi.assertEqual(hi.tail(1, array), [7]);
            hi.assertEqual(hi.tail(2, array), [6, 7]);
            hi.assertEqual(hi.tail(4, array), [4, 5, 6, 7]);
            hi.assertEqual(hi.tail(8, array), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(hi.tail(20, array), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "unboundedBidirectionalInput": hi => {
            const seq = () => hi.repeat([0, 1, 2, 3]);
            hi.assertEmpty(seq().tail(0));
            hi.assertEqual(seq().tail(1), [3]);
            hi.assertEqual(seq().tail(2), [2, 3]);
            hi.assertEqual(seq().tail(4), [0, 1, 2, 3]);
            hi.assertEqual(seq().tail(6), [2, 3, 0, 1, 2, 3]);
        },
        "boundedNonSlicingInput": hi => {
            const seq = () => (
                hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeBounded()
            );
            hi.assertEmpty(seq().tail(0));
            hi.assertEqual(seq().tail(1), [7]);
            hi.assertEqual(seq().tail(2), [6, 7]);
            hi.assertEqual(seq().tail(4), [4, 5, 6, 7]);
            hi.assertEqual(seq().tail(8), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().tail(20), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "unidirectionalUnboundedInput": hi => {
            hi.assertFail(() => hi.recur(i => i + 1).seed(0).tail(10));
        },
    },
});

export default tail;
