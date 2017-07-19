import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {FiniteRepeatElementSequence} from "./repeatElement";

export const FinitePadRightSequence = Sequence.extend({
    summary: "Enumerate an finitely repeated element after a source sequence.",
    supportsWith: [
        "length", "left", "back", "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an input sequence, the element to pad the
            back of that sequence with, and the number of times to repeat the
            element.
        `),
        methods: {
            "padWith": {
                introduced: "higher@1.0.0",
                expects: (`
                    The function expects as its arguments the element to pad the
                    back of the source sequence with, and the number of times
                    to repeat that element.
                `),
                returns: (`
                    The function returns the sequence itself.
                `),
            }
        },
    },
    constructor: function FinitePadRightSequence(
        source, padElement, padTotal, padCount = undefined
    ){
        this.source = source;
        this.padElement = padElement;
        this.padTotal = padTotal;
        this.padCount = padCount || 0;
        this.maskAbsentMethods(source);
    },
    padWith: function(element, padTotal){
        this.padElement = element;
        this.padTotal = padTotal;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.padCount >= this.padTotal && this.source.done();
    },
    length: function(){
        return this.source.length() + this.padTotal;
    },
    left: function(){
        return this.source.left() + (this.padTotal - this.padCount);
    },
    front: function(){
        return this.source.done() ? this.padElement : this.source.front();
    },
    popFront: function(){
        if(this.source.done()){
            this.padCount++;
        }else{
            return this.source.popFront();
        }
    },
    back: function(){
        return (this.padCount >= this.padTotal ?
            this.source.back() : this.padElement
        );
    },
    popBack: function(){
        this.padCount++;
        if(this.padCount > this.padTotal){
            return this.source.popBack();
        }
    },
    index: function(i){
        return i >= this.source.length() ? this.padElement : this.source.index(i);
    },
    slice: function(i, j){
        const sourceLength = this.source.length();
        if(i >= sourceLength){
            return new FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(j < sourceLength){
            return this.source.slice(i, j);
        }else{
            return new PadRightSequence(
                this.source.slice(i, sourceLength),
                this.padElement, j - sourceLength
            );
        }
    },
    has: null,
    get: null,
    copy: function(){
        return new FinitePadRightSequence(
            this.source.copy(), this.padElement,
            this.padTotal, this.padCount
        );
    },
    reset: function(){
        this.source.reset();
        this.padCount = 0;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const InfinitePadRightSequence = Sequence.extend({
    summary: "Enumerate an infinitely repeated element after a source sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an input sequence and the element to
            infinitely pad the back of that sequence with.
        `),
        methods: {
            "padWith": {
                introduced: "higher@1.0.0",
                expects: (`
                    The function expects as its arguments the element to pad the
                    back of the source sequence with.
                `),
                returns: (`
                    The function returns the sequence itself.
                `),
            }
        },
    },
    supportsAlways: [
        "back",
    ],
    supportsWith: [
        "index", "slice", "copy", "reset",
    ],
    constructor: function InfinitePadRightSequence(
        source, padElement
    ){
        this.source = source;
        this.padElement = padElement;
        if(!source.index || (!source.length && !source.unbounded())) this.index = null;
        if(!source.slice || (!source.length && !source.unbounded())) this.slice = null;
        if(!source.copy) this.copy = null;
        if(!source.reset) this.reset = null;
    },
    padWith: function(element){
        this.padElement = element;
        return this;
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    length: null,
    left: null,
    front: function(){
        return this.source.done() ? this.padElement : this.source.front();
    },
    popFront: function(){
        if(!this.source.done()) this.source.popFront();
    },
    back: function(){
        return this.padElement;
    },
    popBack: () => {},
    index: function(i){
        if(this.source.unbounded() || i < this.source.length()){
            return this.source.index(i);
        }else{
            return this.padElement;
        }
    },
    slice: function(i, j){
        if(this.source.unbounded()){
            return this.source.slice(i, j);
        }else{
            const sourceLength = this.source.length();
            if(j < sourceLength){
                return this.source.slice(i, j);
            }else if(i < sourceLength){
                return new FinitePadRightSequence(
                    this.soruce.slice(i, sourceLength),
                    this.padElement, j - sourceLength
                );
            }else{
                return new FiniteRepeatElementSequence(
                    j - i, this.padElement
                );
            }
        }
    },
    has: null,
    get: null,
    copy: function(){
        return new InfinitePadRightSequence(
            this.source.copy(), this.padElement
        );
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

export const padRightCount = wrap({
    name: "padRightCount",
    summary: "Pad the front of an input sequence with some repeated element.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
        related: [
            "padLeft", "padRightCount",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.sequence, wrap.expecting.number, wrap.expecting.anything
        ],
    },
    implementation: (source, count, element) => {
        if(count <= 0){
            return source;
        }else if(isFinite(count)){
            return new FinitePadRightSequence(source, element, count);
        }else{
            return new InfinitePadRightSequence(source, element);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi("123").padRightCount(2, "0"), "12300");
        },
        "numericInput": hi => {
            hi.assertEqual(hi([1, 2, 3]).padRightCount(3, 0), [1, 2, 3, 0, 0, 0]);
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().padRightCount(3, "!"), "!!!");
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("abc").padRightCount(2, "!");
            hi.assert(seq.startsWith("abcabcabc"));
            hi.assert(seq.endsWith("cabcabc!!"));
        },
        "padBoundedInfinitely": hi => {
            const seq = hi("hello").padRightCount(Infinity, "_");
            hi.assert(seq.startsWith("hello_________"));
            hi.assert(seq.endsWith("______________"));
        },
        "padUnboundedInfinitely": hi => {
            const seq = hi.repeat("abc").padRightCount(Infinity, "+");
            hi.assert(seq.startsWith("abcabcabcabc"));
            hi.assert(seq.endsWith("++++++++++++"));
        },
        "padNoElements": hi => {
            hi.assertEqual(hi("hello").padRightCount(0, "_"), "hello");
            hi.assert(hi.repeat("abc").padRightCount(0, "_").endsWith("abcabc"));
        },
    },
});

export default padRightCount;
