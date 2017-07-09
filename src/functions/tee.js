import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const TeeSequence = Sequence.extend({
    constructor: function TeeSequence(source, elementBuffer, bufferIndex){
        this.source = source;
        this.elementBuffer = elementBuffer;
        this.bufferIndex = 0;
        if(!source.length) this.length = null;
        if(!source.left) this.left = null;
        if(!source.index) this.index = null;
        if(!source.slice) this.slice = null;
        if(!source.has) this.has = null;
        if(!source.get) this.get = null;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.elementBuffer.length === 0 && this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        return this.source.left() + (
            this.elementBuffer.length - (this.bufferIndex - this.elementBuffer.offset)
        );
    },
    front: function(){
        const index = this.bufferIndex - this.elementBuffer.offset;
        if(index < this.elementBuffer.length){
            return this.elementBuffer[index];
        }else{
            return this.source.front();
        }
    },
    popFront(){
        this.bufferIndex++;
        if(this.bufferIndex - this.elementBuffer.offset >= this.elementBuffer.length){
            this.elementBuffer.push(this.source.nextFront());
        }
        for(const sequence of this.elementBuffer.sequences){
            if(sequence.bufferIndex <= this.elementBuffer.offset) return;
        }
        this.elementBuffer.shift();
        this.elementBuffer.offset++;
    },
    back: null,
    popBack: null,
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
        const sequence = new TeeSequence(
            this.source, this.elementBuffer, this.bufferIndex
        );
        this.elementBuffer.sequences.push(sequence);
        return sequence;
    },
    reset: null,
});

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
            const sequences = [];
            const sequenceCount = count;
            if(source.copy){
                for(let i = 0; i < sequenceCount; i++){
                    sequence.push(source.copy())
                }
            }else{
                const buffer = [];
                buffer.offset = 0;
                for(let i = 0; i < sequenceCount; i++){
                    sequences.push(new TeeSequence(source, buffer));
                }
                buffer.sequences = sequences;
            }
            return sequences;
        }
    },
});
