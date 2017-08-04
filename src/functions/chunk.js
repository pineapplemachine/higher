import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {ArgumentsError} from "../errors/ArgumentsError";

import {copyable} from "./copyable";
import {HeadSequence} from "./head";
import {SingularMapSequence} from "./map";
import {InfiniteRepeatElementSequence} from "./repeatElement";

// Implement chunking for sequences that are copyable but don't have
// both slicing and known length.
export const ForwardChunkSequence = Sequence.extend({
    summary: "Enumerate sub-sequence chunks of an input sequence.",
    supportRequired: [
        "copy"
    ],
    supportsWith: [
        "length", "left", "reset"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a chunk length and an input sequence.
            The chunk length argument must be greater than or equal to one.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ForwardChunkSequence(1, hi.emptySequence()),
        hi => new ForwardChunkSequence(3, hi.emptySequence()),
        hi => new ForwardChunkSequence(1, hi([1, 2, 3, 4, 5, 6, 7])),
        hi => new ForwardChunkSequence(3, hi([1, 2, 3, 4, 5, 6, 7])),
        hi => new ForwardChunkSequence(1, hi("some string")),
        hi => new ForwardChunkSequence(4, hi("some string")),
        hi => new ForwardChunkSequence(1, hi.counter()),
        hi => new ForwardChunkSequence(3, hi.counter()),
        hi => new ForwardChunkSequence(6, hi.counter()),
        hi => new ForwardChunkSequence(3, hi.repeat("hello")),
    ],
    constructor: function ForwardChunkSequence(chunkLength, source){
        ArgumentsError.assert(chunkLength >= 1, {
            isConstructor: true,
            message: "Failed to create sequence",
            detail: "Expected a numeric chunk length of at least 1.",
        });
        this.chunkLength = chunkLength;
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
        const sourceLength = this.source.length();
        const remLength = sourceLength % this.chunkLength;
        return 1 + Math.floor(sourceLength / this.chunkLength) - (remLength === 0);
    },
    left: function(){
        const sourceLeft = this.source.left();
        const remLeft = sourceLeft % this.chunkLength;
        return 1 + Math.floor(sourceLeft / this.chunkLength) - (remLeft === 0);
    },
    front: function(){
        return new HeadSequence(this.chunkLength, this.source.copy());
    },
    popFront: function(){
        for(let i = 0; i < this.chunkLength && !this.source.done(); i++){
            this.source.popFront();
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        return new ForwardChunkSequence(this.chunkLength, this.source.copy());
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

// Implement chunking for sequences with slicing and known length.
export const BidirectionalChunkSequence = Sequence.extend({
    summary: "Enumerate sub-sequence chunks of an input sequence.",
    supportRequired: [
        "slice", "length",
    ],
    supportsWith: [
        "index",
    ],
    supportsAlways: [
        "length", "left", "back", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a chunk length and an input sequence.
            The chunk length argument must be greater than or equal to one.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new BidirectionalChunkSequence(1, hi.emptySequence()),
        hi => new BidirectionalChunkSequence(3, hi.emptySequence()),
        hi => new BidirectionalChunkSequence(1, hi([1, 2, 3, 4, 5, 6, 7])),
        hi => new BidirectionalChunkSequence(3, hi([1, 2, 3, 4, 5, 6, 7])),
        hi => new BidirectionalChunkSequence(1, hi("some string")),
        hi => new BidirectionalChunkSequence(4, hi("some string")),
    ],
    constructor: function BidirectionalChunkSequence(
        chunkLength, source,
        lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        ArgumentsError.assert(chunkLength >= 1, {
            isConstructor: true,
            message: "Failed to create sequence",
            detail: "Expected a numeric chunk length of at least 1.",
        });
        this.chunkLength = chunkLength;
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.frontIndex = frontIndex || 0;
        if(highIndex === undefined){
            const sourceLength = source.length();
            const remLength = sourceLength % chunkLength;
            this.highIndex = 1 + Math.floor(sourceLength / chunkLength) - (remLength === 0);
        }else{
            this.highIndex = highIndex;
        }
        this.backIndex = this.highIndex;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    left: function(){
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        return this.index(this.frontIndex);
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.index(this.backIndex - 1);
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        const low = i * this.chunkLength;
        return this.source.slice(
            low, Math.min(low + this.chunkLength, this.source.length())
        );
    },
    slice: function(i, j){
        return new BidirectionalChunkSequence(
            this.chunkLength, this.source, i, j, i, j
        );
    },
    has: null,
    get: null,
    copy: function(){
        return new BidirectionalChunkSequence(
            this.chunkLength, this.source,
            this.lowIndex, this.highIndex,
            this.frontIndex, this.backIndex
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

export const chunk = wrap({
    name: "chunk",
    summary: "Get a sequence enumerating smaller sub-sequences of an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an input sequence and a number indicating the
            maximum length of each sub-sequence as input.
        `),
        returns: (`
            The function returns a sequence enumerating sub-sequences of the
            input sequence in order.
            The final sub-sequence of the output will be shorter than the
            provided chunk length if the length of the input was not evenly
            divisible by the provided chunk length, otherwise it will be of
            the provided chunk length. All sub-sequences preceding the final
            one will be of the provided length.
        `),
        returnType: {
            "InfiniteRepeatElementSequence": (`
                When the chunk length was zero.
            `),
            "SingularMapSequence": (`
                When the chunk length was one.
            `),
            "BidirectionalChunkSequence": (`
                When the chunk length was greater than one, and the input
                sequence allows slicing and has known length.
            `),
            "ForwardChunkSequence": (`
                When the chunk length was greater than one, and the input
                sequence either doesn't allow slicing or doesn't have
                known length.
            `),
        },
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (chunkLength, source) => {
        if(chunkLength <= 0){
            return new InfiniteRepeatElementSequence([]);
        }else if(chunkLength === 1){
            return new SingularMapSequence(element => [element], source);
        }else if(source.slice && source.length){
            return new BidirectionalChunkSequence(chunkLength, source);
        }else{
            return new ForwardChunkSequence(chunkLength, copyable(source));
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8];
            const chunks = hi.chunk(array, 3);
            hi.assertEqual(chunks, [[1, 2, 3], [4, 5, 6], [7, 8]]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().chunk(3));
        },
        "unboundedInput": hi => {
            const seq = hi.counter().chunk(4);
            hi.assert(seq.startsWith(hi.isEqual, [[0, 1, 2, 3], [4, 5, 6, 7]]));
        },
        "zeroChunkLength": hi => {
            const seq = hi.chunk(0, [1, 2, 3]);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith(hi.isEqual, [[], [], [], []]));
            const element = seq.index(0);
            hi.assert(hi.isArray(element));
            hi.assertEmpty(element);
        },
        "singleChunkLength": hi => {
            const seq = hi.chunk(1, ["how", "are", "you", "?"]);
            hi.assertEqual(seq, [["how"], ["are"], ["you"], ["?"]]);
        },
    },
});

export default chunk;
