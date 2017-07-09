import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {InfiniteRepeatElementSequence} from "./repeatElement";

const getStrideLength = function(strideLength){
    const value = Math.floor(+strideLength);
    if(value < 1) throw (
        "Failed to create stride sequence: Stride length must not be less than one."
    );
    return value;
};

// Implement stride using repeated popping of elements.
// Note that initialization potentially changes the state of the source sequence.
// TODO: Fix initialization changing the source
export const PoppingStrideSequence = Sequence.extend({
    constructor: function PoppingStrideSequence(strideLength, source){
        this.strideLength = getStrideLength(strideLength);
        this.source = source;
        this.maskAbsentMethods(source);
        if(source.back && source.length){
            const pop = source.length() % strideLength;
            for(let i = 0; i < pop && !source.done(); i++){
                source.popBack();
            }
        }else{
            this.back = null;
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return Math.floor(this.source.length() / this.strideLength);
    },
    left: function(){
        return Math.floor(this.source.left() / this.strideLength);
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        for(let i = 0; i < this.strideLength && !this.source.done(); i++){
            this.source.popFront();
        }
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        for(let i = 0; i < this.strideLength && !this.source.done(); i++){
            this.source.popBack();
        }
    },
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new StrideSequence(this.strideLength, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

// Implement stride using indexing.
// For this to be available, the source must support index and length methods.
export const IndexStrideSequence = Sequence.extend({
    constructor: function IndexStrideSequence(strideLength, source){
        if(!source.index || !source.length || !source.bounded()){
            // TODO: More descriptive error
            throw "Failed to create stride sequence.";
        }
        this.strideLength = getStrideLength(strideLength);
        this.source = source;
        this.frontIndex = 0;
        this.backIndex = source.length();
        this.backIndex -= (this.backIndex % strideLength);
        this.maskAbsentMethods(source);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return Math.floor(this.source.length() / this.strideLength);
    },
    left: function(){
        return Math.floor(this.source.left() / this.strideLength);
    },
    front: function(){
        return this.source.index(this.frontIndex);
    },
    popFront: function(){
        this.frontIndex += this.strideLength;
    },
    back: function(){
        return this.source.index(this.backIndex - 1);
    },
    popBack: function(){
        this.backIndex -= this.strideLength;
    },
    index: function(i){
        return this.source.index(i * this.strideLength);
    },
    slice: function(i, j){
        return new IndexStrideSequence(this.strideLength,
            this.source.slice(i * this.strideLength, j * this.strideLength)
        );
    },
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new IndexStrideSequence(this.strideLength, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        this.backIndex = source.length();
        this.backIndex -= (this.backIndex % strideLength);
        return this;
    },
});

export const stride = wrap({
    name: "stride",
    attachSequence: true,
    async: false,
    sequences: [
        PoppingStrideSequence,
        IndexStrideSequence
    ],
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (strideLength, source) => {
        if(strideLength <= 0){
            return new InfiniteRepeatElementSequence(source.front());
        }else if(strideLength === 1){
            return source;
        }else if(source.index && source.length && source.bounded()){
            return new IndexStrideSequence(strideLength, source);
        }else{
            return new PoppingStrideSequence(strideLength, source);
        }
    },
});

export default stride;
