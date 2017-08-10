import {Expecting} from "../core/expecting";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {EmptySequence} from "./emptySequence";
import {FilterSequence} from "./filter";
import {OnDemandSequence} from "./onDemandSequence";
import {ReverseSequence} from "./reverse";
import {BidirectionalOnDemandTailSequence} from "./tail";
import {ReversibleOnDemandTailSequence} from "./tail";
import {UnidirectionalOnDemandTailSequence} from "./tail";

// Get an on-demand sequence for the last elements of a bidirectional sequence.
const BidirectionalOnDemandLastSequence = (count, predicate, source) => {
    return new OnDemandSequence({
        bounded: () => true,
        unbounded: () => false,
        dump: () => {
            const array = [];
            while(array.length < count && !source.done()){
                const element = source.nextBack();
                if(predicate(element)) array.push(element);
            }
            return new ReverseSequence(new ArraySequence(array));
        },
    });
};

// Get an on-demand sequence for the last elements of a reversible sequence.
const ReversibleOnDemandLastSequence = (count, predicate, source) => {
    return new OnDemandSequence({
        bounded: () => true,
        unbounded: () => false,
        dump: () => {
            const reversed = source.reverse();
            const array = [];
            while(array.length < count && !reversed.done()){
                const element = reversed.nextFront();
                if(predicate(element)) array.push(element);
            }
            return new ReverseSequence(new ArraySequence(array));
        },
    });
};

// Get an on-demand sequence for the last elements of a unidirectional sequence.
const UnidirectionalOnDemandLastSequence = (count, predicate, source) => {
    return new OnDemandSequence({
        bounded: () => true,
        unbounded: () => false,
        dump: () => {
            const array = [];
            while(!source.done()){
                const element = source.nextFront();
                if(predicate(element)) array.push(element);
            }
            const sequence = new ArraySequence(array);
            return (array.length <= count ? sequence :
                sequence.slice(array.length - count, array.length)
            );
        },
    });
};

