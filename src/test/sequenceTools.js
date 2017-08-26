import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const NonSlicingSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "A non-native-slicing sequence wrapping another sequence.",
    supportsWith: [
        "length", "back", "index", "has", "get", "copy",
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

export const BoundsUnknownSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "An unknown-bounds sequence wrapping another sequence.",
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

export const UnidirectionalSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "An unidirectional sequence wrapping another sequence.",
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
        if(!source.nativeSlice){
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
            const makeNonSlicingSeq = slicingSeq.makeNonSlicing();
            hi.assertUndefined(makeNonSlicingSeq.nativeSlice);
        },
        "makeNonSlicingInput": hi => {
            const seq = hi.recur(i => i).seed(0);
            hi.assertUndefined(seq.nativeSlice);
            hi.assert(seq.makeNonSlicing() === seq);
        },
    },
});

export const boundsUnknown = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "boundsUnknown",
    summary: "Get a sequence with unknown boundedness.",
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
            const boundedSeq = hi.counter(10);
            hi.assert(boundedSeq.bounded());
            hi.asssertNot(boundedSeq.unbounded());
            const boundsUnknownSeq = boundedSeq.boundsUnknown();
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

export const makeUnidirectional = process.env.NODE_ENV !== "development" ? undefined : wrap({
    name: "makeUnidirectional",
    summary: "Get a sequence without bidirectionality.",
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
    implementation: function makeUnidirectional(source){
        if(!source.copy){
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
            hi.assertUndefined(copyableSeq.copy);
        },
        "uncopyableInput": hi => {
            const seq = hi((function*(){})());
            hi.assertUndefined(seq.copy);
            hi.assert(seq.makeUncopyable() === seq);
        },
    },
});
