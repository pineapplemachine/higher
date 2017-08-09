import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {OneElementSequence} from "./one";
import {InfiniteRepeatElementSequence} from "./repeatElement";

// Implement stride using repeated popping of elements.
export const PoppingStrideSequence = defineSequence({
    summary: "Enumerate only every nth element of an input sequence.",
    supportsWith: [
        "length", "left", "back", "copy", "reset",
    ],
    overrides: [
        "stride",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as input a stride length and an input sequence.
            The stride length must be a positive, nonzero integer.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "strideOverrideFiniteStrideLength": hi => {
            const array = hi([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            const seq = new hi.sequence.PoppingStrideSequence(2, array);
            hi.assertEqual(seq.copy(), [0, 2, 4, 6, 8, 10]);
            hi.assertEqual(seq.stride(2), [0, 4, 8]);
        },
        "strideOverrideZeroStrideLength": hi => {
            const source = new hi.sequence.PoppingStrideSequence(2, hi("abc"));
            const seq = source.stride(0);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith("aaaaaaa"));
        },
        "strideOverrideZeroStrideLengthEmptyInput": hi => {
            const seq = new hi.sequence.PoppingStrideSequence(2, hi(""));
            hi.assertEmpty(seq.stride(0));
        },
        "strideOverrideSingleStrideLength": hi => {
            const seq = new hi.sequence.PoppingStrideSequence(2, hi([1, 2, 3]));
            hi.assert(seq.stride(1) === seq);
        },
        "strideOverrideInfiniteStrideLength": hi => {
            const seq = new hi.sequence.PoppingStrideSequence(2, hi([1, 2, 3]));
            hi.assertEqual(seq.stride(Infinity), [1]);
        },
        "strideOverrideInfiniteStrideLengthEmptyInput": hi => {
            const seq = new hi.sequence.PoppingStrideSequence(2, hi(""));
            hi.assertEmpty(seq.stride(Infinity));
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new PoppingStrideSequence(1, hi.emptySequence()),
        hi => new PoppingStrideSequence(10, hi.emptySequence()),
        hi => new PoppingStrideSequence(1, hi([1, 2, 3, 4])),
        hi => new PoppingStrideSequence(2, hi([1, 2, 3, 4])),
        hi => new PoppingStrideSequence(3, hi([1, 2, 3, 4])),
        hi => new PoppingStrideSequence(4, hi([1, 2, 3, 4])),
        hi => new PoppingStrideSequence(8, hi([1, 2, 3, 4])),
        hi => new PoppingStrideSequence(1, hi.repeat("hello")),
        hi => new PoppingStrideSequence(3, hi.repeat("hello")),
        hi => new PoppingStrideSequence(1, hi.counter()),
        hi => new PoppingStrideSequence(5, hi.counter()),
    ],
    constructor: function PoppingStrideSequence(strideLength, source){
        this.strideLength = strideLength;
        this.source = source;
        this.maskAbsentMethods(source);
    },
    stride: function(strideLength){
        if(strideLength === 0){
            return (this.source.done() ?
                new EmptySequence() :
                new InfiniteRepeatElementSequence(this.source.front())
            );
        }else if(strideLength === 1){
            return this;
        }else if(!isFinite(strideLength)){
            return (this.source.done() ?
                new EmptySequence() :
                new OneElementSequence(this.source.front())
            );
        }else{
            return new PoppingStrideSequence(
                strideLength * this.strideLength, this.source
            );
        }
    },
    initializeBack: function(){
        const sourceLength = this.source.length();
        const remainder = sourceLength % this.strideLength;
        const pop = (remainder || this.strideLength) - 1;
        for(let i = 0; i < pop && !this.source.done(); i++){
            this.source.popBack();
        }
        this.back = function(){
            return this.source.back();
        };
        this.popBack = function(){
            for(let i = 0; i < this.strideLength && !this.source.done(); i++){
                this.source.popBack();
            }
        };
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
        return Math.ceil(this.source.length() / this.strideLength);
    },
    left: function(){
        return Math.ceil(this.source.left() / this.strideLength);
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        for(let i = 0; i < this.strideLength && !this.source.done(); i++){
            this.source.popFront();
        }
    },
    back: function(){
        this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        this.initializeBack();
        return this.popBack();
    },
    copy: function(){
        const copy = new PoppingStrideSequence(this.strideLength, this.source.copy());
        copy.back = this.back;
        copy.popBack = this.popBack;
        return copy;
    },
    reset: function(){
        this.source.reset();
        delete this.back;
        delete this.popBack;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Implement stride using indexing.
// For this to be available, the source must support index and length methods.
export const IndexStrideSequence = defineSequence({
    summary: "Enumerate only every nth element of an input sequence.",
    supportRequired: [
        "index", "length",
    ],
    supportsWith: [
        "left", "slice", "copy", "reset",
    ],
    overrides: [
        "stride",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as input a stride length and an input sequence.
            The stride length must be a positive, nonzero integer.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new IndexStrideSequence(1, hi.emptySequence()),
        hi => new IndexStrideSequence(10, hi.emptySequence()),
        hi => new IndexStrideSequence(1, hi([1, 2, 3, 4])),
        hi => new IndexStrideSequence(2, hi([1, 2, 3, 4])),
        hi => new IndexStrideSequence(3, hi([1, 2, 3, 4])),
        hi => new IndexStrideSequence(4, hi([1, 2, 3, 4])),
        hi => new IndexStrideSequence(8, hi([1, 2, 3, 4])),
        hi => new IndexStrideSequence(2, hi("hello world")),
        hi => new IndexStrideSequence(8, hi("hello world")),
        hi => new IndexStrideSequence(16, hi("hello world")),
    ],
    constructor: function IndexStrideSequence(
        strideLength, source, lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        this.strideLength = strideLength;
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.frontIndex = frontIndex || this.lowIndex;
        if(highIndex !== undefined){
            this.highIndex = highIndex;
        }else{
            const sourceLength = source.length();
            const remainder = sourceLength % strideLength;
            this.highIndex = Math.floor(sourceLength - (remainder || strideLength) + 1);
        }
        this.backIndex = backIndex === undefined ? this.highIndex : backIndex;
        this.maskAbsentMethods(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "strideOverrideFiniteStrideLength": hi => {
            const array = hi([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            const seq = new hi.sequence.IndexStrideSequence(2, array);
            hi.assertEqual(seq.copy(), [0, 2, 4, 6, 8, 10]);
            hi.assertEqual(seq.stride(2), [0, 4, 8]);
        },
        "strideOverrideZeroStrideLength": hi => {
            const source = new hi.sequence.IndexStrideSequence(2, hi("abc"));
            const seq = source.stride(0);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith("aaaaaaa"));
        },
        "strideOverrideZeroStrideLengthEmptyInput": hi => {
            const seq = new hi.sequence.IndexStrideSequence(2, hi(""));
            hi.assertEmpty(seq.stride(0));
        },
        "strideOverrideSingleStrideLength": hi => {
            const seq = new hi.sequence.IndexStrideSequence(2, hi([1, 2, 3]));
            hi.assert(seq.stride(1) === seq);
        },
        "strideOverrideInfiniteStrideLength": hi => {
            const seq = new hi.sequence.IndexStrideSequence(2, hi([1, 2, 3]));
            hi.assertEqual(seq.stride(Infinity), [1]);
        },
        "strideOverrideInfiniteStrideLengthEmptyInput": hi => {
            const seq = new hi.sequence.IndexStrideSequence(2, hi(""));
            hi.assertEmpty(seq.stride(Infinity));
        },
    },
    stride: function(strideLength){
        if(strideLength === 0){
            return (this.source.done() ?
                new EmptySequence() :
                new InfiniteRepeatElementSequence(this.source.front())
            );
        }else if(strideLength === 1){
            return this;
        }else if(!isFinite(strideLength)){
            return (this.source.done() ?
                new EmptySequence() :
                new OneElementSequence(this.source.front())
            );
        }else{
            return new IndexStrideSequence(
                strideLength * this.strideLength, this.source
            );
        }
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return Math.ceil(this.source.length() / this.strideLength);
    },
    left: function(){
        return Math.ceil(this.source.left() / this.strideLength);
    },
    front: function(){
        return this.source.index(Math.floor(this.frontIndex));
    },
    popFront: function(){
        this.frontIndex += this.strideLength;
    },
    back: function(){
        return this.source.index(Math.floor(this.backIndex - 1));
    },
    popBack: function(){
        this.backIndex -= this.strideLength;
    },
    index: function(i){
        return this.source.index(Math.floor(i * this.strideLength));
    },
    slice: function(i, j){
        return new IndexStrideSequence(
            this.strideLength, this.source,
            this.lowIndex + i * this.strideLength,
            this.lowIndex + j * this.strideLength
        );
    },
    copy: function(){
        return new IndexStrideSequence(
            this.strideLength, this.source, this.lowIndex,
            this.highIndex, this.frontIndex, this.backIndex
        );
    },
    reset: function(){
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const stride = wrap({
    name: "stride",
    summary: "Enumerate only every nth element of an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and a stride length as input.
            The stride length must be a positive, nonzero integer.
        `),
        returns: (`
            The function returns a sequence which returns the first element,
            then the nth element, then the 2nth element, and so on where n is
            the provided stride length.
        `),
        returnType: {
            "EmptySequence": (`
                When the stride length was either zero or #Infinity and the
                input sequence was empty.
            `),
            "InfiniteRepeatElementSequence": (`
                When the stride length was zero and the input sequence was
                not empty.
            `),
            "OneElementSequence": (`
                When the stride length was #Infinity and the input sequence was
                not empty.
            `),
            "typeof inputSequence": (`
                When the stride length was exactly #1.
            `),
            "IndexStrideSequence": (`
                When the input sequence has known length and supports indexing,
                and the stride length was neither #1, #0, or #Infinity.
            `),
            "PoppingStrideSequence": (`
                When the input sequence either does not have known length or
                does not support indexing, and the stride length was neither
                #1, #0, or #Infinity.
            `),
        },
        examples: [
            "basicUsage",
        ],
        related: [
            "repeatEachElement",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: {one: wrap.expecting.nonNegativeInteger},
            sequences: 1
        }
    },
    implementation: (strideLength, source) => {
        if(strideLength <= 0){
            return (source.done() ?
                new EmptySequence() :
                new InfiniteRepeatElementSequence(source.front())
            );
        }else if(strideLength === 1){
            return source;
        }else if(!isFinite(strideLength)){
            return (source.done() ?
                new EmptySequence() :
                new OneElementSequence(source.front())
            );
        }else if(source.index && source.length){
            return new IndexStrideSequence(strideLength, source);
        }else{
            return new PoppingStrideSequence(strideLength, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const string = "h__e__l__l__o";
            hi.assertEqual(hi.stride(3, string), "hello");
        },
        "singleStrideLength": hi => {
            const seq = hi.range(10);
            hi.assert(seq.stride(1) === seq);
        },
        "zeroStrideLength": hi => {
            const seq = hi.stride(0, [0, 1, 2]);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([0, 0, 0, 0, 0, 0]));
        },
        "zeroStrideLengthEmptyInput": hi => {
            const seq = hi.emptySequence().stride(0);
            hi.assertEmpty(seq);
        },
        "largeStrideLength": hi => {
            hi.assertEqual(hi.stride(3, "abc"), "a");
            hi.assertEqual(hi.stride(10, [0, 1, 2]), [0]);
        },
        "infiniteStrideLength": hi => {
            hi.assertEmpty(hi.emptySequence().stride(Infinity));
            hi.assertEqual(hi.stride(Infinity, [1, 2, 3, 4]), [1]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().stride(2));
        },
        "unboundedInput": hi => {
            const seq = hi.repeat("hello").stride(3);
            hi.assert(seq.startsWith("hleolhleol"));
        },
    },
});

export default stride;
