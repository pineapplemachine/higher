import {constants} from "../core/constants";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {ForwardFindSequence, BackwardFindSequence} from "./findAll";
import {mustSupport} from "./mustSupport";

// TODO: It may be feasible to support splitting for sequences without slicing
export const ForwardSplitSequence = defineSequence({
    constructor: function ForwardSplitSequence(
        compare, source, delimiter, beginDelimiter = undefined,
        endDelimiter = undefined, frontValue = undefined,
        frontResult = undefined, findDelimiters = undefined
    ){
        if(!source.slice || !source.length){
            throw "Error splitting sequence: Input must support slicing and length.";
        }
        if(!delimiter.copy){
            throw "Error splitting sequence: Delimiter must support copying.";
        }
        this.compare = compare;
        this.source = source;
        this.delimiter = delimiter;
        this.beginDelimiter = beginDelimiter;
        this.endDelimiter = endDelimiter;
        this.frontValue = frontValue;
        this.frontResult = frontResult || {low: 0, high: 0};
        this.findDelimiters = findDelimiters || new ForwardFindSequence(
            compare, source, delimiter.copy()
        );
    },
    reverse: function(){
        return new BackwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter
        );
    },
    // Include the delimiter sequence at the beginning of every element
    beginWithDelimiter: function(){
        this.beginDelimiter = true;
        return this;
    },
    // Include the delimiter sequence at the end of every element
    endWithDelimiter: function(){
        this.endDelimiter = true;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return !this.frontValue && this.findDelimiters.done();
    },
    length: null,
    left: null,
    front: function(){
        if(!this.frontValue) this.popFront();
        return this.frontValue;
    },
    popFront: function(){
        if(this.findDelimiters.done()){
            this.frontValue = !this.frontResult ? null : this.source.slice(
                this.beginDelimiter ? this.frontResult.low : this.frontResult.high,
                this.source.length()
            );
            this.frontResult = null;
        }else{
            const result = this.findDelimiters.nextFront();
            this.frontValue = this.source.slice(
                this.beginDelimiter ? this.frontResult.low : this.frontResult.high,
                this.endDelimiter ? result.high : result.low
            );
            this.frontResult = result;
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        return new ForwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter, this.frontValue,
            this.frontResult, this.findDelimiters.copy()
        );
    },
    reset: function(){
        this.findDelimiters.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.findDelimiters = new ForwardFindSequence(
            this.compare, source, this.delimiter.copy()
        );
        return this;
    },
});

export const BackwardSplitSequence = defineSequence({
    constructor: function BackwardSplitSequence(
        compare, source, delimiter, beginDelimiter = undefined,
        endDelimiter = undefined, frontValue = undefined,
        frontResult = undefined, findDelimiters = undefined
    ){
        if(!source.slice || !source.length){
            throw "Error splitting sequence: Input must support slicing and length.";
        }
        if(!delimiter.copy){
            throw "Error splitting sequence: Delimiter must support copying.";
        }
        this.compare = compare;
        this.source = source;
        this.delimiter = delimiter;
        this.beginDelimiter = beginDelimiter;
        this.endDelimiter = endDelimiter;
        this.frontValue = frontValue;
        const sourceLength = source.length();
        this.frontResult = frontResult || {low: sourceLength, high: sourceLength};
        this.findDelimiters = findDelimiters || new BackwardFindSequence(
            compare, source, delimiter.copy()
        );
    },
    reverse: function(){
        return new ForwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter
        );
    },
    // Include the delimiter sequence at the beginning of every element
    beginWithDelimiter: function(){
        this.beginDelimiter = true;
        return this;
    },
    // Include the delimiter sequence at the end of every element
    endWithDelimiter: function(){
        this.endDelimiter = true;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return !this.frontValue && this.findDelimiters.done();
    },
    length: null,
    left: null,
    front: function(){
        if(!this.frontValue) this.popFront();
        return this.frontValue;
    },
    popFront: function(){
        if(this.findDelimiters.done()){
            this.frontValue = !this.frontResult ? null : this.source.slice(
                0, this.endDelimiter ? this.frontResult.high : this.frontResult.low
            );
            this.frontResult = null;
        }else{
            const result = this.findDelimiters.nextFront();
            this.frontValue = this.source.slice(
                this.beginDelimiter ? result.low : result.high,
                this.endDelimiter ? this.frontResult.high : this.frontResult.low
            );
            this.frontResult = result;
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        return new BackwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter, this.frontValue,
            this.frontResult, this.findDelimiters.copy()
        );
    },
    reset: function(){
        this.findDelimiters.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.findDelimiters = new BackwardFindSequence(
            this.compare, source, this.delimiter.copy()
        );
        return this;
    },
});

export const split = wrap({
    name: "split",
    attachSequence: true,
    async: false,
    sequences: [
        ForwardSplitSequence,
        BackwardSplitSequence
    ],
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2
        }
    },
    implementation: (compare, sequences) => {
        const compareFunc = compare || constants.defaults.comparisonFunction;
        const source = sequences[0];
        const delimiter = sequences[1];
        return new ForwardSplitSequence(
            compareFunc, source.mustSupport("slice", "length"), copyable(delimiter)
        );
    },
});

export default split;
