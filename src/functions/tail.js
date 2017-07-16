import {error} from "../core/error";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {EmptySequence} from "./emptySequence";

export const TailError = error({
    summary: "Failed to get tail of sequence.",
    constructor: function TailError(source){
        this.source = source;
        this.message = (
            "The tail operation is supported only for sequences that are either " +
            "empty, bidirectional, or known to be bounded. If the input sequence is " +
            "surely bounded then this error can be fixed using the 'assumeBounded' " +
            "function."
        );
    },
});

// Get a sequence for enumerating the last so many elements of the input.
// The resulting sequence may be shorter than the length specified, but
// will never be longer.
export const tail = wrap({
    name: "tail",
    summary: "Get the trailing elements of a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as input and the number of trailing
            elements to acquire. To acquire one or more elements, the input
            sequence must either be empty, bidirectional, or known to be bounded.
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
            "last", "head", "dropTail"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (elements, source) => {
        if(elements <= 0 || source.done()){
            // The input is empty or 0 elements were requested
            return new EmptySequence();
        }else if(source.length && source.slice){
            // The input has length and slicing
            const sourceLength = source.length();
            if(elements >= sourceLength) return source;
            return source.slice(sourceLength - elements, sourceLength);
        }else if(source.back){
            // The input is bidirectional
            // TODO: It ought to be possible to put off this consumption until
            // the sequence is actually accessed
            const array = [];
            while(!source.done() && array.length < elements){
                array.push(source.nextBack());
            }
            array.reverse();
            return array;
        }else if(source.bounded()){
            // The input is at least bounded
            // TODO: It ought to be possible to put off this consumption until
            // the sequence is actually accessed
            const array = [];
            for(const element of source) array.push(element);
            const slice = array.length < elements ? array.length : elements;
            return new ArraySequence(array).slice(
                array.length - slice, array.length
            );
        }else{
            throw TailError(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [0, 1, 2, 3, 4, 5];
            hi.assertEqual(hi.tail(3, array), [3, 4, 5]);
        },
        "zeroLength": hi => {
            hi.assertEmpty(hi.tail(0, []));
            hi.assertEmpty(hi.tail(0, [1]));
            hi.assertEmpty(hi.tail(0, [1, 2, 3]));
            hi.assertEmpty(hi.tail(0, hi.recur(i => i)));
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.tail(0, []));
            hi.assertEmpty(hi.tail(1, []));
            hi.assertEmpty(hi.tail(2, []));
            hi.assertEmpty(hi.tail(100, []));
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
        "illegalInput": hi => {
            hi.assertFail(
                error => error.type === "TailError",
                () => hi.recur(i => i + 1).tail(10)
            );
        },
    },
});

export default tail;
