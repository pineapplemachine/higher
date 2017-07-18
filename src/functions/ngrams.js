import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {InfiniteRepeatElementSequence} from "./repeatElement";

export const SlicingNgramSequence = Sequence.extend({
    constructor: function SlicingNgramSequence(
        ngramSize, source,
        lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        if(!source.length) throw "Source must have length.";
        if(!source.slice) throw "Source must allow slicing.";
        this.ngramSize = ngramSize;
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.highIndex = (highIndex !== undefined ?
            highIndex : 1 + source.length() - ngramSize
        );
        this.frontIndex = frontIndex !== undefined ? frontIndex : this.lowIndex;
        this.backIndex = backIndex !== undefined ? backIndex : this.highIndex;
        this.maskAbsentMethods(source);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    left: function(){
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        return this.source.slice(
            this.frontIndex, this.frontIndex + this.ngramSize
        );
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.source.slice(
            this.backIndex - 1, this.backIndex - 1 + this.ngramSize
        );
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        return this.source.slice(i, i + this.ngramSize);
    },
    slice: function(i, j){
        return new SlicingNgramSequence(
            this.ngramSize, this.source, this.lowIndex + i, this.lowIndex + j
        );
    },
    has: null,
    get: null,
    copy: function(){
        return new SlicingNgramSequence(
            this.ngramSize, this.source, this.lowIndex,
            this.highIndex, this.frontIndex, this.backIndex
        );
    },
    reset: function(){
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const TrackingNgramSequence = Sequence.extend({
    constructor: function TrackingNgramSequence(
        ngramSize, source, currentNgram = undefined
    ){
        this.ngramSize = ngramSize;
        this.source = source;
        this.currentNgram = currentNgram;
        this.maskAbsentMethods(source);
    },
    initialize: function(){
        this.currentNgram = [];
        while(!this.source.done() && this.currentNgram.length < this.ngramSize){
            this.currentNgram.push(this.source.nextFront());
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.currentNgram) this.initialize();
        return this.source.done() && this.currentNgram.length < this.ngramSize;
    },
    length: function(){
        return 1 + this.source.length() - this.ngramSize;
    },
    left: function(){
        if(!this.currentNgram) this.initialize();
        return (this.currentNgram.length >= this.ngramSize) + this.source.left();
    },
    front: function(){
        if(!this.currentNgram) this.initialize();
        return new ArraySequence(this.currentNgram);
    },
    popFront: function(){
        if(!this.currentNgram) this.initialize();
        this.currentNgram = this.currentNgram.slice(1);
        if(!this.source.done()){
            this.currentNgram.push(this.source.nextFront());
        }
    },
    back: null,
    popBack: null,
    index: function(i){
        const ngram = [];
        for(let j = i; j < i + this.ngramSize; j++){
            ngram.push(this.source.index(i));
        }
        return ngram;
    },
    slice: function(i, j){
        return new NgramSequence(
            this.ngramSize, this.source.slice(i, j + this.ngramSize)
        );
    },
    has: null,
    get: null,
    copy: function(){
        const copy = new NgramSequence(this.ngramSize, this.source.copy());
        if(this.currentNgram) copy.currentNgram = this.currentNgram.slice();
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.currentNgram = undefined;
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.currentNgram = undefined;
        return this;
    },
});

export const ngrams = wrap({
    name: "ngrams",
    attachSequence: true,
    async: false,
    sequences: [
        SlicingNgramSequence,
        TrackingNgramSequence
    ],
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (ngramSize, source) => {
        if(ngramSize < 1){
            return new InfiniteRepeatElementSequence(new ArraySequence([]));
        }else if(source.length && source.slice && source.bounded()){
            return new SlicingNgramSequence(ngramSize, source);
        }else{
            return new TrackingNgramSequence(ngramSize, source);
        }
    },
});

export default ngrams;
