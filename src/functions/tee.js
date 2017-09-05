import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const TeeSequence = defineSequence({
    constructor: function TeeSequence(
        source, elementBuffer, bufferIndex = undefined
    ){
        this.source = source;
        this.elementBuffer = elementBuffer;
        this.bufferIndex = bufferIndex || 0;
        // TODO: Don't do this
        if(!source.nativeLength) this.nativeLength = undefined;
        if(!source.nativeIndex) this.nativeIndex = undefined;
        if(!source.nativeIndexNegative) this.nativeIndexNegative = undefined;
        if(!source.nativeSlice) this.nativeSlice = undefined;
        if(!source.nativeSliceNegative) this.nativeSliceNegative = undefined;
        if(!source.nativeSliceMixed) this.nativeSliceMixed = undefined;
        if(!source.has) this.has = undefined;
        if(!source.get) this.get = undefined;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.bufferIndex >= (this.elementBuffer.elements.length + this.elementBuffer.offset) && this.source.done();
    },
    length: function(){
        return this.source.nativeLength();
    },
    front: function(){
        const index = this.bufferIndex - this.elementBuffer.offset;
        if(index < this.elementBuffer.elements.length){
            return this.elementBuffer.elements[index];
        }else{
            return this.source.front();
        }
    },
    popFront: function(){
        this.bufferIndex++;
        const index = this.bufferIndex - this.elementBuffer.offset;
        if(index >= this.elementBuffer.elements.length && !this.source.done()){
            this.elementBuffer.elements.push(this.source.nextFront());
        }
        for(const sequence of this.elementBuffer.sequences){
            if(sequence.bufferIndex <= this.elementBuffer.offset) return;
        }
        this.elementBuffer.elements.shift();
        this.elementBuffer.offset++;
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    indexNegative: function(i){
        return this.source.nativeIndexNegative(i);
    },
    slice: function(i, j){
        return this.source.nativeSlice(i, j);
    },
    sliceNegative: function(i, j){
        return this.source.nativeSliceNegative(i, j);
    },
    sliceMixed: function(i, j){
        return this.source.nativeSliceMixed(i, j);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const sequence = new TeeSequence(
            this.source, this.elementBuffer, this.bufferIndex
        );
        this.elementBuffer.sequences.push(sequence);
        return sequence;
    },
    // Implementation is weird because rebasing this sequence must not affect
    // the state of its companion TeeSequences.
    rebase: function(source){
        // Remove from buffer
        const otherSequences = [];
        for(const sequence of this.elementBuffer.sequences){
            if(sequence !== this) otherSequences.push(sequence);
        }
        this.elementBuffer.sequences = otherSequences;
        // Change methods
        this.source = source;
        this.done = function(){
            return this.source.done();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            return this.source.popFront();
        };
        this.rebase = function(source){
            this.source = source;
        };
        return this;
    },
});

// Get a buffer object with some number of TeeSequences attached.
export const getTeeBuffer = (count, source) => {
    const buffer = {
        sequences: [],
        offset: 0,
        elements: []
    };
    for(let i = 0; i < count; i++){
        buffer.sequences.push(new TeeSequence(source, buffer));
    }
    return buffer;
};

// Produce several sequences enumerating the elements of a single source
// sequence. Returns copies of the input sequence if it supports copying,
// otherwise returns an array of TeeSequences that behave as though they
// were copies of the input.
// For uncopyable bounded inputs, if one of the output sequences will be mostly
// or fully consumed before any one of the others, it would be more performant
// to call tee(sequence.array()).
export const tee = wrap({
    name: "tee",
    attachSequence: true,
    async: false,
    sequences: [
        TeeSequence
    ],
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (count, source) => {
        if(count === 0){
            return [];
        }else if(count === 1){
            return [source];
        }else{
            if(source.copy){
                const sequences = [];
                for(let i = 0; i < count; i++){
                    sequences.push(source.copy())
                }
                return sequences;
            }else{
                return getTeeBuffer(count, source).sequences;
            }
        }
    },
});
