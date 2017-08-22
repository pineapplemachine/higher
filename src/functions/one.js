import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {FiniteRepeatElementSequence} from "./repeatElement";
import {InfiniteRepeatElementSequence} from "./repeatElement";

export const OneElementSequence = defineSequence({
    summary: "A sequence containing exactly one element.",
    supportsAlways: [
        "length", "back", "index", "slice", "copy",
    ],
    overrides: {
        repeat: {optional: wrap.expecting.number},
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as its argument the one element that the
            sequence should enumerate.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatOverrideFinite": hi => {
            const seq = new hi.sequence.OneElementSequence("!");
            hi.assertEmpty(seq.repeat(0));
            hi.assertEqual(seq.repeat(4), "!!!!");
        },
        "repeatOverrideInfiniteSpecified": hi => {
            const seq = new hi.sequence.OneElementSequence("!");
            const repeated = seq.repeat(Infinity);
            hi.assert(repeated.unbounded());
            hi.assert(repeated.startsWith("!!!!!!"));
        },
        "repeatOverrideInfiniteUnspecified": hi => {
            const seq = new hi.sequence.OneElementSequence("!");
            const repeated = seq.repeat();
            hi.assert(repeated.unbounded());
            hi.assert(repeated.startsWith("!!!!!!"));
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new OneElementSequence(0),
        hi => new OneElementSequence(100),
        hi => new OneElementSequence(null),
        hi => new OneElementSequence(undefined),
        hi => new OneElementSequence("!"),
        hi => new OneElementSequence("hello"),
    ],
    constructor: function OneElementSequence(element, isDone = false){
        this.element = element;
        this.isDone = isDone;
    },
    repeat: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence(this.element);
        }else if(!repetitions || !isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(this.element);
        }else{
            return new FiniteRepeatElementSequence(repetitions, this.element);
        }
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.isDone;
    },
    length: () => 1,
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
    slice: function(i, j){
        return this.repeat.implementation.apply(this, j - i);
    },
    copy: function(){
        return new OneElementSequence(this.element, this.isDone);
    },
});

export const one = wrap({
    name: "one",
    summary: "Get a sequence enumerating a single element.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function accepts any value as its single argument.
        `),
        returns: (`
            The function returns a sequence enumerating exactly one element,
            where that element is the given value.
        `),
        returnType: "sequence",
        related: [
            "repeatElement", "emptySequence",
        ],
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.anything,
    },
    implementation: (element) => {
        return new OneElementSequence(element);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi.one(100), [100]);
        },
        "nilInput": hi => {
            hi.assertEqual(hi.one(null), [null]);
            hi.assertEqual(hi.one(undefined), [undefined]);
        },
    },
});

export default one;
