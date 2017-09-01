import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {FiniteRepeatElementSequence} from "./repeatElement";

export const FinitePadLeftSequence = defineSequence({
    summary: "Enumerate an finitely repeated element before a source sequence.",
    supportsWith: [
        "length", "left", "back", "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an input sequence, the element to pad the
            front of that sequence with, and the number of times to repeat the
            element.
        `),
        methods: {
            "padWith": {
                introduced: "higher@1.0.0",
                arguments: {ordered: [wrap.expecting.anything, wrap.expecting.number]},
                expects: (`
                    The function expects as its arguments the element to pad the
                    front of the source sequence with, and the number of times
                    to repeat that element.
                `),
                returns: (`
                    The function returns the sequence itself.
                `),
            }
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new FinitePadLeftSequence(hi.emptySequence(), "!", 0),
        hi => new FinitePadLeftSequence(hi.emptySequence(), "!", 5),
        hi => new FinitePadLeftSequence(hi("hello"), "!", 0),
        hi => new FinitePadLeftSequence(hi("hello"), "!", 5),
        hi => new FinitePadLeftSequence(hi("hello"), "!", 8),
        hi => new FinitePadLeftSequence(hi("hello"), "!", 16),
        hi => new FinitePadLeftSequence(hi([1, 2, 3, 4]), 0, 0),
        hi => new FinitePadLeftSequence(hi([1, 2, 3, 4]), 0, 4),
        hi => new FinitePadLeftSequence(hi([1, 2, 3, 4]), 0, 8),
        hi => new FinitePadLeftSequence(hi.repeat("hello"), "!", 4),
    ],
    constructor: function FinitePadLeftSequence(
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
        return this.source.nativeLength() + this.padTotal;
    },
    front: function(){
        return (this.padCount >= this.padTotal ?
            this.source.front() : this.padElement
        );
    },
    popFront: function(){
        this.padCount++;
        if(this.padCount > this.padTotal){
            return this.source.popFront();
        }
    },
    back: function(){
        return this.source.done() ? this.padElement : this.source.back();
    },
    popBack: function(){
        if(this.source.done()){
            this.padCount++;
        }else{
            return this.source.popBack();
        }
    },
    index: function(i){
        return (i < this.padTotal ?
            this.padElement : this.source.nativeIndex(i - this.padTotal)
        );
    },
    slice: function(i, j){
        if(j < this.padTotal){
            return new FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(i >= this.padTotal){
            return this.source.nativeSlice(i - this.padTotal, j - this.padTotal);
        }else{
            return new PadLeftSequence(
                this.source.nativeSlice(0, j - this.padTotal),
                this.padElement, this.padTotal - i
            );
        }
    },
    copy: function(){
        return new FinitePadLeftSequence(
            this.source.copy(), this.padElement,
            this.padTotal, this.padCount
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const InfinitePadLeftSequence = defineSequence({
    summary: "Enumerate an infinitely repeated element before a source sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an input sequence and the element to
            infinitely pad the front of that sequence with.
        `),
        methods: {
            "padWith": {
                introduced: "higher@1.0.0",
                arguments: {one: wrap.expecting.anything},
                expects: (`
                    The function expects as its arguments the element to pad the
                    front of the source sequence with.
                `),
                returns: (`
                    The function returns the sequence itself.
                `),
            }
        },
    },
    supportsAlways: [
        "index", "slice",
    ],
    supportsWith: [
        "back", "copy", "reset",
    ],
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new InfinitePadLeftSequence(hi.emptySequence(), "!"),
        hi => new InfinitePadLeftSequence(hi("hello"), "!"),
        hi => new InfinitePadLeftSequence(hi.repeat("abc"), "!"),
    ],
    constructor: function InfinitePadLeftSequence(
        source, padElement
    ){
        this.source = source;
        this.padElement = padElement;
        if(!source.back) this.back = undefined;
        if(!source.copy) this.copy = undefined;
    },
    padWith: function(element){
        this.padElement = element;
        return this;
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.padElement;
    },
    popFront: () => {},
    back: function(){
        return this.source.done() ? this.padElement : this.source.back();
    },
    popBack: function(){
        if(!this.source.done()) this.source.popBack();
    },
    index: function(i){
        return this.padElement;
    },
    slice: function(i, j){
        return new FiniteRepeatElementSequence(j - i, this.padElement);
    },
    copy: function(){
        return new InfinitePadLeftSequence(
            this.source.copy(), this.padElement
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const padLeftCount = wrap({
    name: "padLeftCount",
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
            return new FinitePadLeftSequence(source, element, count);
        }else{
            return new InfinitePadLeftSequence(source, element);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi("123").padLeftCount(2, "0"), "00123");
        },
        "numericInput": hi => {
            hi.assertEqual(hi([1, 2, 3]).padLeftCount(3, 0), [0, 0, 0, 1, 2, 3]);
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().padLeftCount(3, "!"), "!!!");
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("abc").padLeftCount(2, "!");
            hi.assert(seq.startsWith("!!abcabcabc"));
            hi.assert(seq.endsWith("bcabcabcabc"));
        },
        "padBoundedInfinitely": hi => {
            const seq = hi("hello").padLeftCount(Infinity, "_");
            hi.assert(seq.startsWith("______________"));
            hi.assert(seq.endsWith("_________hello"));
        },
        "padUnboundedInfinitely": hi => {
            const seq = hi.repeat("abc").padLeftCount(Infinity, "+");
            hi.assert(seq.startsWith("++++++++++++++"));
            hi.assert(seq.endsWith("bcabcabcabcabc"));
        },
        "padNoElements": hi => {
            hi.assertEqual(hi("hello").padLeftCount(0, "_"), "hello");
            hi.assert(hi.repeat("abc").padLeftCount(0, "_").startsWith("abcabc"));
        },
    },
});

export default padLeftCount;
