import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {containsElement} from "./containsElement";
import {copyable} from "./copyable";
import {DistinctSequence, defaultDistinctTransform} from "./distinct";
import {EmptySequence} from "./emptySequence";
import {firstElement} from "./firstElement";
import {firstElementElse} from "./firstElementElse";
import {lastElement} from "./lastElement";
import {lastElementElse} from "./lastElementElse";
import {defaultUniformComparison} from "./uniform";

// Implementation used by finite and infinite repeat sequences to override uniform.
const repeatUniformOverride = function(compare){
    const compareFunc = compare || defaultUniformComparison;
    let first = true;
    let firstElement = undefined;
    let lastElement = undefined;
    for(const element of this.source){
        if(first){
            firstElement = element;
            first = false;
        }else if(!compareFunc(element, lastElement)){
            return false;
        }
        lastElement = element;
    }
    return first || compareFunc(lastElement, firstElement);
};

export const FiniteRepeatSequence = defineSequence({
    supportRequired: [
        "copy",
    ],
    supportsWith: [
        "length", "left", "back", "index", "slice", "copy", "reset",
    ],
    overrides: {
        repeat: {optional: wrap.expecting.number},
        distinct: {optional: wrap.expecting.transformation},
        uniform: {async: true, optional: wrap.expecting.comparison},
        containsElement: {async: true, one: wrap.expecting.anything},
        firstElement: {async: true, optional: wrap.expecting.predicate},
        lastElement: {async: true, optional: wrap.expecting.predicate},
        firstElementElse: {
            async: true, unordered: {
                functions: {
                    amount: [1, 2],
                    first: wrap.expecting.callback,
                    second: wrap.expecting.predicate,
                },
            },
        },
        lastElementElse: {
            async: true, unordered: {
                functions: {
                    amount: [1, 2],
                    first: wrap.expecting.callback,
                    second: wrap.expecting.predicate,
                },
            },
        },
    },
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
        "uniformOverride": hi => {
            const singleLengthSeq = new hi.sequence.FiniteRepeatSequence(3, hi("."));
            hi.assert(singleLengthSeq.uniform());
            const uniformSeq = new hi.sequence.FiniteRepeatSequence(3, hi("!!!")); 
            hi.assert(uniformSeq.uniform());
            const notUniformSeq = new hi.sequence.FiniteRepeatSequence(3, hi("nope")); 
            hi.assertNot(notUniformSeq.uniform());
        },
        "containsElementOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4]));
            hi.assert(seq().containsElement(2));
            hi.assertNot(seq().containsElement(NaN));
        },
        "firstElementOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4, 5]));
            hi.assert(seq().firstElement() === 1);
            hi.assert(seq().firstElement(i => i % 2 === 0) === 2);
            hi.assertUndefined(seq().firstElement(i => false));
        },
        "firstElementElseOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4, 5]));
            const bang = () => "!"
            hi.assert(seq().firstElementElse(bang) === 1);
            hi.assert(seq().firstElementElse(bang, i => i % 2 === 0) === 2);
            hi.assert(seq().firstElementElse(bang, i => false) === "!");
        },
        "lastElementOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4, 5]));
            hi.assert(seq().lastElement() === 5);
            hi.assert(seq().lastElement(i => i % 2 === 0) === 4);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "lastElementElseOverride": hi => {
            const seq = () => new hi.sequence.FiniteRepeatSequence(5, hi([1, 2, 3, 4, 5]));
            const bang = () => "!"
            hi.assert(seq().lastElementElse(bang) === 5);
            hi.assert(seq().lastElementElse(bang, i => i % 2 === 0) === 4);
            hi.assert(seq().lastElementElse(bang, i => false) === "!");
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
    uniform: repeatUniformOverride,
    containsElement: function(element){
        return containsElement(this.source, element);
    },
    firstElement: function(predicate){
        return firstElement.implementation(predicate, this.source);
    },
    firstElementElse: function(functions){
        return firstElementElse.implementation(functions, this.source);
    },
    lastElement: function(predicate){
        return lastElement.implementation(predicate, this.source);
    },
    lastElementElse: function(functions){
        return lastElementElse.implementation(functions, this.source);
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
            this.frontSource ? this.frontSource.copy() : undefined,
            this.backSource ? this.backSource.copy() : undefined
        );
    },
    rebase: function(source){
        this.source = source;
        this.frontSource = undefined;
        this.backSource = undefined;
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
    supportsWith: [
        "back", "index", "slice", "copy", "reset",
    ],
    collapseOutOfPlace: true,
    overrides: {
        repeat: {optional: wrap.expecting.number},
        distinct: {optional: wrap.expecting.transformation},
        uniform: {async: true, optional: wrap.expecting.comparison},
        containsElement: {async: true, one: wrap.expecting.anything},
        firstElement: {async: true, optional: wrap.expecting.predicate},
        lastElement: {async: true, optional: wrap.expecting.predicate},
        firstElementElse: {
            async: true, unordered: {
                functions: {
                    amount: [1, 2],
                    first: wrap.expecting.callback,
                    second: wrap.expecting.predicate,
                },
            },
        },
        lastElementElse: {
            async: true, unordered: {
                functions: {
                    amount: [1, 2],
                    first: wrap.expecting.callback,
                    second: wrap.expecting.predicate,
                },
            },
        },
    },
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
        "uniformOverride": hi => {
            const singleLengthSeq = new hi.sequence.InfiniteRepeatSequence(hi("."));
            hi.assert(singleLengthSeq.uniform());
            const uniformSeq = new hi.sequence.InfiniteRepeatSequence(hi("!!!")); 
            hi.assert(uniformSeq.uniform());
            const notUniformSeq = new hi.sequence.InfiniteRepeatSequence(hi("nope")); 
            hi.assertNot(notUniformSeq.uniform());
        },
        "containsElementOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4]));
            hi.assert(seq().containsElement(2));
            hi.assertNot(seq().containsElement(NaN));
        },
        "firstElementOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4, 5]));
            hi.assert(seq().firstElement() === 1);
            hi.assert(seq().firstElement(i => i % 2 === 0) === 2);
            hi.assertUndefined(seq().firstElement(i => false));
        },
        "firstElementElseOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4, 5]));
            const bang = () => "!"
            hi.assert(seq().firstElementElse(bang) === 1);
            hi.assert(seq().firstElementElse(bang, i => i % 2 === 0) === 2);
            hi.assert(seq().firstElementElse(bang, i => false) === "!");
        },
        "lastElementOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4, 5]));
            hi.assert(seq().lastElement() === 5);
            hi.assert(seq().lastElement(i => i % 2 === 0) === 4);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "lastElementElseOverride": hi => {
            const seq = () => new hi.sequence.InfiniteRepeatSequence(hi([1, 2, 3, 4, 5]));
            const bang = () => "!"
            hi.assert(seq().lastElementElse(bang) === 5);
            hi.assert(seq().lastElementElse(bang, i => i % 2 === 0) === 4);
            hi.assert(seq().lastElementElse(bang, i => false) === "!");
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
    uniform: repeatUniformOverride,
    containsElement: function(element){
        return containsElement(this.source, element);
    },
    firstElement: function(predicate){
        return firstElement.implementation(predicate, this.source);
    },
    firstElementElse: function(functions){
        return firstElementElse.implementation(functions, this.source);
    },
    lastElement: function(predicate){
        return lastElement.implementation(predicate, this.source);
    },
    lastElementElse: function(functions){
        return lastElementElse.implementation(functions, this.source);
    },
    repetitions: () => Infinity,
    bounded: function(){
        return this.source.done();
    },
    unbounded: function(){
        return !this.source.done();
    },
    done: function(){
        return this.source.done()
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
    slice: function(i, j){
        const finite = FiniteRepeatSequence(0, this.source, undefined, undefined);
        return finite.slice(i, j);
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
    rebase: function(source){
        this.source = source;
        this.frontSource = null;
        this.backSource = null;
        return this;
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
