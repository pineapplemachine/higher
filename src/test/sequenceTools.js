import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const NonSlicingSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "A non-native-slicing sequence wrapping another sequence.",
    devOnly: true,
    supportsWith: [
        "length", "back", "index", "indexNegative", "has", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    // TODO: More sequence getters
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new NonSlicingSequence(hi.emptySequence()),
    ],
    constructor: function NonSlicingSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.nativeLength();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        return this.source.popBack();
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    indexNegative: function(i){
        return this.source.nativeNegativeIndex(i);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new NonSlicingSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const NonIndexingSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "A non-native-indexing sequence wrapping another sequence.",
    devOnly: true,
    supportsWith: [
        "length", "back", "slice", "has", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    // TODO: More sequence getters
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new NonIndexingSequence(hi.emptySequence()),
    ],
    constructor: function NonIndexingSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.nativeLength();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        return this.source.popBack();
    },
    slice: function(i, j){
        return this.source.nativeSlice(i, j);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new NonIndexingSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const BoundsUnknownSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "An unknown-bounds sequence wrapping another sequence.",
    devOnly: true,
    supportsWith: [
        "back", "index", "slice", "has", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    // TODO: More sequence getters
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new BoundsUnknownSequence(hi.emptySequence()),
    ],
    constructor: function BoundsUnknownSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        return this.source.popBack();
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new BoundsUnknownSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const LengthUnknownSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "An unknown-length sequence wrapping another sequence.",
    devOnly: true,
    supportsWith: [
        "back", "index", "slice", "has", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    // TODO: More sequence getters
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new LengthUnknownSequence(hi.emptySequence()),
    ],
    constructor: function LengthUnknownSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        return this.source.popBack();
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new LengthUnknownSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const UnidirectionalSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "An unidirectional sequence wrapping another sequence.",
    devOnly: true,
    supportsWith: [
        "length", "index", "slice", "has", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    // TODO: More sequence getters
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new UnidirectionalSequence(hi.emptySequence()),
    ],
    constructor: function UnidirectionalSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.nativeLength();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new UnidirectionalSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const UncopyableSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "An uncopyable sequence wrapping another sequence.",
    devOnly: true,
    supportsWith: [
        "length", "back", "index", "slice", "has", "get",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    // TODO: More sequence getters
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new UncopyableSequence(hi.emptySequence()),
    ],
    constructor: function UncopyableSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.nativeLength();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        return this.source.popBack();
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const makeNonSlicing = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "makeNonSlicing",
    summary: "Get a sequence without native slicing support.",
    devOnly: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same elements as the
            input sequence, but without native slicing support.
            When the input sequence already did not natively support slicing,
            the function returns its input.
        `),
        returnType: "sequence",
        related: [
            "slice",
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function makeNonSlicing(source){
        if(
            !source.nativeSlice &&
            !source.nativeSliceNegative &&
            !source.nativeSliceMixed
        ){
            return source;
        }else{
            return new NonSlicingSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const slicingSeq = hi.range(10);
            hi.assert(slicingSeq.nativeSlice);
            hi.assertEqual(slicingSeq.nativeSlice(1, 4), [1, 2, 3]);
            const nonSlicingSeq = slicingSeq.makeNonSlicing();
            hi.assertUndefined(nonSlicingSeq.nativeSlice);
        },
        "nonSlicingInput": hi => {
            const seq = hi.recur(i => i).seed(0);
            hi.assertUndefined(seq.nativeSlice);
            hi.assert(seq.makeNonSlicing() === seq);
        },
    },
});

export const makeNonIndexing = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "makeNonIndexing",
    summary: "Get a sequence without native slicing support.",
    devOnly: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same elements as the
            input sequence, but without native indexing support.
            When the input sequence already did not natively support indexing,
            the function returns its input.
        `),
        returnType: "sequence",
        related: [
            "index",
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function makeNonIndexing(source){
        if(!source.nativeIndex && !source.nativeNegativeIndex){
            return source;
        }else{
            return new NonIndexingSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const indexSeq = hi.range(10);
            hi.assert(indexSeq.nativeIndex);
            hi.assert(indexSeq.nativeIndex(1) === 1);
            const nonIndexSeq = indexSeq.makeNonIndexing();
            hi.assertUndefined(nonIndexSeq.nativeIndex);
        },
        "nonIndexingInput": hi => {
            const seq = hi.recur(i => i).seed(0);
            hi.assertUndefined(seq.nativeIndex);
            hi.assert(seq.makeNonIndexing() === seq);
        },
    },
});

