import {addIndexPatch} from "../core/sequence";
import {isNegative, isNegativeZero} from "../core/types";
import {wrap} from "../core/wrap";

export const index = wrap({
    name: "index",
    summary: "Get the element at an index.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input one sequence and one number as input.
        `),
        returns: (`
            The function returns a sequence enumerating the elements of the
            input sequence starting with the given low index bound and ending
            immediately before the given high index bound.
        `),
        warnings: (`
            When the input sequence is in fact unbounded without being
            known-unbounded and the high or low index bound is negative or
            the high index bound is #Infinity, this function will produce an
            infinite loop.
        `),
        examples: [
            "basicUsage", "basicUsageNegative",
        ],
        related: [
            "slice",
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
        }else if(at === -1){
            if(source.back){
                return source.back();
            }else if(source.nativeLength && source.nativeIndex){
                return source.nativeIndex(source.nativeLength() - 1);
            }else if(!source.unbounded()){
                const cache = source.cacheUntilIndex(Infinity);
                return cache[cache.length - 1];
            }else{
                throw new Error("TODO");
            }
        }else if(at === Infinity){
            if(source.back && source.unbounded()){
                return source.back();
            }else{
                throw new Error("TODO");
            }
        }else if(at === -Infinity){
            if(source.unbounded()){
                return source.front();
            }else{
                throw new Error("TODO");
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
                }else if(!source.back){
                    throw new Error("TODO");
                }else{
                    throw new Error("TODO");
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
            hi.assertFail(() => seq.index(+Infinity));
            hi.assertFail(() => seq.index(-Infinity));
        },
        "unidirectionalUnboundedNonIndexInput": hi => {
            const seq = hi.counter().makeNonIndexing().makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            // Function returns undefined when the index is inaccessible
            hi.assertFail(() => seq.index(-1));
            hi.assertFail(() => seq.index(-10));
            hi.assertFail(() => seq.index(-4));
            hi.assertFail(() => seq.index(+Infinity));
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
            hi.assertFail(() => seq.index(-1));
            hi.assertFail(() => seq.index(-10));
            hi.assertFail(() => seq.index(-4));
            hi.assertFail(() => seq.index(+Infinity));
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
            hi.assertFail(() => seq.index(-10));
        },
        "unidirectionalKnownLengthIndexingInput": hi => {
            const seq = hi.range(10).makeUnidirectional();
            hi.assert(seq.index(0) === 0);
            hi.assert(seq.index(8) === 8);
            hi.assert(seq.index(5) === 5);
            hi.assert(seq.index(-1) === 9);
            hi.assert(seq.index(-10) === 0);
            hi.assert(seq.index(-4) === 6);
            hi.assertFail(() => seq.index(+Infinity));
            hi.assertFail(() => seq.index(-Infinity));
        },
    },
});

export default index;
