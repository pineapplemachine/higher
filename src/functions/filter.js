import Sequence from "../core/sequence";

const FilterSequence = function(predicate, source, initialize = true){
    this.predicate = predicate;
    this.source = source;
    this.maskAbsentMethods(source);
};

FilterSequence.prototype = Object.create(Sequence.prototype);
FilterSequence.prototype.constructor = FilterSequence;
Object.assign(FilterSequence.prototype, {
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

export {FilterSequence};

export default {
    name: "filter",
    expected: {
        functions: 1,
        sequences: 1,
    },
    implementation: function(predicate, source){
        return new FilterSequence(predicate, source);
    },
};