export const last = wrap({
    name: "last",
    summary: "Get the last so many elements of a sequence optionally satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence, an optional number of elements, and
            an optional predicate function as input.
            The input sequence must be either reversible or known-bounded.
            When no number of elements is provided, #1 is used as a default.
        `),
        returns: (`
            The function returns a sequence enumerating the last so many
            elements of the input sequence, or the last so many elements
            satisfying the predicate, if a predicate function was specified.
            /Where there were fewer applicable elements in the input sequence
            than were so requested, the output sequence will contain only as
            many elements were applicable and will consequently be shorter than
            the number of elements given.
        `),
        returnType: {
            // TODO
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "first", "tail", "lastElement", "dropLast",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            numbers: "?",
            functions: {optional: wrap.expecting.predicate},
            sequences: {one: wrap.expecting.either(
                wrap.expecting.boundedSequence,
                wrap.expecting.reversibleSequence
            )},
        }
    },
    implementation: (lastCount, predicate, source) => {
        const count = lastCount || 1;
        if(lastCount <= 0){
            return new EmptySequence();
        }else if(predicate){
            if(!isFinite(count) || (source.length && source.length() <= count)){
                return new FilterSequence(predicate, source);
            }else if(source.back){
                return BidirectionalOnDemandLastSequence(count, predicate, source);
            }else if(source.overrides.reverse){
                return ReversibleOnDemandLastSequence(count, predicate, source);
            }else{ // Argument validation implies that source.bounded()
                return UnidirectionalOnDemandLastSequence(count, predicate, source);
            }
        }else if(!isFinite(count)){
            return source;
        }else if(source.length && source.slice){
            const sourceLength = source.length();
            if(sourceLength <= count) return source;
            else return source.slice(sourceLength - count, sourceLength);
        }else if(source.length && source.length() <= count){
            return source;
        }else if(source.back){
            return BidirectionalOnDemandTailSequence(count, source);
        }else if(source.overrides.reverse){
            return ReversibleOnDemandTailSequence(count, source);
        }else{ // Argument validation implies that source.bounded()
            return UnidirectionalOnDemandTailSequence(count, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const seq = hi.last(4, array);
            hi.assertEqual(seq, [5, 6, 7, 8]);
        },
        "basicUsagePredicate": hi => {
            const string = "once upon a midnight dreary";
            const notVowel = i => !hi("aeiouy").containsElement(i);
            hi.assertEqual(hi.last(12, string, notVowel), "  mdnght drr");
        },
        "zeroCount": hi => {
            const even = i => i % 2 === 0;
            hi.assertEmpty(hi.range(10).last(0));
            hi.assertEmpty(hi.range(10).last(0, even));
            hi.assertEmpty(hi.counter().last(0));
            hi.assertEmpty(hi.counter().last(0, even));
        },
        "singleCount": hi => {
            const odd = i => i % 2 !== 0;
            hi.assertEqual(hi([1, 2, 3, 4]).last(1), [4]);
            hi.assertEqual(hi(["hello", "world"]).last(1), ["world"]);
            hi.assertEqual(hi([1, 2, 3, 4]).last(1, odd), [3]);
        },
        "unspecifiedCount": hi => {
            const odd = i => i % 2 !== 0;
            hi.assertEqual(hi([1, 2, 3, 4]).last(), [4]);
            hi.assertEqual(hi(["hello", "world"]).last(), ["world"]);
            hi.assertEqual(hi([1, 2, 3, 4]).last(odd), [3]);
        },
        "finiteCount": hi => {
            hi.assertEqual(hi.range(12).last(4), [8, 9, 10, 11]);
            hi.assertEqual(hi.last("hello", 2), "lo");
        },
        "finiteCountPredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.range(12).last(4, even), [4, 6, 8, 10]);
            const notL = i => i !== "l";
            hi.assertEqual(hi.last("hello world", 6, notL), "o word");
        },
        "lengthLessThanCount": hi => {
            const seq = hi.range(5);
            hi.assert(seq.last(10) === seq);
            hi.assert(seq.last(Infinity) === seq);
        },
        "lengthLessThanCountPredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.range(5).last(10, even), [0, 2, 4]);
            hi.assertEqual(hi.range(5).last(Infinity, even), [0, 2, 4]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().last(10));
            hi.assertEmpty(hi.emptySequence().last(10, i => true));
            hi.assertEmpty(hi.emptySequence().last(10, i => false));
        },
        "knownLengthNonSlicingInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeLength(8);
            hi.assertEqual(seq().last(4), [4, 5, 6, 7]);
            hi.assertEqual(seq().last(8), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().last(10), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().last(Infinity), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "knownLengthNonSlicingInputPredicate": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeLength(8);
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().last(2, even), [4, 6]);
            hi.assertEqual(seq().last(8, even), [0, 2, 4, 6]);
            hi.assertEqual(seq().last(10, even), [0, 2, 4, 6]);
            hi.assertEqual(seq().last(Infinity, even), [0, 2, 4, 6]);
        },
        "boundedNonSlicingInput": hi => {
            const seq = () => (
                hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeBounded()
            );
            hi.assertEmpty(seq().last(0));
            hi.assertEqual(seq().last(1), [7]);
            hi.assertEqual(seq().last(4), [4, 5, 6, 7]);
            hi.assertEqual(seq().last(8), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().last(20), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "boundedNonSlicingInputPredicate": hi => {
            const seq = () => (
                hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeBounded()
            );
            const even = i => i % 2 === 0;
            hi.assertEmpty(seq().last(0, even));
            hi.assertEqual(seq().last(1, even), [6]);
            hi.assertEqual(seq().last(2, even), [4, 6]);
            hi.assertEqual(seq().last(4, even), [0, 2, 4, 6]);
            hi.assertEqual(seq().last(20, even), [0, 2, 4, 6]);
        },
        "unboundedBidirectionalInput": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.repeat([0, 1, 2, 3]).last(5), [3, 0, 1, 2, 3]);
            hi.assertEqual(hi.repeat([0, 1, 2, 3]).last(5, even), [2, 0, 2, 0, 2]);
        },
        "unboundedUnidirectionalInput": hi => {
            const seq = hi.recur(i => i + 1).seed(0);
            hi.assertFail(() => seq.last(10));
            hi.assertFail(() => seq.last(10, i => true));
        },
        "noneSatisfyPredicate": hi => {
            hi.assertEmpty(hi.range(10).last(i => false));
            hi.assertEmpty(hi("hello").last(i => false));
        },
        "boundedReverseOverrideInput": hi => {
            const seq = () => hi.repeat(4, [[1, 2, 3], [4, 5]]).flatten();
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().last(7), [4, 5, 1, 2, 3, 4, 5]);
            hi.assertEqual(seq().last(5, even), [4, 2, 4, 2, 4]);
        },
        "unboundedReverseOverrideInput": hi => {
            const seq = () => hi.repeat([[1, 2, 3], [4, 5]]).flatten();
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().last(7), [4, 5, 1, 2, 3, 4, 5]);
            hi.assertEqual(seq().last(5, even), [4, 2, 4, 2, 4]);
        },
    },
});

export default last;
