import {constants} from "../core/constants";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {ForwardFindSequence, BackwardFindSequence} from "./findAll";

// TODO: It may be feasible to support splitting for sequences without slicing
export const SplitSequence = defineSequence({
    constructor: function SplitSequence(
        compare, source, delimiter, beginDelimiter = undefined,
        endDelimiter = undefined, frontValue = undefined,
        frontResult = undefined, findDelimiters = undefined
    ){
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
    front: function(){
        if(!this.frontValue) this.popFront();
        return this.frontValue;
    },
    popFront: function(){
        if(this.findDelimiters.done()){
            this.frontValue = !this.frontResult ? null : this.source.nativeSlice(
                this.beginDelimiter ? this.frontResult.low : this.frontResult.high,
                this.source.nativeLength()
            );
            this.frontResult = null;
        }else{
            const result = this.findDelimiters.nextFront();
            this.frontValue = this.source.nativeSlice(
                this.beginDelimiter ? this.frontResult.low : this.frontResult.high,
                this.endDelimiter ? result.high : result.low
            );
            this.frontResult = result;
        }
    },
    copy: function(){
        return new SplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter, this.frontValue,
            this.frontResult, this.findDelimiters.copy()
        );
    },
    rebase: function(source){
        this.source = source;
        this.findDelimiters = new ForwardFindSequence(
            this.compare, source, this.delimiter.copy()
        );
        return this;
    },
});

export const split = wrap({
    name: "split",
    attachSequence: true,
    async: false,
    arguments: {
        // TODO: Better argument validation
        unordered: {
            functions: "?",
            sequences: 2,
        },
    },
    implementation: (compare, sequences) => {
        const compareFunc = compare || constants.defaults.comparisonFunction;
        const source = sequences[0];
        const delimiter = sequences[1];
        return new SplitSequence(
            compareFunc, source, copyable(delimiter)
        );
    },
});

export default split;
