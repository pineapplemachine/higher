import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {containsElement} from "./containsElement";
import {copyable} from "./copyable";
import {DistinctSequence, defaultDistinctTransform} from "./distinct";
import {EmptySequence} from "./emptySequence";
import {firstElement} from "./firstElement";

export const FiniteRepeatSequence = defineSequence({
    supportRequired: [
        "copy",
    ],
    overrides: [
        "repeat", "distinct", "firstElement", "containsElement",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of repetitions and a sequence as
            input. The number of repetitions must be a positive nonzero integer
            and the sequence must be copyable.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatOverride": hi => {
            const array = hi([1, 2, 3]);
            const seq = new hi.sequence.FiniteRepeatSequence(2, array);
            hi.assertEqual(seq.repeat(3), new hi.sequence.FiniteRepeatSequence(6, array));
            hi.assertEmpty(seq.repeat(0));
        },
        "repeatInfiniteOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatSequence(2, hi("abc"));
            hi.assert(seq.repeat().unbounded());
            hi.assert(seq.repeat(Infinity).unbounded());
            hi.assert(seq.repeat().startsWith("abcabcabcabcabc"));
            hi.assert(seq.repeat(Infinity).startsWith("abcabcabcabcabc"));
        },
        "distinctOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatSequence(3, hi("hello"));
            hi.assertEqual(seq.distinct(), "helo");
        },
        "firstElementOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4]));
            hi.assert(seq().firstElement() === 1);
            hi.assert(seq().firstElement(i => i === 3) === 3);
            hi.assertUndefined(seq().firstElement(i => false));
        },
        "containsElementOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4]));
            hi.assert(seq().containsElement(2));
            hi.assertNot(seq().containsElement(NaN));
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new FiniteRepeatSequence(1, hi.emptySequence()),
        hi => new FiniteRepeatSequence(4, hi.emptySequence()),
        hi => new FiniteRepeatSequence(1, hi([1, 2, 3])),
        hi => new FiniteRepeatSequence(2, hi([1, 2, 3])),
        hi => new FiniteRepeatSequence(6, hi([1, 2, 3])),
        hi => new FiniteRepeatSequence(2, hi.range(8)),
        hi => new FiniteRepeatSequence(3, hi("hello")),
        hi => new FiniteRepeatSequence(1, hi.counter()),
        hi => new FiniteRepeatSequence(8, hi.counter()),
    ],
    constructor: function FiniteRepeatSequence(
        repetitions, source, frontSource = undefined, backSource = undefined
    ){
        // Input sequence must be copyable.
        this.targetRepetitions = repetitions;
        this.source = source;
        this.frontSource = frontSource;
        this.backSource = backSource;
        this.frontRepetitions = 0;
        this.backRepetitions = 0;
        this.maskAbsentMethods(source);
        // Source must have known length to support left, index, slice operations.
        if(!source.length){
            this.left = undefined;
            this.index = undefined;
            this.slice = undefined;
        }
        // Source must be bidirectional to support slicing
        if(!source.back){
            this.slice = undefined;
        }
        // Only needs to break a collapse if it repeats more than once
        if(repetitions <= 1){
            this.collapseBreak = undefined;
        }
    },
    repeat: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(!repetitions || !isFinite(repetitions)){
            return new InfiniteRepeatSequence(this.source);
        }else{
            return new FiniteRepeatSequence(
                repetitions * this.targetRepetitions, this.source
            );
        }
    },
    distinct: function(transform){
        return new DistinctSequence(
            transform || defaultDistinctTransform, this.source
        );
    },
    firstElement: function(predicate){
        return firstElement.implementation(predicate, this.source);
    },
    containsElement: function(element){
        return containsElement(this.source, element);
    },
    repetitions: function(){
        return this.targetRepetitions;
    },
    finishedRepetitions: function(){
        return this.frontRepetitions + this.backRepetitions;
    },
    bounded: function(){
        return this.source.bounded();
    },
    // Please don't repeat an already unbounded sequence this way
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return (
            this.source.done() || (
                this.finishedRepetitions() >= this.targetRepetitions &&
                (this.frontSource && this.frontSource.done())
            )
        );
    },
    length: function(){
        return this.source.length() * this.targetRepetitions;
    },
    left: function(){
        return this.source.left() + this.source.length() * (
            this.targetRepetitions - this.finishedRepetitions() - 1
        );
    },
    front: function(){
        return this.frontSource ? this.frontSource.front() : this.source.front();
    },
    popFront: function(){
        if(!this.frontSource){
            this.frontSource = this.source.copy();
        }
        this.frontSource.popFront();
        if(this.frontSource.done()){
            this.frontRepetitions++;
            const finishedRepetitions = this.finishedRepetitions();
            if(finishedRepetitions >= this.targetRepetitions - 1){
                if(!this.backSource) this.backSource = (
                    this.targetRepetitions > 1 ? this.source.copy() : this.frontSource
                );
                this.frontSource = this.backSource;
            }else if(finishedRepetitions < this.targetRepetitions){
                this.frontSource = this.source.copy();
            }
        }
    },
    back: function(){
        return this.backSource ? this.backSource.back() : this.source.back();
    },
    popBack: function(){
        if(!this.backSource){
            this.backSource = this.source.copy();
        }
        this.backSource.popBack();
        if(this.backSource.done()){
            this.backRepetitions++;
            const finishedRepetitions = this.finishedRepetitions();
            if(finishedRepetitions >= this.targetRepetitions - 1){
                if(!this.frontSource) this.frontSource = (
                    this.targetRepetitions > 1 ? this.source.copy() : this.backSource
                );
                this.backSource = this.frontSource;
            }else if(finishedRepetitions < this.targetRepetitions){
                this.backSource = this.source.copy();
            }
        }
    },
    index: function(i){
        return this.source.index(i % this.source.length());
    },
    slice: function(i, j){
        const length = this.source.length();
        const lowIndex = i % length;
        const highIndex = j % length;
        if(j - i < length && highIndex >= lowIndex){
            return this.source.slice(lowIndex, highIndex);
        }else if(lowIndex === 0 && highIndex === 0){
            return new FiniteRepeatSequence((j - i) / length, this.source);
        }else{
            const repetitions = Math.ceil(j / length) - Math.floor(i / length);
            const frontSource = (
                lowIndex === 0 ? this.source : this.source.slice(lowIndex, length)
            );
            const backSource = (
                highIndex === 0 ? this.source : this.source.slice(0, highIndex)
            );
            return new FiniteRepeatSequence(
                repetitions, this.source,
                this.source, this.source,
                frontSource, backSource
            );
        }
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new FiniteRepeatSequence(
            this.targetRepetitions, this.source,
            this.frontSource ? this.frontSource.copy() : null,
            this.backSource ? this.backSource.copy() : null
        );
    },
    reset: function(){
        this.frontRepetitions = 0;
        this.frontSource = null;
        if(this.back){
            this.backRepetitions = 0;
            this.backSource = null;
        }
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.frontSource = null;
        this.backSource = null;
        return this;
    },
    collapseBreak: function(target, length){
        if(this.targetRepetitions === 0){
            return 0;
        }else if(this.targetRepetitions === 1){
            return length;
        }else{
            let i = 0;
            let j = length;
            const writes = length * (this.targetRepetitions - 1);
            while(j < target.length && i < writes){
                target[j++] = target[i++];
            }
            while(i < writes){
                target.push(target[i++]);
            }
            target.splice(length * this.targetRepetitions);
            return length * this.targetRepetitions;
        }
    },
});

