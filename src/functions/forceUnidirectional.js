import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const ForceUnidirectionalSequence = Sequence.extend({
    summary: "Wrap an input sequence so it behaves as though it were unidirectional.",
    supportsWith: [
        "length", "left", "index", "slice", "has", "get", "copy", "reset",
    ],
    constructor: function ForceUnidirectionalSequence(source){
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
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return new AssumeBoundedSequence(this.source.slice(i, j));
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
    reset: function(){
        this.source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const forceUnidirectional = wrap({
    name: "forceUnidirectional",
    summary: "Wrap an input sequence so it behaves as though it were unidirectional.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get a unidirectional sequence from any input sequence. This function
            is intended primarily as a testing tool.
        `),
        expects: (`
            The function expects one sequence of any kind as input.
        `),
        returns: (`
            The function returns a sequence which has all the same contents and
            properties of the input sequence, except that it is not allowed to
            be enumerated from the back.
            If the input sequence was already unidirectional, the function
            returns that sequence.
        `),
        returnType: {
            "typeof inputSequence": "When the input sequence was unidirectional.",
            "ForceUnidirectionalSequence": "When the input sequence was bidirectional.",
        },
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return source.back ? new ForceUnidirectionalSequence(source) : source;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // This is a bidirectional sequence.
            const seq = hi.range(10);
            hi.assert(seq.back);
            hi.assert(seq.back() === 9);
            // This is a unidirectional sequence with the same contents.
            const uni = seq.forceUnidirectional();
            hi.assertUndefined(uni.back);
            hi.assertEqual(uni, hi.range(10));
        },
        "unidirectionalInput": hi => {
            const seq = hi.recur(i => i + 1).seed(0);
            hi.assertUndefined(seq.back);
            hi.assert(seq.forceUnidirectional() === seq);
        },
    },
});

export default forceUnidirectional;
