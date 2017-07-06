import {wrap} from "../core/wrap";
import {Sequence} from "../core/sequence";

import {EmptySequence} from "./empty";

// Fallback implementation of head function for when slicing is unavailable.
export const HeadSequence = function(elements, source, frontIndex = 0){
    this.elements = elements;
    this.source = source;
    this.frontIndex = frontIndex;
    this.maskAbsentMethods(source);
};

HeadSequence.prototype = Object.create(Sequence.prototype);
HeadSequence.prototype.constructor = HeadSequence;
Object.assign(HeadSequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.frontIndex >= this.elements || this.source.done();
    },
    length: function(){
        const sourceLength = this.source.length();
        return sourceLength < this.elements ? sourceLength : this.elements;
    },
    left: function(){
        const sourceLeft = this.source.left();
        const indexLeft = this.elements - this.frontIndex;
        return sourceLeft < indexLeft ? sourceLeft : indexLeft;
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
        this.frontIndex++;
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new HeadSequence(
            this.elements, this.source.copy(), this.frontIndex
        );
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        return this;
    },
});

// Get a sequence for enumerating the first so many elements of the input.
// The resulting sequence may be shorter than the length specified, but
// will never be longer.
export const head = wrap({
    names: ["head", "take"],
    attachSequence: true,
    async: false,
    sequences: [
        HeadSequence
    ],
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (elements, source) => {
        if(elements < 1){
            return new EmptySequence();
        }else if(source.length && source.slice){
            const length = source.length();
            return source.slice(0, length < elements ? length : elements);
        }else{
            return new HeadSequence(elements, source);
        }
    },
});

export const take = head;

export default head;
