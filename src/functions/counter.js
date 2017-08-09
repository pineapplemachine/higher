import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {NumberRangeSequence} from "./range";

export const CounterSequence = defineSequence({
    summary: "Count up from a number, continuously incrementing by one.",
    supportsAlways: [
        "back", "index", "slice", "copy", "reset"
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
    constructor: function CounterSequence(startValue, currentValue = undefined){
        this.startValue = startValue || 0;
        this.currentValue = currentValue === undefined ? this.startValue : currentValue;
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.currentValue;
    },
    popFront: function(){
        return this.currentValue++;
    },
    back: () => Infinity,
    popBack: () => {},
    index: function(i){
        return this.startValue + i;
    },
    slice: function(i, j){
        return new NumberRangeSequence(this.startValue + i, this.startValue + j);
    },
    copy: function(){
        return new CounterSequence(this.startValue, this.currentValue);
    },
    reset: function(){
        this.currentValue = this.startValue;
        return this;
    },
});

export const counter = wrap({
    name: "counter",
    summary: "Get a sequence counting up from a given number.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get a sequence counting up by one from a given number, or from zero
            if no number was given.
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
        returnType: "CounterSequence",
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
        unordered: {
            numbers: "?"
        }
    },
    implementation: (start) => {
        return new CounterSequence(start || 0);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.counter();
            hi.assertEqual(seq.head(5), [0, 1, 2, 3, 4]);
        },
        "positiveInput": hi => {
            const seq = hi.counter(40);
            hi.assertEqual(seq.head(5), [40, 41, 42, 43, 44]);
        },
        "negativeInput": hi => {
            const seq = hi.counter(-5);
            hi.assertEqual(seq.head(5), [-5, -4, -3, -2, -1]);
        },
        "fractionalInput": hi => {
            const seq = hi.counter(0.5);
            hi.assertEqual(seq.head(5), [0.5, 1.5, 2.5, 3.5, 4.5]);
        },
        "bidirectionality": hi => {
            hi.assert(hi.counter().startsWith([0, 1, 2]));
            hi.assert(hi.counter().endsWith([Infinity, Infinity, Infinity]));
        },
    },
});

export default counter;
