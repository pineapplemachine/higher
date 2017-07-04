import Sequence from "../core/sequence";
import {FiniteRepeatElementSequence, InfiniteRepeatElementSequence} from "./repeatElement";

const OneSequence = function(element, isDone = false){
    this.element = element;
    this.isDone = isDone;
};

OneSequence.prototype = Object.create(Sequence.prototype);
OneSequence.prototype.constructor = OneSequence;
Object.assign(OneSequence.prototype, {
    seed: function(element){
        this.element = element;
        return this;
    },
    // Optimized implementations of some common operations
    repeat: function(repetitions = -1){
        if(repetitions === 0){
            return new EmptyElementSequence(this.element);
        }else if(repetitions < 0){
            return new InfiniteRepeatElementSequence(this.element);
        }else{
            return new FiniteRepeatElementSequence(repetitions, this.element);
        }
    },
    reverse: function(){
        return this;
    },
    bounded: () => true,
    done: function(){
        return this.isDone;
    },
    length: () => 1,
    left: function(){
        return this.isDone ? 0 : 1;
    },
    front: function(){
        return this.element;
    },
    popFront: function(){
        this.isDone = true;
    },
    back: function(){
        return this.element;
    },
    popBack: function(){
        this.isDone = true;
    },
    index: function(i){
        return this.element;
    },
    has: (i) => false,
    get: (i) => undefined,
    slice: function(i, j){
        return new OneSequence(this.element, i >= j);
    },
    copy: function(){
        return new OneSequence(this.element, this.isDone);
    },
    reset: function(){
        this.isDone = false;
        return this;
    },
});

const one = function(element){
    return new OneSequence(element);
};

export default one;
