import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {AssumeLengthSequence} from "./assumeLength";

export const AssumeBoundedSequence = defineSequence({
    summary: "A known-bounded sequence enumerating the elements of a not-known-bounded sequence.",
    supportsWith: [
        "length", "back", "index", "slice", "has", "get", "copy",
    ],
    overrides: {
        "assumeLength": {one: wrap.expecting.number},
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "assumeLengthOverride": hi => {
            const source = hi.repeat("hello!").until(i => i === "!");
            const seq = new AssumeBoundedSequence(source);
            const knownLength = seq.assumeLength(5);
            hi.assert(knownLength.nativeLength() === 5);
            hi.assertEqual(knownLength, "hello");
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new AssumeBoundedSequence(hi.emptySequence()),
        hi => new AssumeBoundedSequence(hi([0])),
        hi => new AssumeBoundedSequence(hi([0, 1, 2])),
        hi => new AssumeBoundedSequence(hi.range(10)),
        hi => new AssumeBoundedSequence(hi.counter().until(i => i >= 10)),
        hi => new AssumeBoundedSequence(hi.repeat("hello").until(i => i === "o")),
    ],
    constructor: function AssumeBoundedSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    assumeLength: function(assumedLength){
        return new AssumeLengthSequence(assumedLength, this.source);
    },
    bounded: () => true,
    unbounded: () => false,
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
        return new AssumeBoundedSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const assumeBounded = wrap({
    name: "assumeBounded",
    summary: "Get a known-bounded sequence enumerating the elements of a not-known-bounded sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single input sequence.
        `),
        returns: (`
            The function returns a known-bounded sequence enumerating the
            elements of the input sequence.
            If the input sequence was already known to be either bounded or
            unbounded, then that sequence is itself returned.
        `),
        warnings: (`
            Using this function with input sequences that are not absolutely
            certain to be bounded will invalidate many of the safety guarantees
            that higher is otherwise able to provide.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "limit", "assumeLength", "assumeUnbounded",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return (source.bounded() || source.unbounded() ?
            source : new AssumeBoundedSequence(source)
        );
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Higher cannot automatically determine the boundedness of this sequence.
            const isBang = i => i === "!";
            const seq = hi.repeat("hello!").until(isBang);
            hi.assertNot(seq.bounded());
            hi.assertNot(seq.unbounded());
            // It can be informed, however, using the assumeBounded function.
            const knownBounded = seq.assumeBounded();
            hi.assert(knownBounded.bounded());
            hi.assertEqual(knownBounded, "hello");
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().assumeBounded());
        },
        "boundedInput": hi => {
            const seq = hi.range(10);
            hi.assert(seq.assumeBounded() === seq);
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("hello");
            hi.assert(seq.assumeBounded() === seq);
        },
    },
});

export default assumeBounded;