export const InfiniteRepeatSequence = defineSequence({
    supportRequired: [
        "copy",
    ],
    overrides: [
        "repeat", "distinct", "containsElement",
    ],
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatSequence(hi.range(10));
            hi.assert(seq.repeat() === seq);
            hi.assert(seq.repeat(Infinity) === seq);
            hi.assert(seq.repeat(5) === seq);
            hi.assertEmpty(seq.repeat(0));
        },
        "distinctOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatSequence(hi("hello"));
            hi.assertEqual(seq.distinct(), "helo");
        },
        "firstElementOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4]));
            hi.assert(seq().firstElement() === 1);
            hi.assert(seq().firstElement(i => i === 3) === 3);
            hi.assertUndefined(seq().firstElement(i => false));
        },
        "containsElementOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4]));
            hi.assert(seq().containsElement(2));
            hi.assertNot(seq().containsElement(NaN));
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new InfiniteRepeatSequence(hi([1])),
        hi => new InfiniteRepeatSequence(hi("!")),
        hi => new InfiniteRepeatSequence(hi("hello")),
        hi => new InfiniteRepeatSequence(hi.range(20)),
        hi => new InfiniteRepeatSequence(hi.counter()),
    ],
    constructor: function InfiniteRepeatSequence(
        source, frontSource = undefined, backSource = undefined
    ){
        this.source = source;
        this.frontSource = frontSource;
        this.backSource = backSource;
        this.maskAbsentMethods(source);
    },
    repeat: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence();
        }else{
            return this;
        }
    },
    distinct: function(transform){
        return new DistinctSequence(
            transform || defaultDistinctTransform, this.source
        );
    },
    firstElement: function(predicate){
        return firstElement.implementation(predicate, this.source);
    },
    containsElement: function(element){
        return containsElement(this.source, element);
    },
    repetitions: () => Infinity,
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    length: null,
    left: null,
    front: function(){
        return this.frontSource ? this.frontSource.front() : this.source.front();
    },
    popFront: function(){
        if(!this.frontSource){
            this.frontSource = this.source.copy();
        }
        this.frontSource.popFront();
        if(this.frontSource.done()){
            this.frontSource = this.source.copy();
        }
    },
    back: function(){
        return this.backSource ? this.backSource.back() : this.source.back();
    },
    popBack: function(){
        if(!this.backSource){
            this.backSource = this.source.copy();
        }
        this.backSource.popBack();
        if(this.backSource.done()){
            this.backSource = this.source.copy();
        }
    },
    index: function(i){
        return this.source.index(i % this.source.length());
    },
    // This method is a bit dirty as it relies on knowing
    // the implementation details of FiniteRepeatSequence.
    // I'm trying not to feel too bad about this since the relevant code
    // is defined just a few tens of lines above here.
    slice: function(i, j){
        return new FiniteRepeatSequence(0, this.source, null, null).slice(i, j);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new InfiniteRepeatSequence(
            this.source, this.frontSource ? this.frontSource.copy() : undefined,
            this.backSource ? this.backSource.copy() : undefined
        );
    },
    reset: function(){
        this.frontSource = null;
        this.backSource = null;
    },
    rebase: function(source){
        this.source = source;
        this.frontSource = null;
        this.backSource = null;
        return this;
    },
    collapseOutOfPlace: true,
});

export const repeat = wrap({
    name: "repeat",
    attachSequence: true,
    async: false,
    sequences: [
        FiniteRepeatSequence,
        InfiniteRepeatSequence
    ],
    arguments: {
        unordered: {
            numbers: "?",
            sequences: 1,
        },
    },
    implementation: (repetitions, source) => {
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(source.unbounded()){
            return source;
        }else if(repetitions && isFinite(repetitions)){
            return new FiniteRepeatSequence(repetitions, copyable(source));
        }else{
            return new InfiniteRepeatSequence(copyable(source));
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageFinite": hi => {
            hi.assertEqual(hi.repeat([0, 1, 2], 2), [0, 1, 2, 0, 1, 2]);
        },
        "basicUsageInfinite": hi => {
            const seq = hi.repeat("abc");
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith("abcabcabcabc"));
        },
    },
});

export default repeat;
