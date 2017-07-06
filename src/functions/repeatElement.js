import Sequence from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./empty";

export const FiniteRepeatElementSequence = function(
    repetitions, element, finishedRepetitions = 0
){
    this.repetitions = repetitions;
    this.finishedRepetitions = finishedRepetitions || 0;
    this.element = element;
};

export const InfiniteRepeatElementSequence = function(element){
    this.element = element;
};

FiniteRepeatElementSequence.prototype = Object.create(Sequence.prototype);
FiniteRepeatElementSequence.prototype.constructor = FiniteRepeatElementSequence;
Object.assign(FiniteRepeatElementSequence.prototype, {
    seed: function(element){
        this.element = element;
        return this;
    },
    times: function(repetitions){
        this.repetitions = times;
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
    times: function(repetitions){
        return new FiniteRepeatElementSequence(repetitions, this.element);
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

// Produce a sequence that repeats a single element.
export const repeatElement = wrap({
    name: "repeatElement",
    attachSequence: false,
    async: false,
    arguments: {
        ordered: [expecting.anything, expecting.number]
    },
    implementation: (...args) => {
        const element = args[0];
        const repetitions = args[1];
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(!repetitions){ // Argument wasn't provided
            return new InfiniteRepeatElementSequence(repetitions);
        }else if(!isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(element);
        }else{
            const repetitions = Math.floor(+repetitions);
            return new FiniteRepeatElementSequence(repetitions, element);
        }
    },
});

export default repeatElement;
