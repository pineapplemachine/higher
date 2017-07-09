import {constants} from "../core/constants";
import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./empty";
import {OneElementSequence} from "./one";

export const FiniteRepeatElementSequence = Sequence.extend({
    constructor: function FiniteRepeatElementSequence(
        repetitions, element, finishedRepetitions = 0
    ){
        this.repetitions = repetitions;
        this.finishedRepetitions = finishedRepetitions || 0;
        this.element = element;
    },
    uniq: function(compare){
        const compareFunc = compare || constants.defaults.comparisonFunction;
        if(compareFunc(this.element, this.element)){
            return new OneElementSequence(this.element);
        }else{
            return this;
        }
    },
    seed: function(element){
        this.element = element;
        return this;
    },
    times: function(repetitions){
        if(isFinite(repetitions)){
            this.repetitions = times;
            return this;
        }else{
            return new InfiniteRepeatElementSequence(this.element);
        }
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
    unbounded: () => false,
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
    rebase: null,
});

export const InfiniteRepeatElementSequence = Sequence.extend({
    constructor: function InfiniteRepeatElementSequence(element){
        this.element = element;
    },
    uniq: function(compare){
        const compareFunc = compare || constants.defaults.comparisonFunction;
        if(compareFunc(this.element, this.element)){
            return new OneElementSequence(this.element);
        }else{
            return this;
        }
    },
    repetitions: Infinity,
    seed: function(element){
        this.element = element;
        return this;
    },
    times: function(repetitions){
        if(isFinite(repetitions)){
            return new FiniteRepeatElementSequence(repetitions, this.element);
        }else{
            return this;
        }
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
    unbounded: () => true,
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
    rebase: null,
});

// Produce a sequence that repeats a single element.
export const repeatElement = wrap({
    name: "repeatElement",
    attachSequence: false,
    async: false,
    sequences: [
        FiniteRepeatElementSequence,
        InfiniteRepeatElementSequence
    ],
    arguments: {
        ordered: [wrap.expecting.anything, wrap.expecting.number]
    },
    implementation: (...args) => {
        const element = args[0];
        const repetitions = args[1];
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(!repetitions || !isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(element);
        }else{
            const repetitions = Math.floor(+repetitions);
            return new FiniteRepeatElementSequence(repetitions, element);
        }
    },
});

export default repeatElement;
