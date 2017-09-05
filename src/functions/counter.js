import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {NumberRangeSequence} from "./range";
import {FiniteRepeatElementSequence} from "./repeatElement";

export const CounterSequence = defineSequence({
    summary: "Count up from a number, continuously incrementing by one.",
    supportsAlways: [
        "back", "index", "indexNegative", "slice",
        "sliceNegative", "sliceMixed", "copy", "reset"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an optional starting value.
            When no starting value was specified, zero is used as a default.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new CounterSequence(0),
        hi => new CounterSequence(1),
        hi => new CounterSequence(-1),
        hi => new CounterSequence(0.5),
        hi => new CounterSequence(-0.5),
    ],
    constructor: function CounterSequence(frontValue = undefined){
        this.frontValue = frontValue || 0;
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        return this.frontValue++;
    },
    back: () => Infinity,
    popBack: () => {},
    index: function(i){
        return i;
    },
    indexNegative: function(i){
        return Infinity;
    },
    slice: function(i, j){
        return new NumberRangeSequence(i, j);
    },
    sliceNegative: function(i, j){
        return new FiniteRepeatElementSequence(j - i, Infinity);
    },
    sliceMixed: function(i, j){
        return new CounterSequence(i);
    },
    copy: function(){
        return new CounterSequence(this.frontValue);
    },
});

export const counter = wrap({
    name: "counter",
    summary: "Get a sequence counting up from a given number.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get a sequence counting up by one from zero.
        `),
        expects: (`
            The function expects an optional number to count up from. When no
            number is provided, the number zero is used as a default.
        `),
        returns: (`
            The function returns a sequence enumerating the numbers starting
            at the input value or zero, incrementing by one each for each
            element to acquire the next number.
        `),
        returnType: "sequence",
        related: [
            "range", "recur"
        ],
        examples: [
            "basicUsage", "positiveInput"
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        none: true,
    },
    implementation: function counter(){
        return new CounterSequence();
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.counter();
            hi.assertEqual(seq.startsWith([0, 1, 2, 3, 4, 5]));
            hi.assertEqual(seq.endsWith([Infinity, Infinity, Infinity]));
        },
    },
});

export default counter;
