import Sequence from "../core/sequence";
import array from "./array";

const DropTailSequence = function(dropElements, source, frontIndex = 0){
    if(!source.length){
        throw "Error dropping tail: Input sequence must have known length.";
    }
    this.dropElements = dropElements;
    this.source = source;
    this.frontIndex = frontIndex;
    this.lastIndex = source.length() - dropElements;
    this.maskAbsentMethods(source);
};

DropTailSequence.prototype = Object.create(Sequence.prototype);
DropTailSequence.prototype.constructor = DropTailSequence;
Object.assign(DropTailSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.frontIndex >= this.lastIndex;
    },
    length: function(){
        return this.source.length() - this.dropElements;
    },
    left: function(){
        return this.lastIndex - this.frontIndex;
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
    index: function(i){
        return this.source.index(i);
    },
    // Don't create DropTailSequences for sequences that already have slicing!
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new DropTailSequence(
            this.dropElements, this.source.copy(), this.frontIndex
        );
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        return this;
    },
});

/**
 *
 * @param {*} dropElements
 * @param {*} source
 */
const dropTail = (dropElements, source) => {
    if(dropElements <= 0){
        return source;
    }else if(source.slice && source.length){
        return source.slice(0, source.length() - dropElements);
    }else if(source.length){
        return new DropTailSequence(dropElements, source);
    }else if(source.bounded()){
        // Sequence must be loaded into memory to perform the operation.
        const a = array.raw(-1, source);
        return a.slice(0, array.length() - dropElements);
    }else{
        throw "Failed to drop sequence tail: Input is unbounded.";
    }
};

export {DropTailSequence};

export const registration = {
    name: "dropTail",
    expected: {
        numbers: 1,
        sequences: 1,
    },
    implementation: dropTail,
};

export default dropTail;
