import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {EmptySequence} from "./emptySequence";

export const FiniteRepeatSequence = Sequence.extend({
    constructor: function FiniteRepeatSequence(
        repetitions, source, frontSource = undefined, backSource = undefined
    ){
        // Input sequence must be copyable.
        this.repetitions = repetitions;
        this.source = source;
        this.frontSource = frontSource;
        this.backSource = backSource;
        this.frontRepetitions = 0;
        this.backRepetitions = 0;
        this.maskAbsentMethods(source);
        // Source must have known length to support left, index, slice operations.
        if(!source.length){
            this.left = null;
            this.index = null;
            this.slice = null;
        }
        // Source must be bidirectional to support slicing
        if(!source.back){
            this.slice = null;
        }
        // Only needs to break a collapse if it repeats more than once
        if(repetitions <= 1) this.collapseBreak = null;
    },
    finishedRepetitions: function(){
        return this.frontRepetitions + this.backRepetitions;
    },
    bounded: function(){
        return this.source.bounded();
    },
    // Please don't repeat an already unbounded sequence
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return (
            this.source.done() || (
                this.finishedRepetitions() >= this.repetitions &&
                (this.frontSource && this.frontSource.done())
            )
        );
    },
    length: function(){
        return this.source.length() * this.repetitions;
    },
    left: function(){
        return this.source.left() + this.source.length() * (
            this.repetitions - this.finishedRepetitions() - 1
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
            if(this.backSource && finishedRepetitions === this.repetitions - 1){
                if(!this.backSource) this.backSource = this.source.copy();
                this.frontSource = this.backSource;
            }else if(finishedRepetitions < this.repetitions){
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
            if(finishedRepetitions === this.repetitions - 1){
                if(!this.frontSource) this.frontSource = this.source.copy();
                this.backSource = this.frontSource;
            }else if(finishedRepetitions < this.repetitions){
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
            this.repetitions, this.source,
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
        if(this.repetitions === 0){
            return 0;
        }else if(this.repetitions === 1){
            return length;
        }else{
            let i = 0;
            let j = length;
            const writes = length * (this.repetitions - 1);
            while(j < target.length && i < writes){
                target[j++] = target[i++];
            }
            while(i < writes){
                target.push(target[i++]);
            }
            target.splice(length * this.repetitions);
            return length * this.repetitions;
        }
    },
});

export const InfiniteRepeatSequence = Sequence.extend({
    constructor: function InfiniteRepeatSequence(source, frontSource = null, backSource = null){
        if(!source.copy){
            throw "Error repeating sequence: Only copyable sequences can be repeated.";
        }
        this.source = source;
        this.frontSource = frontSource;
        this.backSource = backSource;
        this.maskAbsentMethods(source);
    },
    repetitions: Infinity,
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
            this.source, this.frontSource, this.backSource
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
    collapseBreak: function(target, length){
        // TODO: Can this possibly be fixed?
        throw "Cannot collapse infinitely repeated sequence.";
    },
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
