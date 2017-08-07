import {isEqual} from "../core/isEqual";
import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {OneElementSequence} from "./one";
import {defaultUniqComparison} from "./uniq";
import {defaultDistinctTransform} from "./distinct";

export const FiniteRepeatElementSequence = Sequence.extend({
    overrides: [
        "repeat", "distinct", "uniq", "containsElement",
    ],
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(2, 0);
            hi.assertEqual(seq.repeat(3), new hi.sequence.FiniteRepeatElementSequence(6, 0));
            hi.assertEmpty(seq.repeat(0));
        },
        "repeatInfiniteOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(2, 0);
            hi.assert(seq.repeat().unbounded());
            hi.assert(seq.repeat(Infinity).unbounded());
            hi.assert(seq.repeat().startsWith([0, 0, 0, 0, 0, 0, 0]));
            hi.assert(seq.repeat(Infinity).startsWith([0, 0, 0, 0, 0, 0, 0]));
        },
        "distinctOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(10, 0);
            hi.assertEqual(seq.distinct(), [0]);
        },
        "uniqOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(10, 0);
            hi.assertEqual(seq.uniq(), [0]);
        },
        "nonIdentityUniqOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(4, 0);
            hi.assertEqual(seq.uniq(), [0]);
            const uniqSeq = seq.uniq((a, b) => false);
            hi.assertEqual(uniqSeq, [0, 0, 0, 0]);
        },
        "containsElementOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(3, "!");
            hi.assert(seq.containsElement("!"));
            hi.assertNot(seq.containsElement("."));
        },
    },
    constructor: function FiniteRepeatElementSequence(
        repetitions, element, finishedRepetitions = 0
    ){
        this.targetRepetitions = repetitions;
        this.finishedRepetitions = finishedRepetitions || 0;
        this.element = element;
    },
    repeat: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(!repetitions || !isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(this.element);
        }else{
            return new FiniteRepeatElementSequence(
                repetitions * this.targetRepetitions, this.element
            );
        }
    },
    distinct: function(transform){
        return new OneElementSequence(this.element);
    },
    uniq: function(compare){
        const compareFunc = compare || defaultUniqComparison;
        if(compareFunc(this.element, this.element)){
            return new OneElementSequence(this.element);
        }else{
            return this;
        }
    },
    containsElement: function(element){
        return isEqual(element, this.element);
    },
    repetitions: function(){
        return this.targetRepetitions();
    },
    seed: function(element){
        this.element = element;
        return this;
    },
    times: function(repetitions){
        if(isFinite(repetitions)){
            this.targetRepetitions = times;
            return this;
        }else{
            return new InfiniteRepeatElementSequence(this.element);
        }
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.finishedRepetitions >= this.targetRepetitions;
    },
    length: function(){
        return this.targetRepetitions;
    },
    left: function(){
        return this.finishedRepetitions - this.targetRepetitions;
    },
    front: function(){
        return this.element;
    },
    popFront: function(){
        this.finishedRepetitions++;
    },
    back: function(){
        return this.element;
    },
    popBack: function(){
        this.finishedRepetitions++;
    },
    index: function(i){
        return this.element;
    },
    slice: function(i, j){
        return new FiniteRepeatElementSequence(this.element, j - i);
    },
    copy: function(){
        return new FiniteRepeatElementSequence(
            this.element, this.targetRepetitions, this.finishedRepetitions
        );
    },
    reset: function(){
        this.finishedRepetitions = 0;
        return this;
    },
});

export const InfiniteRepeatElementSequence = Sequence.extend({
    overrides: [
        "repeat", "distinct", "uniq", "containsElement",
    ],
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "repeatOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatElementSequence(0);
            hi.assert(seq.repeat() === seq);
            hi.assert(seq.repeat(Infinity) === seq);
            hi.assert(seq.repeat(10) === seq);
            hi.assertEmpty(seq.repeat(0));
        },
        "distinctOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatElementSequence(0);
            hi.assertEqual(seq.distinct(), [0]);
        },
        "uniqOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatElementSequence(0);
            hi.assertEqual(seq.uniq(), [0]);
        },
        "nonIdentityUniqOverride": hi => {
            const seq = new hi.sequence.InfiniteRepeatElementSequence(0);
            hi.assertEqual(seq.uniq(), [0]);
            const uniqSeq = seq.uniq((a, b) => false);
            hi.assert(uniqSeq.unbounded());
            hi.assert(uniqSeq.startsWith([0, 0, 0, 0, 0]));
        },
        "containsElementOverride": hi => {
            const seq = new hi.sequence.FiniteRepeatElementSequence(3, "!");
            hi.assert(seq.containsElement("!"));
            hi.assertNot(seq.containsElement("."));
        },
    },
    constructor: function InfiniteRepeatElementSequence(element){
        this.element = element;
    },
    repeat: function(repetitions){
        if(repetitions <= 0){
            return new EmptySequence();
        }else{
            return this;
        }
    },
    distinct: function(transform){
        return new OneElementSequence(this.element);
    },
    uniq: function(compare){
        const compareFunc = compare || defaultUniqComparison;
        if(compareFunc(this.element, this.element)){
            return new OneElementSequence(this.element);
        }else{
            return this;
        }
    },
    containsElement: function(element){
        return isEqual(element, this.element);
    },
    repetitions: () => Infinity,
    seed: function(element){
        this.element = element;
        return this;
    },
    times: function(repetitions){
        if(isFinite(repetitions)){
            return new FiniteRepeatElementSequence(repetitions, this.element);
        }else{
            return this;
        }
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.element;
    },
    popFront: () => {},
    back: function(){
        return this.element;
    },
    popBack: () => {},
    index: function(i){
        return this.element;
    },
    slice: function(i, j){
        return new FiniteRepeatElementSequence(this.element, j - i);
    },
    copy: function(){
        return new InfiniteRepeatElementSequence(this.element);
    },
    reset: function(){
        return this;
    },
});

// Produce a sequence that repeats a single element.
export const repeatElement = wrap({
    name: "repeatElement",
    attachSequence: false,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.anything,
            wrap.expecting.optional(wrap.expecting.number),
        ],
    },
    implementation: (element, repetitions) => {
        if(repetitions <= 0){
            return new EmptySequence();
        }else if(!repetitions || !isFinite(repetitions)){
            return new InfiniteRepeatElementSequence(element);
        }else{
            return new FiniteRepeatElementSequence(
                Math.floor(+repetitions), element
            );
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageFinite": hi => {
            hi.assertEqual(hi.repeatElement("?", 3), "???");
        },
        "basicUsageInfinite": hi => {
            const seq = hi.repeatElement(8);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([8, 8, 8, 8, 8, 8, 8]));
        },
    },
});

export default repeatElement;
