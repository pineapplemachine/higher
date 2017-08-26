import {defineSequence} from "../core/defineSequence";
import {addIndexPatch} from "../core/sequence";
import {isNegative, isNegativeZero} from "../core/types";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {ConcatSequence} from "./concat";
import {EmptySequence} from "./emptySequence";
import {DropFirstSequence} from "./dropFirst";
import {BidirectionalDropLastSequence} from "./dropLast";
import {HeadSequence} from "./head";
import {OnDemandSequence} from "./onDemandSequence";
import {InfiniteRepeatElementSequence} from "./repeatElement";
import {ReverseSequence} from "./reverse";
import {BidirectionalOnDemandTailSequence} from "./tail";

export const SliceSequence = defineSequence({
    summary: "Enumerate the elements of a sequence within a range of indexes.",
    supportsWith: {
        "length": "any", "index": "any", "slice": "any", "copy": "any",
        "back": ["back", "length"],
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a low index bound, a high index bound, and
            a sequence as input.
            The low index bound must be greater than or equal to the high index
            bound. Both index bounds must be finite positive numbers. The high
            index bound must be less than or equal to the length of the input
            sequence.
        `),
    },
    constructor: function SliceSequence(
        lowIndex, highIndex, source, frontIndex = undefined,
        initializedFront = undefined, initializedBack = undefined,
    ){
        this.lowIndex = lowIndex;
        this.highIndex = highIndex;
        this.source = source;
        this.frontIndex = frontIndex || 0;
        this.initializedFront = initializedFront;
        this.initializedBack = initializedBack;
        this.maskAbsentMethods(source);
    },
    initializeFront: function(){
        this.initializedFront = true;
        for(let i = 0; i < this.lowIndex && !this.source.done(); i++){
            this.source.popFront();
        }
    },
    initializeBack: function(){
        this.initializedBack = true;
        const popCount = this.source.nativeLength() - this.highIndex;
        for(let i = 0; i < popCount; i++){
            this.source.popBack();
        }
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return (
            this.frontIndex >= (this.highIndex - this.lowIndex) ||
            this.source.done()
        );
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    front: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.source.front();
    },
    popFront: function(){
        if(!this.initializedFront) this.initializeFront();
        this.frontIndex++;
        return this.source.popFront();
    },
    back: function(){
        if(!this.initializedBack) this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        if(!this.initializedBack) this.initializeBack();
        return this.source.popBack();
    },
    index: function(i){
        return this.source.nativeIndex(i + this.lowIndex);
    },
    slice: function(i, j){
        return this.source.nativeSlice(i + this.lowIndex, j + this.lowIndex);
    },
    copy: function(){
        return new SliceSequence(
            this.lowIndex, this.highIndex, this.source.copy(),
            this.frontIndex, this.initializedFront, this.initializedBack
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const OnDemandUnboundedTailSliceSequence = function(source, low, high){
    return new OnDemandSequence(ReverseSequence.appliedTo(ArraySequence), {
        bounded: () => true,
        unbounded: () => false,
        done: () => false,
        length: () => high - low,
        dump: () => {
            const copiedSource = source.copy();
            for(let i = 0; i > high; i--){
                copiedSource.popBack();
            }
            const array = [];
            while(array.length < high - low){
                array.push(copiedSource.nextBack());
            }
            return new ReverseSequence(new ArraySequence(array));
        },
    });
}

export const slice = wrap({
    name: "slice",
    summary: "Get a slice of a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input one sequence and two optional numbers
            representing the low and high index bounds of the slice.
            When no index bounds were specified, #0 and the end of the input
            sequence are used as defaults.
            When one bound was specified, it is taken as the high bound and #0
            is used as a default for the low index bound.
            When two index bounds were specified, the first number represents
            the low index bound and the second number the high index bound.
            /Negative numbers are interpeted as positions relative to the end
            of the input sequence. #[-0] is treated the same as if the length of
            the input sequence was passed instead.
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
            "assumeLength",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        ordered: [
            wrap.expecting.sequence,
            wrap.expecting.optional(wrap.expecting.number),
            wrap.expecting.optional(wrap.expecting.number),
        ],
    },
    implementation: function slice(source, lowBound, highBound){
        let low, high;
        if(highBound === undefined){
            if(lowBound === undefined){
                if(source.copy){
                    return source.copy();
                }else if(!source.unbounded()){
                    // TODO: Hijack this!?
                    const cache = source.cacheUntilIndex(high);
                    return new ArraySequence(cache);
                }else{
                    throw new Error("TODO");
                }
            }else{
                low = 0;
                high = lowBound;
            }
        }else{
            low = lowBound || 0;
            high = highBound;
        }
        if(source.unbounded()){
            if(low === -Infinity) low = 0;
            if(high === -Infinity) high = 0;
            const negativeLow = isNegative(low);
            const negativeHigh = isNegative(high);
            if(
                low === Infinity ||
                (low >= high && negativeLow === negativeHigh)
            ){
                return new EmptySequence();
            }else if(high === Infinity || isNegativeZero(high)){
                if(isNegative(low)){
                    if(source.back){
                        return BidirectionalOnDemandTailSequence(-low, source);
                    }else{
                        throw new Error("TODO");
                    }
                }else if(low === 0){
                    if(source.copy){
                        return source.copy();
                    }else{
                        throw new Error("TODO")
                    }
                }else if(source.copy){
                    return new DropFirstSequence(low, source.copy());
                }else{
                    throw new Error("TODO");
                }
            }else if(low >= 0 && isNegative(high)){
                if(source.copy){
                    if(low === 0){
                        if(source.back){
                            return new BidirectionalDropLastSequence(-high, source.copy());
                        }else{
                            return source.copy();
                        }
                    }else if(source.back){
                        return new DropFirstSequence(low,
                            new BidirectionalDropLastSequence(-high, source.copy())
                        );
                    }else{
                        return new DropFirstSequence(low, source.copy());
                    }
                }else{
                    throw new Error("TODO");
                }
            }else if(low >= 0 && high >= 0){
                if(source.nativeSlice){
                    return source.nativeSlice(low, high);
                }else if(source.copy){
                    return new SliceSequence(low, high, source.copy());
                }else{
                    const cache = source.cacheUntilIndex(high);
                    return new ArraySequence(cache).nativeSlice(low, high);
                }
            }else if(source.copy){ // low < 0 && high < 0
                return OnDemandUnboundedTailSliceSequence(source, low, high);
            }else{
                throw new Error("TODO");
            }
        }else if(low === Infinity || high === -Infinity){
            return new EmptySequence();
        }
        if(source.nativeLength){
            if(low !== -Infinity && isNegative(low)){
                low = source.nativeLength() + low;
            }
            if(high !== 0 && isNegative(high)){
                high = source.nativeLength() + high;
            }
        }else if(
            (low !== -Infinity && isNegative(low)) ||
            (high !== 0 && isNegative(high))
        ){
            const cache = source.cacheUntilIndex(Infinity);
            if(isNegative(low)){
                low = cache.length + low;
            }
            if(isNegative(high)){
                high = cache.length + high;
            }
        }
        if(isNegativeZero(high)){
            if(low === 0){
                if(source.copy){
                    return source.copy();
                }else{
                    const cache = source.cacheUntilIndex(Infinity);
                    return new ArraySequence(cache);
                }
            }else if(source.nativeLength && source.nativeSlice){
                return source.nativeSlice(low, source.nativeLength());
            }else if(source.copy){
                return new DropFirstSequence(low, source.copy());
            }else{
                const cache = source.cacheUntilIndex(Infinity);
                return new ArraySequence(cache).nativeSlice(low, cache.length);
            }
        }else if(low >= high){
            return new EmptySequence();
        }else if(low === -Infinity && high === Infinity){
            return new InfiniteRepeatElementSequence(undefined);
        }else if(low === -Infinity){
            return new ConcatSequence([
                new InfiniteRepeatElementSequence(undefined),
                slice(source, 0, high), // Recursive call
            ]);
        }else if(high === Infinity){
            if(source.nativeLength){
                return new ConcatSequence([
                    slice(source, low, source.nativeLength()), // Recursive call
                    new InfiniteRepeatElementSequence(undefined),
                ]);
            }else{
                const cache = source.cacheUntilIndex(Infinity);
                return new ConcatSequence([
                    new ArraySequence(cache).nativeSlice(low, cache.length),
                    new InfiniteRepeatElementSequence(undefined),
                ]);
            }
        }else if(source.nativeSlice){
            return source.nativeSlice(low, high);
        }else if(source.copy){
            if(low === 0){
                return new HeadSequence(high, source.copy());
            }else{
                return new SliceSequence(low, high, source.copy());
            }
        }else{
            const cache = source.cacheUntilIndex(high);
            return new ArraySequence(cache).nativeSlice(low, high);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.range(10);
            hi.assertEqual(seq.slice(3, 8), [3, 4, 5, 6, 7]);
        },
        "basicUsageNegative": hi => {
            const seq = hi.range(10);
            hi.assertEqual(seq.slice(3, -0), [3, 4, 5, 6, 7, 8, 9]);
            hi.assertEqual(seq.slice(-3, -1), [7, 8]);
            hi.assertEqual(seq.slice(-3, -0), [7, 8, 9]);
        },
        "slicingInput": hi => {
            hi.assertEqual(hi.range(6).slice(1, 2), [1]);
            hi.assertEqual(hi("hello").slice(2, 4), "ll");
            hi.assertEqual(hi.counter().slice(0, 6), [0, 1, 2, 3, 4, 5]);
        },
        "negativeBoundsUnknownLengthInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 10);
            hi.assertEqual(seq().slice(3, -0), [3, 4, 5, 6, 7, 8, 9]);
            hi.assertEqual(seq().slice(-3, -1), [7, 8]);
            hi.assertEqual(seq().slice(-3, -0), [7, 8, 9]);
        },
        "knownBoundedNonSlicingInput": hi => {
            const seq = () => hi.range(8).makeNonSlicing();
            hi.assertEmpty(seq().slice(0, 0));
            hi.assertEmpty(seq().slice(10, 1));
            hi.assertEqual(seq().slice(), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(3), [0, 1, 2]);
            hi.assertEqual(seq().slice(2, 5), [2, 3, 4]);
            hi.assertEqual(seq().slice(2, -2), [2, 3, 4, 5]);
            hi.assertEqual(seq().slice(2, -0), [2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(0, -0), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "notKnownBoundedNonSlicingInput": hi => {
            const seq = () => hi.range(8).makeNonSlicing().boundsUnknown();
            hi.assertEmpty(seq().slice(0, 0));
            hi.assertEmpty(seq().slice(10, 1));
            hi.assertEqual(seq().slice(), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(3), [0, 1, 2]);
            hi.assertEqual(seq().slice(2, 5), [2, 3, 4]);
            hi.assertEqual(seq().slice(2, -2), [2, 3, 4, 5]);
            hi.assertEqual(seq().slice(2, -0), [2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(0, -0), [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "unboundedNonSlicingInputFront": hi => {
            const seq = () => hi.counter().makeNonSlicing();
            hi.assertEmpty(seq().slice(0, 0));
            hi.assertEmpty(seq().slice(10, 1));
            hi.assertEmpty(seq().slice(-4, -5));
            hi.assert(seq().slice().unbounded());
            hi.assert(seq().slice().startsWith([0, 1, 2, 3, 4, 5]));
            hi.assertEqual(seq().slice(3), [0, 1, 2]);
            hi.assertEqual(seq().slice(2, 5), [2, 3, 4]);
            hi.assert(seq().slice(0, -2).unbounded());
            hi.assert(seq().slice(0, -2).startsWith([0, 1, 2, 3, 4, 5]));
            hi.assert(seq().slice(0, -2).endsWith([Infinity, Infinity]));
            hi.assert(seq().slice(2, -2).unbounded());
            hi.assert(seq().slice(2, -2).startsWith([2, 3, 4, 5]));
            hi.assert(seq().slice(2, -2).endsWith([Infinity, Infinity]));
        },
        "unboundedNonSlicingInputBack": hi => {
            const seq = () => hi.repeat([0, 1, 2, 3]).makeNonSlicing();
            hi.assert(seq().slice(0, -0).unbounded());
            hi.assert(seq().slice(0, -0).startsWith([0, 1, 2, 3, 0, 1]));
            hi.assert(seq().slice(0, -0).endsWith([2, 3, 0, 1, 2, 3]));
            hi.assertEqual(seq().slice(-6, -0), [2, 3, 0, 1, 2, 3]);
            hi.assertEqual(seq().slice(-6, -2), [2, 3, 0, 1]);
        },
        "unboundedUnidirectionalInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0);
            hi.assertEmpty(seq().slice(2, 2));
            hi.assertEqual(seq().slice(2, 6), [2, 3, 4, 5]);
            hi.assert(seq().slice(0, -4).unbounded());
            hi.assert(seq().slice(0, -4).startsWith([0, 1, 2, 3, 4]));
            hi.assert(seq().slice(0, -0).unbounded());
            hi.assert(seq().slice(0, -0).startsWith([0, 1, 2, 3, 4]));
            hi.assert(seq().slice(0, Infinity).unbounded());
            hi.assert(seq().slice(0, Infinity).startsWith([0, 1, 2, 3, 4]));
            hi.assert(seq().slice(3, -4).unbounded());
            hi.assert(seq().slice(3, -4).startsWith([3, 4, 5, 6]));
            hi.assert(seq().slice(3, -0).unbounded());
            hi.assert(seq().slice(3, -0).startsWith([3, 4, 5, 6]));
            hi.assert(seq().slice(3, Infinity).unbounded());
            hi.assert(seq().slice(3, Infinity).startsWith([3, 4, 5, 6]));
        },
        "unboundedUncopyableUnidirectionalInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).makeUncopyable();
            hi.assertEmpty(seq().slice(2, 2));
            hi.assertEqual(seq().slice(3), [0, 1, 2]);
            hi.assertEqual(seq().slice(2, 6), [2, 3, 4, 5]);
            // TODO: It may be manageable to fix these cases
            hi.assertFail(() => seq().slice());
            hi.assertFail(() => seq().slice(-6));
            hi.assertFail(() => seq().slice(-0));
            hi.assertFail(() => seq().slice(3, -6));
            hi.assertFail(() => seq().slice(3, -0));
            hi.assertFail(() => seq().slice(-4, -2));
            hi.assertFail(() => seq().slice(-4, -0));
            hi.assertFail(() => seq().slice(Infinity));
        },
        "positiveInfiniteLowBound": hi => {
            hi.assertEmpty(hi.range(10).slice(Infinity, 1));
            hi.assertEmpty(hi.range(10).slice(Infinity, -1));
            hi.assertEmpty(hi.counter().slice(Infinity, 1));
            hi.assertEmpty(hi.counter().slice(Infinity, -1));
            hi.assertEmpty(hi.counter().slice(Infinity, -Infinity));
        },
        "positiveInfiniteHighBoundBoundedInput": hi => {
            const seq = hi.range(6).slice(2, Infinity);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([2, 3, 4, 5, undefined, undefined]));
            hi.assert(seq.endsWith([undefined, undefined, undefined]));
        },
        "positiveInfiniteHighBoundUnboundedInput": hi => {
            const seq = hi.counter().slice(2, Infinity);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([2, 3, 4, 5, 6]));
            hi.assert(seq.endsWith([Infinity, Infinity, Infinity]));
        },
        "positiveInfiniteHighBoundNegativeFiniteLowBoundUnboundedInput": hi => {
            const biSeq = hi.repeat("abcdef");
            hi.assertEqual(biSeq.slice(-10, Infinity), "cdefabcdef");
            const uniSeq = hi.recur(i => i + 1).seed(0);
            hi.assertFail(() => uniSeq.slice(-4, Infinity));
        },
        "negativeInfiniteHighBoundBoundedInput": hi => {
            hi.assertEmpty(hi.range(10).slice(0, -Infinity));
            hi.assertEmpty(hi.range(10).slice(2, -Infinity));
            hi.assertEmpty(hi.range(10).slice(-0, -Infinity));
            hi.assertEmpty(hi.range(10).slice(-2, -Infinity));
        },
        "iteratorInput": hi => {
            const iter = function*(){yield 0; yield 1; yield 2; yield 3; yield 4;};
            hi.assertEmpty(hi(iter()).slice(2, 2));
            hi.assertEqual(hi(iter()).slice(), [0, 1, 2, 3, 4]);
            hi.assertEqual(hi(iter()).slice(3), [0, 1, 2]);
            hi.assertEqual(hi(iter()).slice(-2), [0, 1, 2]);
            hi.assertEqual(hi(iter()).slice(1, 3), [1, 2]);
            hi.assertEqual(hi(iter()).slice(1, -1), [1, 2, 3]);
            const infLow = hi(iter()).slice(-Infinity, 3);
            hi.assert(infLow.unbounded());
            hi.assert(infLow.startsWith([undefined, undefined, undefined]));
            hi.assert(infLow.endsWith([undefined, undefined, 0, 1, 2]));
            const infHigh = hi(iter()).slice(2, Infinity);
            hi.assert(infHigh.unbounded());
            hi.assert(infHigh.startsWith([2, 3, 4, undefined, undefined]));
            hi.assert(infHigh.endsWith([undefined, undefined, undefined]));
            const infBoth = hi(iter()).slice(-Infinity, Infinity);
            hi.assert(infBoth.unbounded());
            hi.assert(infBoth.startsWith([undefined, undefined, undefined]));
            hi.assert(infBoth.endsWith([undefined, undefined, undefined]));
        },
        "boundedNonSlicingUncopyableInput": hi => {
            const seq = () => hi.range(8).makeNonSlicing().makeUncopyable();
            hi.assertEmpty(seq().slice(2, 2));
            hi.assertEmpty(seq().slice(-2, -2));
            hi.assertEqual(seq().slice(3), [0, 1, 2]);
            hi.assertEqual(seq().slice(1, 3), [1, 2]);
            hi.assertEqual(seq().slice(), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(-0), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(0, -0), [0, 1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(0, -2), [0, 1, 2, 3, 4, 5]);
            hi.assertEqual(seq().slice(2, -0), [2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().slice(2, -2), [2, 3, 4, 5]);
            hi.assertEmpty(seq().slice(5, -5));
        },
        "unboundedNonSlicingUncopyableInput": hi => {
            const seq = () => hi.counter().makeNonSlicing().makeUncopyable();
            hi.assertEmpty(seq().slice(2, 2));
            hi.assertEmpty(seq().slice(-2, -2));
            hi.assertEqual(seq().slice(3), [0, 1, 2]);
            hi.assertEqual(seq().slice(1, 3), [1, 2]);
            // TODO: It may be manageable to fix these cases
            hi.assertFail(() => seq.slice());
            hi.assertFail(() => seq.slice(0, -2));
        },
    },
});

export default slice;
