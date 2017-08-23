import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const AssumeUnboundedSequence = defineSequence({
    summary: "A known-unbounded sequence enumerating the elements of a not-known-unbounded sequence.",
    supportsWith: [
        "back", "index", "slice", "has", "get", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new AssumeUnboundedSequence(hi.counter()),
        hi => new AssumeUnboundedSequence(hi.repeatElement("!")),
        hi => new AssumeUnboundedSequence(hi.counter().until(i => i < 0)),
        hi => new AssumeUnboundedSequence(hi.repeat("hello").until(i => i === "!")),
    ],
    constructor: function AssumeUnboundedSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
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
        return new AssumeUnboundedSequence(this.source.copy());
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

export const assumeUnbounded = wrap({
    name: "assumeUnbounded",
    summary: "Get a known-unbounded sequence enumerating the elements of a not-known-unbounded sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single input sequence.
        `),
        returns: (`
            The function returns a known-unbounded sequence enumerating the
            elements of the input sequence.
            If the input sequence was already known to be either bounded or
            unbounded, then that sequence is itself returned.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "limit", "assumeLength", "assumeBounded",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return (source.bounded() || source.unbounded() ?
            source : new AssumeUnboundedSequence(source)
        );
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Higher cannot automatically determine the boundedness of this sequence.
            const isQuestion = i => i === "?";
            const seq = hi.repeat("hello!").until(isQuestion);
            hi.assertNot(seq.bounded());
            hi.assertNot(seq.unbounded());
            // It can be informed, however, using the assumeUnbounded function.
            const knownUnbounded = seq.assumeUnbounded();
            hi.assert(knownUnbounded.unbounded());
            hi.assert(knownUnbounded.startsWith("hello!hello!hello!"));
        },
        "boundedInput": hi => {
            const seq = hi.range(10);
            hi.assert(seq.assumeUnbounded() === seq);
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("hello");
            hi.assert(seq.assumeUnbounded() === seq);
        },
    },
});

export default assumeUnbounded;
