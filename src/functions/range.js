import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {InfiniteRepeatElementSequence} from "./repeatElement";

// Result of calling range with a step of exactly 1.
export const NumberRangeSequence = Sequence.extend({
    summary: "Enumerate numbers from a low until a high bound, incrementing by one each step.",
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new NumberRangeSequence(0, 0),
        hi => new NumberRangeSequence(1, 1),
        hi => new NumberRangeSequence(1, 0),
        hi => new NumberRangeSequence(0, 10),
        hi => new NumberRangeSequence(20, 30),
        hi => new NumberRangeSequence(-50, -40),
        hi => new NumberRangeSequence(-5, 0),
        hi => new NumberRangeSequence(5, -5),
    ],
    constructor: function NumberRangeSequence(start, end){
        this.start = start;
        this.end = end > start ? end : start;
        this.frontValue = start;
        this.backValue = this.end - 1;
    },
    step: 1,
    reverse: function(){
        return new BackwardNumberRangeSequence(
            this.end - 1, this.start - 1, -1
        );
    },
    bounded: () => true,
    unbounded: () => false,
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
    rebase: null,
});

// Result of calling range with a step of greater than 0.
export const ForwardNumberRangeSequence = Sequence.extend({
    summary: "Enumerate numbers from a low until a high bound, incrementing by some positive step.",
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ForwardNumberRangeSequence(0, 0, 1),
        hi => new ForwardNumberRangeSequence(1, 1, 1),
        hi => new ForwardNumberRangeSequence(1, 0, 1),
        hi => new ForwardNumberRangeSequence(0, 10, 1),
        hi => new ForwardNumberRangeSequence(0, 10, 2),
        hi => new ForwardNumberRangeSequence(0, 10, 3),
        hi => new ForwardNumberRangeSequence(20, 30, 2),
        hi => new ForwardNumberRangeSequence(-50, -30, 4),
        hi => new ForwardNumberRangeSequence(-5, 0, 1),
        hi => new ForwardNumberRangeSequence(5, -5, 2),
    ],
    constructor: function ForwardNumberRangeSequence(start, end, step){
        if(step <= 0){
            throw "Failed to create range: Step must be greater than zero.";
        }
        this.start = start;
        this.end = end > start ? end : start;
        this.step = step;
        this.frontValue = start;
        const delta = this.end - start;
        this.backValue = this.end - (delta % step || step);
    },
    reverse: function(){
        return new BackwardNumberRangeSequence(
            this.end - this.step, this.start - this.step, -this.step
        );
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontValue > this.backValue;
    },
    length: function(){
        return Math.ceil((this.end - this.start) / this.step);
    },
    left: function(){
        return Math.ceil((this.backValue - this.frontValue) / this.step);
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
    rebase: null,
});

// Result of calling range with a step of less than 0.
export const BackwardNumberRangeSequence = Sequence.extend({
    summary: "Enumerate numbers from a high until a low bound, incrementing by some negative step.",
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new BackwardNumberRangeSequence(0, 0, -1),
        hi => new BackwardNumberRangeSequence(1, 1, -1),
        hi => new BackwardNumberRangeSequence(0, 1, -1),
        hi => new BackwardNumberRangeSequence(10, 0, -1),
        hi => new BackwardNumberRangeSequence(10, 0, -2),
        hi => new BackwardNumberRangeSequence(10, 0, -3),
        hi => new BackwardNumberRangeSequence(30, 16, -2),
        hi => new BackwardNumberRangeSequence(-30, -50, -4),
        hi => new BackwardNumberRangeSequence(0, -5, -1),
        hi => new BackwardNumberRangeSequence(-5, 5, -2),
    ],
    constructor: function BackwardNumberRangeSequence(start, end, step){
        if(step >= 0){
            throw "Failed to create range: Step must be less than zero.";
        }
        this.start = start;
        this.end = end < start ? end : start;
        this.step = step;
        this.frontValue = start;
        const delta = start - this.end;
        this.backValue = this.end + (delta % -step || -step);
    },
    reverse: function(){
        return new ForwardNumberRangeSequence(
            this.end - this.step, this.start - this.step, -this.step
        );
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontValue < this.backValue;
    },
    length: function(){
        return Math.ceil((this.end - this.start) / this.step);
    },
    left: function(){
        return 1 + Math.ceil((this.backValue - this.frontValue) / this.step);
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
    rebase: null,
});