export const boundsUnknown = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "boundsUnknown",
    summary: "Get a sequence with unknown boundedness.",
    devOnly: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same elements as the
            input sequence, but with unknown boundedness and unknown length.
            When the input sequence already had unknown boundedness,
            the function returns its input.
        `),
        returnType: "sequence",
        related: [
            "assumeBounded", "assumeUnbounded",
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function boundsUnknown(source){
        if(!source.bounded() && !source.unbounded()){
            return source;
        }else{
            return new BoundsUnknownSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const boundedSeq = hi.range(10);
            hi.assert(boundedSeq.bounded());
            hi.assertNot(boundedSeq.unbounded());
            const boundsUnknownSeq = boundedSeq.boundsUnknown();
            hi.assertNot(boundsUnknownSeq.bounded());
            hi.assertNot(boundsUnknownSeq.unbounded());
        },
        "unboundedInput": hi => {
            const unboundedSeq = hi.counter(10);
            hi.assertNot(unboundedSeq.bounded());
            hi.assert(unboundedSeq.unbounded());
            const boundsUnknownSeq = unboundedSeq.boundsUnknown();
            hi.assertNot(boundsUnknownSeq.bounded());
            hi.assertNot(boundsUnknownSeq.unbounded());
        },
        "boundsUnknownInput": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assertNot(seq.bounded());
            hi.assertNot(seq.unbounded());
            hi.assert(seq.boundsUnknown() === seq);
        },
    },
});

export const lengthUnknown = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "lengthUnknown",
    summary: "Get a sequence with unknown length.",
    devOnly: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same elements as the
            input sequence, but with unknown length and unknown length.
            When the input sequence already had unknown length,
            the function returns its input.
        `),
        returnType: "sequence",
        related: [
            "assumeLength",
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function lengthUnknown(source){
        if(!source.nativeLength){
            return source;
        }else{
            return new LengthUnknownSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const knownLengthSeq = hi.range(10);
            hi.assert(knownLengthSeq.nativeLength);
            hi.assert(knownLengthSeq.nativeLength() === 10);
            const unknownLengthSeq = knownLengthSeq.lengthUnknown();
            hi.assertUndefined(unknownLengthSeq.nativeLength);
        },
        "unboundedInput": hi => {
            const seq = hi.counter();
            hi.assertUndefined(seq.nativeLength);
            hi.assert(seq.lengthUnknown() === seq);
        },
        "boundedLengthUnknownInput": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assertUndefined(seq.nativeLength);
            hi.assert(seq.lengthUnknown() === seq);
        },
    },
});

export const makeUnidirectional = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "makeUnidirectional",
    summary: "Get a sequence without bidirectionality.",
    devOnly: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same elements as the
            input sequence, but without bidirectionality.
            When the input sequence was already unidirectional, the function
            returns its input.
        `),
        returnType: "sequence",
        related: [
            "slice",
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function makeUnidirectional(source){
        if(!source.back){
            return source;
        }else{
            return new UnidirectionalSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const biSeq = hi.range(10);
            hi.assert(biSeq.back() === 9);
            const uniSeq = biSeq.makeUnidirectional();
            hi.assertUndefined(uniSeq.back);
        },
        "unidirectionalInput": hi => {
            const seq = hi.recur(i => i).seed(0);
            hi.assertUndefined(seq.back);
            hi.assert(seq.makeUnidirectional() === seq);
        },
    },
});

export const makeUncopyable = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "makeUncopyable",
    summary: "Get a sequence that does not allow copying.",
    devOnly: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as its single argument.
        `),
        returns: (`
            The function returns a sequence with the same elements as the
            input sequence, but without native support for copying.
            When the input sequence was already uncopyable, the function
            returns its input.
        `),
        returnType: "sequence",
        related: [
            "slice",
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: function makeUncopyable(source){
        if(!source.nativeCopy){
            return source;
        }else{
            return new UncopyableSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const copyableSeq = hi.range(6);
            hi.assertEqual(copyableSeq.copy(), [0, 1, 2, 3, 4, 5]);
            const uncopyableSeq = copyableSeq.makeUncopyable();
            hi.assertUndefined(uncopyableSeq.copy);
        },
        "uncopyableInput": hi => {
            const seq = hi((function*(){})());
            hi.assertUndefined(seq.copy);
            hi.assert(seq.makeUncopyable() === seq);
        },
    },
});
