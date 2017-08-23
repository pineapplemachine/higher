import {defineSequence} from "../core/defineSequence";
import {lightWrap} from "../core/lightWrap";

export const NonSlicingSequence = process.env.NODE_ENV !== "development" ? undefined : defineSequence({
    summary: "A known-bounded sequence enumerating the elements of a not-known-bounded sequence.",
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
    left: function(){
        return this.source.left();
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
    reset: function(){
        this.source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const nonSlicing = process.env.NODE_ENV !== "development" ? undefined : lightWrap({
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
    implementation: function nonSlicing(source){
        return new NonSlicingSequence(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const slicingSeq = hi.range(10);
            hi.assert(slicingSeq.nativeSlice);
            hi.assertEqual(slicingSeq.nativeSlice(1, 4), [1, 2, 3]);
            const nonSlicingSeq = slicingSeq.nonSlicing();
            hi.assertUndefined(nonSlicingSeq.nativeSlice);
        },
    },
});
