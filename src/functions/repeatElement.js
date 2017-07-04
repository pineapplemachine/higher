import Sequence from "../core/sequence";
import {EmptySequence} from "./empty";

const FiniteRepeatElementSequence = function(
    repetitions, element, finishedRepetitions = 0
){
    this.repetitions = repetitions;
    this.finishedRepetitions = finishedRepetitions || 0;
    this.element = element;
};

const InfiniteRepeatElementSequence = function(element){
    this.element = element;
};

const NullRepeatElementSequence = function(element){
    this.element = element;
};

FiniteRepeatElementSequence.prototype = Object.create(Sequence.prototype);
FiniteRepeatElementSequence.prototype.constructor = FiniteRepeatElementSequence;
Object.assign(FiniteRepeatElementSequence.prototype, {
    seed: function(element){
        this.element = element;
        return this;
    },
    repeat: function(repetitions = null){
        if(repetitions === null || !isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(this.element);
        }else if(repetitions <= 0){
            return new NullRepeatElementSequence(this.element);
        }else{
            return new FiniteRepeatElementSequence(
                this.element, this.repetitions * repetitions
            );
        }
    },
    reverse: function(){
        return this;
    },
    shuffle: function(){
        return this;
    },
    bounded: () => true,
    done: function(){
        return this.finishedRepetitions >= this.repetitions;
    },
    length: function(){
        return this.repetitions;
    },
    left: function(){
        return this.finishedRepetitions - this.repetitions;
    },
    front: function(){
        return this.element;
    },
    popFront: function(){
        this.finishedRepetitions++;
    },
    back: function(){
        return this.element;
    },
    popBack: function(){
        this.finishedRepetitions++;
    },
    index: function(i){
        return this.element;
    },
    slice: function(i, j){
        return new FiniteRepeatElementSequence(this.element, j - i);
    },
    has: null,
    get: null,
    copy: function(){
        return new FiniteRepeatElementSequence(
            this.element, this.repetitions, this.finishedRepetitions
        );
    },
    reset: function(){
        this.finishedRepetitions = 0;
        return this;
    },
});

InfiniteRepeatElementSequence.prototype = Object.create(Sequence.prototype);
InfiniteRepeatElementSequence.prototype.constructor = InfiniteRepeatElementSequence;
Object.assign(InfiniteRepeatElementSequence.prototype, {
    repetitions: Infinity,
    seed: function(element){
        this.element = element;
        return this;
    },
    repeat: function(repetitions){
        return this;
    },
    reverse: function(){
        return this;
    },
    shuffle: function(){
        return this;
    },
    bounded: () => false,
    done: () => false,
    length: null,
    left: null,
    front: function(){
        return this.element;
    },
    popFront: () => {},
    back: function(){
        return this.element;
    },
    popBack: () => {},
    index: function(i){
        return this.element;
    },
    has: null,
    get: null,
    slice: function(i, j){
        return new FiniteRepeatElementSequence(this.element, j - i);
    },
    copy: function(){
        return new InfiniteRepeatElementSequence(this.element);
    },
    reset: function(){
        return this;
    },
});

NullRepeatElementSequence.prototype = Object.create(EmptySequence.prototype);
NullRepeatElementSequence.prototype.constructor = NullRepeatElementSequence;
Object.assign(NullRepeatElementSequence.prototype, {
    repetitions: 0,
    shuffle: function(){
        return this;
    },
    seed: function(element){
        this.element = element;
        return this;
    },
    slice: function(i, j){
        return new NullRepeatElementSequence(this.element);
    },
    copy: function(){
        return new NullRepeatElementSequence(this.element);
    },
});

const repeatElement = function(){
    if(arguments.length === 1){
        return new InfiniteRepeatElementSequence(arguments[0]);
    }else if(arguments.length >= 2){
        const element = arguments[0];
        const repetitions = arguments[1];
        if(isNaN(repetitions)){
            throw argumentsError;
        }else if(repetitions <= 0){
            return new NullRepeatElementSequence(element);
        }else if(!isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(element);
        }else{
            const repetitions = Math.floor(+repetitions);
            return new FiniteRepeatElementSequence(repetitions, element);
        }
    }else{
        throw argumentsError;
    }
};

// Error object thrown when the arguments to repeatElement are incorrect.
const argumentsError = (
    "Failed to repeat element: The function must be called with one argument " +
    "or two arguments. When there is one argument, it is the element to be " +
    "infinitely repeated. When there are two arguments, the first must be the " +
    "number of times to repeat and the second the element to be repeated."
);

export {
    FiniteRepeatElementSequence,
    InfiniteRepeatElementSequence,
    NullRepeatElementSequence,
};

export default repeatElement;