export const range = wrap({
    name: "range",
    summary: "Enumerate numbers from a beginning value until an ending value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects either one, two, or three numbers as arguments.
            When the function receives three numbers, they represent the
            inclusive beginning bound, the exclusive ending bound, and the step,
            respectively. The inclusive beginning bound is the first number in
            the sequence, the exclusive ending bound is what would come after
            the last number in the sequence if the step were applied once more,
            and the step is the value added to each prior number to determine
            the next.
            When the function receives two numbers, they represent the inclusive
            low and exclusive high bounds, respectively; the step is one.
            When the function receives one number, that input is interpreted as
            an exclusive high bound; the low bound is zero and the step is one.
        `),
        returns: (`
            The function returns a sequence enumerating numbers starting with
            the inclusive beginning bound and ending immediately before the
            exclusive ending bound; every element in the sequence is the result
            of summing the step value with its prior element.
        `),
        related: [
            "counter"
        ],
        examples: [
            "basicUsageOneInput", "basicUsageTwoInputs", "basicUsageThreeInputs"
        ],
    },
    attachSequence: false,
    async: false,
    sequences: [
        NumberRangeSequence,
        ForwardNumberRangeSequence,
        BackwardNumberRangeSequence
    ],
    arguments: {
        unordered: {
            numbers: [1, 3]
        }
    },
    implementation: (numbers) => {
        if(numbers.length === 1){
            // Only upper bound specified; enumerate [0, x) with a step of 1.
            return new NumberRangeSequence(0, numbers[0]);
        }else if(numbers.length === 2 || numbers[2] === 1){
            // Both bounds specified; enumerate [x, y) with a step of 1.
            return new NumberRangeSequence(numbers[0], numbers[1]);
        }else if(numbers[2] > 0){
            // Both bounds and a positive step; enumerate [x, y) with a positive step.
            return new ForwardNumberRangeSequence(numbers[0], numbers[1], numbers[2]);
        }else if(numbers[2] < 0){
            // Both bounds and a negative step; enumerate [x, y) with a negative step.
            return new BackwardNumberRangeSequence(numbers[0], numbers[1], numbers[2]);
        }else if(numbers[1] <= numbers[0]){
            // Both bounds and a zero step, but there are no elements anyway.
            return new EmptySequence();
        }else{
            // Both bounds and a zero step; infinitely repeat the start value.
            return new InfiniteRepeatElementSequence(numbers[0]);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageOneInput": hi => {
            const seq = hi.range(10);
            hi.assertEqual(seq, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        },
        "basicUsageTwoInputs": hi => {
            const seq = hi.range(5, 10);
            hi.assertEqual(seq, [5, 6, 7, 8, 9]);
        },
        "basicUsageThreeInputs": hi => {
            const seq = hi.range(10, 20, 2);
            hi.assertEqual(seq, [10, 12, 14, 16, 18]);
        },
        "zeroStepEmpty": hi => {
            hi.assertEmpty(hi.range(1, 1, 0));
        },
        "zeroStepUnbounded": hi => {
            const seq = hi.range(1, 2, 0);
            hi.assert(seq.unbounded());
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextBack() === 1);
            hi.assert(seq.nextBack() === 1);
            hi.assert(seq.nextBack() === 1);
        },
        "negativeStepEmpty": hi => {
            hi.assertEmpty(hi.range(0, 1, -1));
            hi.assertEmpty(hi.range(0, 10, -1));
            hi.assertEmpty(hi.range(0, 4, -5));
        },
        "negativeStepNotEmpty": hi => {
            const seq = hi.range(10, 0, -2);
            hi.assertEqual(seq, [10, 8, 6, 4, 2]);
        },
    },
});

export default range;
