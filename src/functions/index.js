import {error} from "../core/error";
import {addIndexPatch} from "../core/sequence";
import {isNegative, isNegativeZero} from "../core/types";
import {wrap} from "../core/wrap";

export const IndexError = error({
    summary: "Failed to get element at an index.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence which was
            given as input to an index function and an optional error message
            string detailing what went wrong.
        `),
    },
    constructor: function IndexError(source, message){
        this.source = source;
        this.message = "Failed to index sequence" + (message ? ": " + message : ".");
    },
});

export const index = wrap({
    name: "index",
    summary: "Get the element at an index.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input one sequence and one number as input.
        `),
        returns: (`
            The function returns the element of the input sequence at the
            given index. Negative indexes are relative to the length of the
            input sequence.
            /The function returns #undefined when the index was not an integer.
        `),
        throws: (`
            The function throws an @IndexError when it was not possible to
            acquire the element of the input sequence at the given index.
            The error is thrown when the index was #[-1] and the input sequence
            was unidirectional with unknown bounds, 
            when the index was #Infinity and the input sequence had unknown
            bounds or was known-unbounded without also being bidirectional,
            when the index was #[-Infinity] and the input had unknown bounds,
            and when the index was less than #[-1] and the input sequence was
            known-unbounded while also being uncopyable and unidirectional and
            not supporting a native negative indexing operation.
        `),
        warnings: (`
            When the input sequence is in fact unbounded without being
            known-unbounded and the given index is negative, this function will
            produce an infinite loop.
        `),
        examples: [
            "basicUsage", "basicUsageNegative",
        ],
        related: [
            "slice", "enumerate",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        ordered: [wrap.expecting.sequence, wrap.expecting.number],
    },
    implementation: function index(source, at){
        if(at === 0){
            return source.front();
        }else if(Math.floor(at) !== at){
            return undefined;
        }else if(at === -1){
            if(source.back){
                return source.back();
            }else if(source.nativeLength && source.nativeIndex){
                return source.nativeIndex(source.nativeLength() - 1);
            }else if(!source.unbounded()){
                const cache = source.cacheUntilIndex(Infinity);
                return cache[cache.length - 1];
            }else{
                throw IndexError(source);
            }
        }else if(at === Infinity){
            if(source.back && source.unbounded()){
                return source.back();
            }else if(source.bounded()){
                return undefined;
            }else{
                throw IndexError(source);
            }
        }else if(at === -Infinity){
            if(source.unbounded()){
                return source.front();
            }else if(source.bounded()){
                return undefined;
            }else{
                throw IndexError(source);
            }
        }else if(at < 0){
            if(source.nativeIndexNegative){
                return source.nativeIndexNegative(at);
            }else if(source.nativeLength){
                const sourceLength = source.nativeLength();
                const backAt = sourceLength + at;
                if(source.nativeIndex){
                    return source.nativeIndex(backAt);
                }else{
                    const cache = source.cacheUntilIndex(backAt + 1);
                    return cache[backAt];
                }
            }else if(source.unbounded()){
                if(source.copy && source.back){
                    const copiedSource = source.copy();
                    for(let i = at + 1; i < 0; i++) copiedSource.popBack();
                    return copiedSource.back();
                }else{
                    throw IndexError(source);
                }
            }else{
                const cache = source.cacheUntilIndex(Infinity);
                return cache[cache.length + at];
            }
        }else if(source.nativeIndex){
            return source.nativeIndex(at);
        }else{
            const cache = source.cacheUntilIndex(at + 1);
            return cache[at];
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.repeat("hello", 3);
            hi.assert(seq.index(0) === "h");
            hi.assert(seq.index(1) === "e");
            hi.assert(seq.index(5) === "h");
        },
        "basicUsageNegative": hi => {
            const seq = hi("hello world!");
            hi.assert(seq.index(0) === "h");
            hi.assert(seq.index(-1) === "!");
        },
        "boundedNativeIndexInput": hi => {
            hi.assert(hi.range(10).index(0) === 0);
            hi.assert(hi.range(10).index(3) === 3);
            hi.assert(hi.range(10).index(9) === 9);
        },
        "unboundedNativeIndexInput": hi => {
            hi.assert(hi.counter().index(0) === 0);
            hi.assert(hi.counter().index(9) === 9);
            hi.assert(hi.counter().index(500) === 500);
        },
        "unboundedNativeIndexNegativeInput": hi => {
            const seq = hi.repeat("hello");
            hi.assert(seq.index(-1) === "o");
            hi.assert(seq.index(-2) === "l");
            hi.assert(seq.index(-3) === "l");
            hi.assert(seq.index(-4) === "e");
            hi.assert(seq.index(-5) === "h");
        },
        "unidirectionalKnownLengthNonIndexInput": hi => {
            const seq = hi.range(10).makeNonIndexing().makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === 9);
            hi.assert(seq.index(-10) === 0);
            hi.assert(seq.index(-4) === 6);
        },
        "bidirectionalKnownLengthNonIndexInput": hi => {
            const seq = hi.range(10).makeNonIndexing();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === 9);
            hi.assert(seq.index(-10) === 0);
            hi.assert(seq.index(-4) === 6);
        },
        "unidirectionalUnknownLengthNonIndexInput": hi => {
            const seq = hi.range(10).makeNonIndexing().lengthUnknown().makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === 9);
            hi.assert(seq.index(-10) === 0);
            hi.assert(seq.index(-4) === 6);
        },
        "bidirectionalUnknownLengthNonIndexInput": hi => {
            const seq = hi.range(10).makeNonIndexing().lengthUnknown();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === 9);
            hi.assert(seq.index(-10) === 0);
            hi.assert(seq.index(-4) === 6);
            hi.assert(seq.index(+Infinity) === undefined);
            hi.assert(seq.index(-Infinity) === undefined);
        },
        "unidirectionalUnboundedNonIndexInput": hi => {
            const seq = hi.counter().makeNonIndexing().makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            // Function returns undefined when the index is inaccessible
            hi.assertFailWith(IndexError, () => seq.index(-1));
            hi.assertFailWith(IndexError, () => seq.index(-10));
            hi.assertFailWith(IndexError, () => seq.index(-4));
            hi.assertFailWith(IndexError, () => seq.index(+Infinity));
            hi.assert(seq.index(-Infinity) === 0);
        },
        "bidirectionalUnboundedNonIndexInput": hi => {
            const seq = hi.counter().makeNonIndexing();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === Infinity);
            hi.assert(seq.index(-10) === Infinity);
            hi.assert(seq.index(-4) === Infinity);
            hi.assert(seq.index(+Infinity) === Infinity);
            hi.assert(seq.index(-Infinity) === 0);
        },
        "unidirectionalUnboundedUncopyableNonIndexInput": hi => {
            const seq = hi.counter().makeNonIndexing().makeUncopyable().makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            // Function returns undefined when the index is inaccessible
            hi.assertFailWith(IndexError, () => seq.index(-1));
            hi.assertFailWith(IndexError, () => seq.index(-10));
            hi.assertFailWith(IndexError, () => seq.index(-4));
            hi.assertFailWith(IndexError, () => seq.index(+Infinity));
            hi.assert(seq.index(-Infinity) === 0);
        },
        "bidirectionalUnboundedUncopyableNonIndexInput": hi => {
            const seq = hi.counter().makeNonIndexing().makeUncopyable();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(+Infinity) === Infinity);
            hi.assert(seq.index(-Infinity) === 0);
            hi.assert(seq.index(-1) === Infinity);
            hi.assertFailWith(IndexError, () => seq.index(-10));
        },
        "unidirectionalKnownLengthIndexingInput": hi => {
            const seq = hi.range(10).makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === 9);
            hi.assert(seq.index(-10) === 0);
            hi.assert(seq.index(-4) === 6);
            hi.assert(seq.index(+Infinity) === undefined);
            hi.assert(seq.index(-Infinity) === undefined);
        },
        "notKnownBoundedNonIndexingExternalNonModification": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assert(seq.front() === 0);
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(3) === 3);
            hi.assert(seq.index(-4) === 4);
            hi.assert(seq.index(-8) === 0);
            hi.assert(seq.index(-1) === 7);
            // Traversal to index does not modify the sequence's state,
            // as far as external observers are concerned.
            hi.assert(seq.front() === 0);
            hi.assertEqual(seq, [0, 1, 2, 3, 4, 5, 6, 7]);
        },
    },
});

export default index;
