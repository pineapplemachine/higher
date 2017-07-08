import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const FilterSequence = Sequence.extend({
    constructor: function FilterSequence(predicate, source, initialize = true){
        this.predicate = predicate;
        this.source = source;
        this.maskAbsentMethods(source);
    },
    initializeFront: function(){
        while(!this.predicate(this.source.front())){
            this.source.popFront();
        }
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            this.source.popFront();
            while(!this.source.done() && !this.predicate(this.source.front())){
                this.source.popFront();
            }
        };
    },
    initializeBack: function(){
        while(!this.predicate(this.source.back())){
            this.source.popBack();
        }
        this.back = function(){
            return this.source.back();
        };
        this.popBack = function(){
            this.source.popBack();
            while(!this.source.done() && !this.predicate(this.source.back())){
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
    length: null,
    left: null,
    front: function(){
        this.initializeFront();
        return this.source.front();
    },
    popFront: function(){
        this.initializeFront();
        return this.popFront();
    },
    back: function(){
        this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        this.initializeBack();
        return this.popBack();
    },
    index: null,
    slice: null,
    has: function(i){
        return this.source.has(i) && this.predicate(this.source.get(i));
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new FilterSequence(
            this.predicate, this.source.copy(), false
        );
        copy.front = this.front;
        copy.popFront = this.popFront;
        copy.back = this.back;
        copy.popBack = this.popBack;
        return copy;
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

// Produce a new sequence enumerating only those elements of an input sequence
// which satisfy a predicate function.
export const filter = wrap({
    name: "filter",
    attachSequence: true,
    async: false,
    sequences: [
        FilterSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        return new FilterSequence(predicate, source);
    },
});

export default filter;
