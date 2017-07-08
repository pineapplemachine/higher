/* @Dependencies */

import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {HeadSequence} from "./head";

/* @Documentation

@Summary

Chunk an input sequence into a sequence containing many ordered sub-sequences.

@Params

The function accepts a sequence to be chunked and a number indicating the
length of each chunk.
Note that the last chunk in the sequence will be shorter than the provided
length if the length of the input sequence was not evenly divisible by the
chunk length.

@Returns

Returns a new sequence enumerating the chunks of the input sequence.

@Warnings

If the input sequence supports slicing and has known length, then the
outputted sequence will be bidirectional. Otherwise, if the input sequence
supports copying, the outputted sequence will be unidirectional.
If the input sequence meets neither of those requirements but is at least
known to be bounded, then it will be eagerly consumed in order to construct
a bidirectional chunking sequence from it.

If the input does not have known length, cannot be sliced, cannot be copied,
and is not known to be bounded, then an error will be thrown.

*/

/* @Implementation */

// Implement chunking for sequences that are copyable but don't have
// both slicing and known length.
export const ForwardChunkSequence = function(chunkLength, source){
    if(!source.copy) throw "Input must be copyable.";
    this.chunkLength = chunkLength;
    this.source = source;
    this.maskAbsentMethods(source);
};

// Implement chunking for sequences with slicing and known length.
export const BidirectionalChunkSequence = function(
    chunkLength, source,
    lowIndex = undefined, highIndex = undefined,
    frontIndex = undefined, backIndex = undefined
){
    if(!source.slice) throw "Input must support slicing.";
    if(!source.length) throw "Input must have known length.";
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
};

ForwardChunkSequence.prototype = Object.create(Sequence.prototype);
ForwardChunkSequence.prototype.constructor = ForwardChunkSequence;
Object.assign(ForwardChunkSequence.prototype, {
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
});

BidirectionalChunkSequence.prototype = Object.create(Sequence.prototype);
BidirectionalChunkSequence.prototype.constructor = BidirectionalChunkSequence;
Object.assign(BidirectionalChunkSequence.prototype, {
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
});

export const chunk = wrap({
    name: "chunk",
    attachSequence: true,
    async: false,
    sequences: [
        ForwardChunkSequence,
        BidirectionalChunkSequence
    ],
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (chunkLength, source) => {
        if(source.slice && source.length){
            return new BidirectionalChunkSequence(chunkLength, source);
        }else if(source.copy){
            return new ForwardChunkSequence(chunkLength, source);
        }else if(source.bounded()){
            source.forceEager();
            return new BidirectionalChunkSequence(chunkLength, source);
        }else{
            throw "Failed to chunk sequence."; // TODO: Better error
        }
    },
});

export default chunk;
