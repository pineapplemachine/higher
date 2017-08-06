import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {FiniteRepeatElementSequence} from "./repeatElement";

export const FiniteRepeatEachElementSequence = Sequence.extend({
    summary: "Repeat each element of an input sequence some finite number of times.",
    supportsWith: {
        "length": "any", "left": "any", "index": "any",
        "has": "any", "get": "any", "copy": "any", "reset": "any",
        "back": ["back", "left"], "slice": ["slice", "left"],
    },
    overrides: [
        "repeatEachElement",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as input a number of repetitions and an
            input sequence. The number of repetitions must be a positive integer.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatEachElementOverrideFiniteRepetitions": hi => {
            const array = hi([1, 2, 3]);
            const seq = new hi.sequence.FiniteRepeatEachElementSequence(2, array);
            hi.assertEqual(seq.repeatEachElement(2), [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]);
            hi.assert(seq.repeatEachElement(1) === seq);
            hi.assertEmpty(seq.repeatEachElement(0));
        },
        "repeatEachElementOverrideInfiniteRepetitions": hi => {
            const array = hi([1, 2, 3]);
            const seq = new hi.sequence.FiniteRepeatEachElementSequence(2, array);
            const repeatSeq = seq.repeatEachElement(Infinity);
            hi.assert(repeatSeq.unbounded());
            hi.assert(repeatSeq.startsWith([1, 1, 1, 1, 1]));
            hi.assert(repeatSeq.endsWith([3, 3, 3, 3, 3]));
        },
        "repeatEachElementOverrideUnspecifiedRepetitions": hi => {
            const array = hi([1, 2, 3]);
            const seq = new hi.sequence.FiniteRepeatEachElementSequence(2, array);
            const repeatSeq = seq.repeatEachElement();
            hi.assert(repeatSeq.unbounded());
            hi.assert(repeatSeq.startsWith([1, 1, 1, 1, 1]));
            hi.assert(repeatSeq.endsWith([3, 3, 3, 3, 3]));
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new FiniteRepeatEachElementSequence(1, hi([0])),
        hi => new FiniteRepeatEachElementSequence(4, hi([0])),
        hi => new FiniteRepeatEachElementSequence(1, hi([1, 2, 3])),
        hi => new FiniteRepeatEachElementSequence(2, hi([1, 2, 3])),
        hi => new FiniteRepeatEachElementSequence(4, hi([1, 2, 3])),
        hi => new FiniteRepeatEachElementSequence(2, hi.range(8)),
        hi => new FiniteRepeatEachElementSequence(5, hi("!?")),
        hi => new FiniteRepeatEachElementSequence(1, hi.repeat("hello")),
        hi => new FiniteRepeatEachElementSequence(3, hi.repeat("hello")),
        hi => new FiniteRepeatEachElementSequence(1, hi.counter()),
        hi => new FiniteRepeatEachElementSequence(6, hi.counter()),
    ],
    constructor: function FiniteRepeatEachElementSequence(
        repetitions, source, frontRepetitions = undefined,
        backRepetitions = undefined
    ){
        this.elementRepetitions = repetitions;
        this.frontRepetitions = frontRepetitions || 0;
        this.backRepetitions = backRepetitions || 0;
        this.source = source;
        this.maskAbsentMethods(source);
        if(!source.left){
            this.back = undefined;
            this.slice = undefined;
        }
        if(!this.back) this.done = function(){
            return this.source.done();
        };
    },
    repeatEachElement: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(repetitions === 1){
            return this;
        }else if(!repetitions || !isFinite(repetitions)){
            return (this.source.done() ?
                new EmptySequence() :
                new InfiniteRepeatEachElementSequence(this.source)
            );
        }else{
            return new FiniteRepeatEachElementSequence(
                repetitions * this.elementRepetitions, this.source
            );
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done() || (
            this.frontRepetitions + this.backRepetitions >= this.elementRepetitions &&
            this.source.left() <= 1
        );
    },
    length: function(){
        return this.source.length() * this.elementRepetitions;
    },
    left: function(){
        return (
            this.source.left() * this.elementRepetitions -
            this.frontRepetitions - this.backRepetitions
        );
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.frontRepetitions++;
        if(this.frontRepetitions >= this.elementRepetitions){
            this.source.popFront();
            this.frontRepetitions = 0;
        }
    },
    back: function(){
        return this.source.front();
    },
    popBack: function(){
        this.backRepetitions++;
        if(this.backRepetitions >= this.elementRepetitions){
            this.source.popFront();
            this.backRepetitions = 0;
        }
    },
    index: function(i){
        return this.source.index(Math.floor(i / this.elementRepetitions));
    },
    slice: function(i, j){
        const slice = this.source.slice(
            Math.floor(i / this.elementRepetitions),
            Math.ceil(j / this.elementRepetitions)
        );
        const highRemainder = j % this.elementRepetitions;
        return new FiniteRepeatEachElementSequence(
            this.repetitions, slice, i % this.elementRepetitions,
            highRemainder === 0 ? 0 : this.elementRepetitions - highRemainder
        );
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new FiniteRepeatEachElementSequence(
            this.elementRepetitions, this.source.copy(),
            this.frontRepetitions, this.backRepetitions
        );
    },
    reset: function(){
        this.source.reset();
        this.frontRepetitions = 0;
        this.backRepetitions = 0;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const InfiniteRepeatEachElementSequence = Sequence.extend({
    summary: "Infinitely repeat each element of an input sequence,",
    supportsAlways: [
        "index", "slice", "has", "get", "copy", "reset",
    ],
    supportsWith: [
        "back",
    ],
    overrides: [
        "repeatEachElement",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a sequence as input. The sequence must
            not be empty.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatEachElementOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatEachElementSequence(hi("abc"));
            hi.assertEmpty(seq.repeatEachElement(0));
            hi.assert(seq.repeatEachElement(1) === seq);
            hi.assert(seq.repeatEachElement(3) === seq);
            hi.assert(seq.repeatEachElement(Infinity) === seq);
            hi.assert(seq.repeatEachElement() === seq);
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new InfiniteRepeatEachElementSequence(hi([0])),
        hi => new InfiniteRepeatEachElementSequence(hi([1, 2, 3])),
        hi => new InfiniteRepeatEachElementSequence(hi.range(20)),
        hi => new InfiniteRepeatEachElementSequence(hi.repeat("hello")),
        hi => new InfiniteRepeatEachElementSequence(hi.counter()),
    ],
    constructor: function InfiniteRepeatEachElementSequence(source){
        this.source = source;
        if(!source.back) this.back = undefined;
    },
    repeatEachElement: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence();
        }else{
            return this;
        }
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.source.front();
    },
    popFront: function(){},
    back: function(){
        return this.source.back();
    },
    popBack: function(){},
    index: function(i){
        return this.source.front();
    },
    slice: function(i, j){
        return new FiniteRepeatElementSequence(j - i, this.source.front());
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return this;
    },
    reset: function(){
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
}); 

export const repeatEachElement = wrap({
    name: "repeatEachElement",
    summary: "Repeat each element of an input sequence some number of times.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an input sequence and an optional number of
            times to repeat each element as input.
            When no number of repetitions was provided, each element will be
            repeated infinitely.
        `),
        returns: (`
            The function returns a sequence enumerating the same elements of the
            input, but with each element serially repeated the specified number
            of times.
        `),
        returnType: {
            "EmptySequence": (`
                When the number of repetitions was zero, or the input sequence
                was empty and the number of repetitions was #Infinity.
            `),
            "typeof inputSequence": (`
                When the number of repetitions was #1.
            `),
            "InfiniteRepeatEachElementSequence": (`
                When the number of repetitions was #Infinity.
            `),
            "FiniteRepeatEachElementSequence": (`
                When the number of repetitions was neither #0, #1, or #Infinity.
            `),
        },
        examples: [
            "basicUsage", "infiniteRepetitions",
        ],
        related: [
            "repeat", "roundRobin",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: {optional: wrap.expecting.index},
            sequences: 1,
        },
    },
    implementation: (repetitions, source) => {
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(repetitions === 1){
            return source;
        }else if(!repetitions || !isFinite(repetitions)){
            return (source.done() ?
                new EmptySequence() :
                new InfiniteRepeatEachElementSequence(source)
            );
        }else{
            return new FiniteRepeatEachElementSequence(repetitions, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const string = "hello!";
            hi.assertEqual(hi.repeatEachElement(string, 3), "hhheeellllllooo!!!");
        },
        "infiniteRepetitions": hi => {
            const seq = hi.repeatEachElement(Infinity, [1, 2, 3, 4]);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([1, 1, 1, 1, 1, 1]));
            hi.assert(seq.endsWith([4, 4, 4, 4, 4, 4]));
        },
        "unspecifiedRepetitions": hi => {
            const seq = hi.repeatEachElement([1, 2, 3, 4]);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([1, 1, 1, 1, 1, 1]));
            hi.assert(seq.endsWith([4, 4, 4, 4, 4, 4]));
        },
        "singleRepetition": hi => {
            const seq = hi.range(10);
            hi.assert(seq.repeatEachElement(1) === seq);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().repeatEachElement(0));
            hi.assertEmpty(hi.emptySequence().repeatEachElement(2));
            hi.assertEmpty(hi.emptySequence().repeatEachElement(Infinity));
        },
    },
});
    
export default repeatEachElement;
