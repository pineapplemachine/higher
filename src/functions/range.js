import Sequence from "../core/sequence";
import {InfiniteRepeatElementSequence} from "./repeatElement";

// Result of calling range with a step of exactly 1.
const NumberRangeSequence = function(start, end){
    this.start = start;
    this.end = end;
    this.frontValue = start;
    this.backValue = end - 1;
};

// Result of calling range with a step of greater than 0.
const ForwardNumberRangeSequence = function(start, end, step){
    if(step <= 0){
        throw "Failed to create range: Step must be greater than zero.";
    }
    this.start = start;
    this.end = end;
    this.step = step;
    this.frontValue = start;
    this.backValue = end - (end % step || step);
};

// Result of calling range with a step of less than 0.
const BackwardNumberRangeSequence = function(start, end, step){
    if(step >= 0){
        throw "Failed to create range: Step must be less than zero.";
    }
    this.start = start;
    this.end = end;
    this.step = step;
    this.frontValue = start;
    this.backValue = end + (end % -step || -step);
};

NumberRangeSequence.prototype = Object.create(Sequence.prototype);
NumberRangeSequence.prototype.constructor = NumberRangeSequence;
Object.assign(NumberRangeSequence.prototype, {
    step: 1,
    reverse: function(){
        return new BackwardNumberRangeSequence(
            this.end - 1, this.start - 1, -1
        );
    },
    bounded: () => true,
    done: function(){
        return this.frontValue > this.backValue;
    },
    length: function(){
        return this.end - this.start;
    },
    left: function(){
        return this.backValue - this.frontValue;
    },
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue++;
    },
    back: function(){
        return this.backValue;
    },
    popBack: function(){
        this.backValue--;
    },
    index: function(i){
        return this.start + i;
    },
    slice: function(i, j){
        return new NumberRangeSequence(this.start + i, this.start + j);
    },
    copy: function(){
        const copy = new NumberRangeSequence(this.start, this.end);
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        return copy;
    },
    reset: function(){
        this.frontValue = this.start;
        this.backValue = this.end;
        return this;
    },
});

ForwardNumberRangeSequence.prototype = Object.create(Sequence.prototype);
ForwardNumberRangeSequence.prototype.constructor = ForwardNumberRangeSequence;
Object.assign(ForwardNumberRangeSequence.prototype, {
    reverse: function(){
        return new BackwardNumberRangeSequence(
            this.end - this.step, this.start - this.step, -this.step
        );
    },
    bounded: () => true,
    done: function(){
        return this.frontValue > this.backValue;
    },
    length: function(){
        return Math.floor((this.end - this.start) / this.step);
    },
    left: function(){
        return Math.floor((this.backValue - this.frontValue) / this.step);
    },
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue += this.step;
    },
    back: function(){
        return this.backValue;
    },
    popBack: function(){
        this.backValue -= this.step;
    },
    index: function(i){
        return this.start + i * this.step;
    },
    slice: function(i, j){
        return new ForwardNumberRangeSequence(
            this.start + i * this.step, this.start + j * this.step, this.step
        );
    },
    copy: function(){
        const copy = new ForwardNumberRangeSequence(
            this.start, this.end, this.step
        );
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        return copy;
    },
    reset: function(){
        this.frontValue = this.start;
        this.backValue = this.end;
        return this;
    },
});

BackwardNumberRangeSequence.prototype = Object.create(Sequence.prototype);
BackwardNumberRangeSequence.prototype.constructor = BackwardNumberRangeSequence;
Object.assign(BackwardNumberRangeSequence.prototype, {
    reverse: function(){
        return new ForwardNumberRangeSequence(
            this.end - this.step, this.start - this.step, -this.step
        );
    },
    bounded: () => true,
    done: function(){
        return this.frontValue < this.backValue;
    },
    length: function(){
        return Math.floor((this.start - this.end) / this.step);
    },
    left: function(){
        return Math.floor((this.frontValue - this.backValue) / this.step);
    },
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue += this.step;
    },
    back: function(){
        return this.backValue;
    },
    popBack: function(){
        this.backValue -= this.step;
    },
    index: function(i){
        return this.start + i * this.step;
    },
    slice: function(i, j){
        return new BackwardNumberRangeSequence(
            this.start + i * this.step, this.start + j * this.step, this.step
        );
    },
    copy: function(){
        const copy = new BackwardNumberRangeSequence(
            this.start, this.end, this.step
        );
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        return copy;
    },
    reset: function(){
        this.frontValue = this.start;
        this.backValue = this.end;
        return this;
    },
});

// Result of calling range with a step of 0.
// Looks on the surface like any other number range sequence,
// but is actually unbounded.
const NullStepRangeSequence = function(start, end){
    this.start = start;
    this.end = end;
    this.step = 0;
    this.element = start;
};

NullStepRangeSequence.prototype = Object.create(
    InfiniteRepeatElementSequence.prototype
);


/**
 * Create a sequence enumerating numbers in a linear range.
 * When one number is passed, it is an exclusive upper bound.
 * When two numbers are passed, they are the inclusive lower and exclusive
 * higher bounds, respectively.
 * When three numbers are passed they are the lower and higher bounds and
 * the step from one value to the next, respectively.
 * The step is 1 by default but fractical, negative, and zero values are
 * also accepted.
 * @param {*} numbers
 */
const range = (numbers) => {
    if(numbers.length === 1){
        return new NumberRangeSequence(0, numbers[0]);
    }else if(numbers.length === 2 || numbers[2] === 1){
        return new NumberRangeSequence(numbers[0], numbers[1]);
    }else if(numbers[2] > 0){
        return new ForwardNumberRangeSequence(numbers[0], numbers[1], numbers[2]);
    }else if(numbers[2] < 0){
        return new BackwardNumberRangeSequence(numbers[0], numbers[1], numbers[2]);
    }else{
        return new NullStepRangeSequence(numbers[0], numbers[1]);
    }
};

export const registration = {
    name: "range",
    expected: {
        numbers: [1, 3],
    },
    implementation: range,
};

export default range;
