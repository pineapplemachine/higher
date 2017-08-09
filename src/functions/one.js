import {defineSequence} from "../core/defineSequence";
import {FiniteRepeatElementSequence, InfiniteRepeatElementSequence} from "./repeatElement";
import {wrap} from "../core/wrap";

export const OneElementSequence = defineSequence({
    summary: "A sequence containing exactly one element.",
    supportsAlways: [
        "length", "left", "back", "index", "slice", "copy", "reset",
    ],
    overrides: [
        "reverse", "filter", "reject",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as its argument the one element that the
            sequence should enumerate.
        `),
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
    filter: function(predicate){
        return predicate(this.element) ? this : new EmptySequence();
    },
    reject: function(predicate){
        return predicate(this.element) ? new EmptySequence() : this;
    },
    bounded: () => true,
    unbounded: () => false,
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
    has: null,
    get: null,
    slice: function(i, j){
        return new OneElementSequence(this.element, i >= j);
    },
    copy: function(){
        return new OneElementSequence(this.element, this.isDone);
    },
    reset: function(){
        this.isDone = false;
        return this;
    },
    rebase: null,
});

export const one = wrap({
    name: "one",
    summary: "Get a sequence enumerating a single element.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as its single argument the one element that the
            sequence should contain.
        `),
        returns: (`
            The function returns a sequence enumerating only the given element.
        `),
        related: [
            "repeatElement", "emptySequence"
        ],
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: false,
    async: false,
    sequences: [
        OneElementSequence
    ],
    arguments: {
        one: wrap.expecting.anything
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
