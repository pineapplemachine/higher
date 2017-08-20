import {wrap} from "../core/wrap";
import {Sequence} from "../core/sequence";

import {EmptySequence} from "./emptySequence";
import {FilterSequence} from "./filter";
import {HeadSequence} from "./head";

export const first = wrap({
    name: "first",
    summary: "Get the first so many elements of a sequence optionally satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence, an optional number of elements, and
            an optional predicate function as input.
            When no number of elements is provided, #1 is used as a default.
        `),
        returns: (`
            The function returns a sequence enumerating the first so many
            elements of the input sequence, or the first so many elements
            satisfying the predicate, if a predicate function was specified.
            /Where there were fewer applicable elements in the input sequence
            than were so requested, the output sequence will contain only as
            many elements were applicable and will consequently be shorter than
            the number of elements given.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "last", "head", "firstElement", "dropFirst",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: "?",
            functions: {optional: wrap.expecting.predicate},
            sequences: 1,
        }
    },
    implementation: (firstCount, predicate, source) => {
        const count = firstCount || 1;
        if(firstCount <= 0){
            return new EmptySequence();
        }else if(predicate){
            // TODO: Possibly write an optimized FirstSequence implementation
            // rather than returning a FilterSequence.HeadSequence.
            const filterSequence = new FilterSequence(predicate, source);
            if(!isFinite(count) || (source.nativeLength && source.length() <= count)){
                return filterSequence;
            }else{
                return new HeadSequence(count, filterSequence);
            }
        }else if(!isFinite(count)){
            return source;
        }else if(source.nativeLength){
            const sourceLength = source.length();
            if(sourceLength <= count) return source;
            else return (source.nativeSlice ?
                source.nativeSlice(0, count) :
                new HeadSequence(count, source)
            );
        }else{
            return new HeadSequence(count, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const seq = hi.first(4, array);
            hi.assertEqual(seq, [1, 2, 3, 4]);
        },
        "basicUsagePredicate": hi => {
            const string = "once upon a midnight dreary";
            const notVowel = i => !hi("aeiouy").containsElement(i);
            hi.assertEqual(hi.first(12, string, notVowel), "nc pn  mdngh");
        },
        "zeroCount": hi => {
            const even = i => i % 2 === 0;
            hi.assertEmpty(hi.range(10).first(0));
            hi.assertEmpty(hi.range(10).first(0, even));
            hi.assertEmpty(hi.counter().first(0));
            hi.assertEmpty(hi.counter().first(0, even));
        },
        "singleCount": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi([1, 2, 3, 4]).first(1), [1]);
            hi.assertEqual(hi(["hello", "world"]).first(1), ["hello"]);
            hi.assertEqual(hi([1, 2, 3, 4]).first(1, even), [2]);
        },
        "unspecifiedCount": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi([1, 2, 3, 4]).first(), [1]);
            hi.assertEqual(hi(["hello", "world"]).first(), ["hello"]);
            hi.assertEqual(hi([1, 2, 3, 4]).first(even), [2]);
        },
        "finiteCount": hi => {
            hi.assertEqual(hi.range(12).first(4), [0, 1, 2, 3]);
            hi.assertEqual(hi.first("hello", 2), "he");
        },
        "finiteCountPredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.range(12).first(4, even), [0, 2, 4, 6]);
            const notL = i => i !== "l";
            hi.assertEqual(hi.first("hello world", 6, notL), "heo wo");
        },
        "lengthLessThanCount": hi => {
            const seq = hi.range(5);
            hi.assert(seq.first(10) === seq);
            hi.assert(seq.first(Infinity) === seq);
        },
        "lengthLessThanCountPredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.range(5).first(10, even), [0, 2, 4]);
            hi.assertEqual(hi.range(5).first(Infinity, even), [0, 2, 4]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().first(10));
            hi.assertEmpty(hi.emptySequence().first(10, i => true));
            hi.assertEmpty(hi.emptySequence().first(10, i => false));
        },
        "unboundedInput": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.counter().first(5), [0, 1, 2, 3, 4]);
            hi.assertEqual(hi.counter().first(5, even), [0, 2, 4, 6, 8]);
        },
        "noneSatisfyPredicate": hi => {
            hi.assertEmpty(hi.range(10).first(i => false));
            hi.assertEmpty(hi("hello").first(i => false));
        },
    },
});

export default first;
