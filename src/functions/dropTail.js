import {ArraySequence} from "../core/arrayAsSequence";
import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {BoundsUnknownError} from "../errors/BoundsUnknownError";

import {EmptySequence} from "./empty";

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
        if(dropElements <= 0 || source.unbounded()){
            return source;
        }else if(source.length){
            const sourceLength = source.length();
            if(dropElements >= sourceLength){
                return new EmptySequence();
            }else if(source.slice){
                return source.slice(0, sourceLength - dropElements);
            }else{
                return new DropTailSequence(dropElements, source);
            }
        }else if(source.bounded()){
            // TODO: Can this be delayed until the range is actually consumed?
            const array = [];
            for(const element of source) array.push(element);
            return new ArraySequence(array).slice(0, array.length - dropElements);
        }else{
            throw BoundsUnknownError(source, {
                message: "Failed to drop sequence tail"
            });
        }
    },
});

export default dropTail;
