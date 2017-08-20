import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {AssumeUnboundedSequence} from "./assumeUnbounded";
import {EmptySequence} from "./emptySequence";

export const AssumeLengthSequence = defineSequence({
    summary: "Wrap an input sequence so it behaves as though it were unidirectional.",
    supportsAlways: [
        "length", "left",
    ],
    supportsWith: [
        "back", "index", "slice", "has", "get", "copy", "reset",
    ],
    constructor: function AssumeLengthSequence(
        assumedLength, source, consumedElements = undefined
    ){
        this.assumedLength = assumedLength;
        this.source = source;
        this.consumedElements = consumedElements || 0;
        if(!source.back) this.back = undefined;
        if(!source.index) this.index = undefined;
        if(!source.slice) this.slice = undefined;
        if(!source.has) this.has = undefined;
        if(!source.get) this.get = undefined;
        if(!source.copy) this.copy = undefined;
        if(!source.reset) this.reset = undefined;
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.assumedLength;
    },
    left: function(){
        return this.assumedLength - this.consumedElements;
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.consumedElements++;
        return this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        this.consumedElements++;
        return this.source.popBack();
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return this.source.slice(i, j);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new AssumeLengthSequence(
            this.assumedLength, this.source.copy(), this.consumedElements
        );
    },
    reset: function(){
        this.source.reset();
        this.consumedElements = 0;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const assumeLength = wrap({
    name: "assumeLength",
    summary: "Wrap a sequence with one claiming to have the specified length.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a length and one sequence of any kind as input.
        `),
        returns: (`
            The function returns its input sequence when that sequence had
            known length and otherwise returns a sequence enumerating its
            contents but claiming to have the specified length.
            If the length specified was #Infinity, then the function instead
            returns a sequence that claims to be unbounded.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "limit", "assumeBounded", "assumeUnbounded",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: {one: wrap.expecting.number},
            sequences: 1,
        },
    },
    implementation: (assumedLength, source) => {
        if(source.nativeLength || source.unbounded()){
            return source;
        }else if(!isFinite(assumedLength)){
            return (source.bounded() || source.unbounded() ?
                source : new AssumeUnboundedSequence(source)
            );
        }else if(assumedLength <= 0){
            return new EmptySequence();
        }else{
            return new AssumeLengthSequence(
                Math.floor(assumedLength), source
            );
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.counter().until(i => i >= 8);
            // Higher doesn't know how long this sequence is before consuming it
            hi.assertUndefined(seq.length);
            // But you do! And here's how to let higher in on it.
            const withLength = seq.assumeLength(8);
            hi.assert(withLength.length() === 8);
            hi.assertEqual(withLength, [0, 1, 2, 3, 4, 5, 6, 7]);
        },
        "zeroLength": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => true);
            hi.assertEmpty(seq.assumeLength(0));
        },
        "infiniteLength": hi => {
            const seq = hi.counter().until(i => i < 0).assumeLength(Infinity);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([0, 1, 2, 3, 4, 5]));
        },
        "emptyInput": hi => {
            const seq = hi.recur(i => i).until(i => true).assumeLength(0);
            hi.assertEmpty(seq);
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("hello");
            hi.assert(seq.assumeLength(10) === seq);
            hi.assert(seq.assumeLength(Infinity) === seq);
        },
        "knownLengthInput": hi => {
            const seq = hi.range(10);
            hi.assert(seq.assumeLength(10) === seq);
            hi.assert(seq.assumeLength(100) === seq);
        },
    },
});

export default assumeLength;
