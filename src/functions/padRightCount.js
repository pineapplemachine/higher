import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {FiniteRepeatElementSequence} from "./repeatElement";

export const FinitePadRightSequence = defineSequence({
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
                arguments: {ordered: [wrap.expecting.anything, wrap.expecting.number]},
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
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new FinitePadRightSequence(hi.emptySequence(), "!", 0),
        hi => new FinitePadRightSequence(hi.emptySequence(), "!", 5),
        hi => new FinitePadRightSequence(hi("hello"), "!", 0),
        hi => new FinitePadRightSequence(hi("hello"), "!", 5),
        hi => new FinitePadRightSequence(hi("hello"), "!", 8),
        hi => new FinitePadRightSequence(hi("hello"), "!", 16),
        hi => new FinitePadRightSequence(hi([1, 2, 3, 4]), 0, 0),
        hi => new FinitePadRightSequence(hi([1, 2, 3, 4]), 0, 4),
        hi => new FinitePadRightSequence(hi([1, 2, 3, 4]), 0, 8),
        hi => new FinitePadRightSequence(hi.repeat("hello"), "!", 4)
    ],
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
        return this.source.nativeLength() + this.padTotal;
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
        return (i >= this.source.nativeLength() ?
            this.padElement : this.source.nativeIndex(i)
        );
    },
    slice: function(i, j){
        const sourceLength = this.source.nativeLength();
        if(i >= sourceLength){
            return new FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(j < sourceLength){
            return this.source.nativeSlice(i, j);
        }else{
            return new PadRightSequence(
                this.source.nativeSlice(i, sourceLength),
                this.padElement, j - sourceLength
            );
        }
    },
    copy: function(){
        return new FinitePadRightSequence(
            this.source.copy(), this.padElement,
            this.padTotal, this.padCount
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const InfinitePadRightSequence = defineSequence({
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
                arguments: {one: wrap.expecting.anything},
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
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new InfinitePadRightSequence(hi.emptySequence(), "!"),
        hi => new InfinitePadRightSequence(hi("hello"), "!"),
        hi => new InfinitePadRightSequence(hi.repeat("abc"), "!"),
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
        if(this.source.unbounded() || i < this.source.nativeLength()){
            return this.source.nativeIndex(i);
        }else{
            return this.padElement;
        }
    },
    slice: function(i, j){
        if(this.source.unbounded()){
            return this.source.nativeSlice(i, j);
        }else{
            const sourceLength = this.source.nativeLength();
            if(j < sourceLength){
                return this.source.nativeSlice(i, j);
            }else if(i < sourceLength){
                return new FinitePadRightSequence(
                    this.soruce.nativeSlice(i, sourceLength),
                    this.padElement, j - sourceLength
                );
            }else{
                return new FiniteRepeatElementSequence(
                    j - i, this.padElement
                );
            }
        }
    },
    copy: function(){
        return new InfinitePadRightSequence(
            this.source.copy(), this.padElement
        );
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
