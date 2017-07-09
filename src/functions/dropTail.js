import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const DropTailSequence = Sequence.extend({
    constructor: function DropTailSequence(dropElements, source, frontIndex = 0){
        if(!source.length){
            throw "Error dropping tail: Input sequence must have known length.";
        }
        this.dropElements = dropElements;
        this.source = source;
        this.frontIndex = frontIndex;
        this.lastIndex = source.length() - dropElements;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
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
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const dropTail = wrap({
    name: "dropTail",
    attachSequence: true,
    async: false,
    sequences: [
        DropTailSequence
    ],
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (dropElements, source) => {
        if(dropElements <= 0){
            return source;
        }else if(source.slice && source.length){
            return source.slice(0, source.length() - dropElements);
        }else if(source.length){
            return new DropTailSequence(dropElements, source);
        }else if(source.bounded()){
            source.forceEager();
            return source.slice(0, source.length() - dropElements);
        }else{
            throw "Failed to drop sequence tail: Input is not known to be bounded.";
        }
    },
});

export default dropTail;
