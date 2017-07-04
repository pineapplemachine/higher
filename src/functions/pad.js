import Sequence from "../core/sequence";
import {FiniteRepeatElementSequence} from "./repeatElement";

const PadLeftSequence = function(
    source, padElement, padTotal, padCount = undefined
){
    this.source = source;
    this.padElement = padElement;
    this.padTotal = padTotal;
    this.padCount = padCount || 0;
    this.maskAbsentMethods(source);
};

const PadRightSequence = function(
    source, padElement, padTotal, padCount = undefined
){
    this.source = source;
    this.padElement = padElement;
    this.padTotal = padTotal;
    this.padCount = padCount || 0;
    this.maskAbsentMethods(source);
    if(!source.length){
        this.index = null;
        this.slice = null;
    }
};

PadLeftSequence.prototype = Object.create(Sequence.prototype);
PadLeftSequence.prototype.constructor = PadLeftSequence;
Object.assign(PadLeftSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.padCount >= this.padTotal && this.source.done();
    },
    length: function(){
        return this.source.length() + this.padTotal;
    },
    left: function(){
        return this.source.left() + (this.padTotal - this.padCount);
    },
    front: function(){
        return (this.padCount >= this.padTotal ?
            this.source.front() : this.padElement
        );
    },
    popFront: function(){
        this.padCount++;
        if(this.padCount > this.padTotal){
            return this.source.popFront();
        }
    },
    back: function(){
        return this.source.done() ? this.padElement : this.source.back();
    },
    popBack: function(){
        if(this.source.done()){
            this.padCount++;
        }else{
            return this.source.popBack();
        }
    },
    index: function(i){
        return (i < this.padTotal ?
            this.padElement : this.source.index(i - this.padTotal)
        );
    },
    slice: function(i, j){
        if(j < this.padTotal){
            return new FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(i >= this.padTotal){
            return this.source.slice(i - this.padTotal, j - this.padTotal);
        }else{
            return new PadLeftSequence(
                this.source.slice(0, j - this.padTotal),
                this.padElement, this.padTotal - i
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
        return new PadLeftSequence(
            this.source.copy(), this.padElement,
            this.padTotal, this.padCount
        );
    },
    reset: function(){
        this.source.reset();
        this.padCount = 0;
        return this;
    },
});

PadRightSequence.prototype = Object.create(Sequence.prototype);
PadRightSequence.prototype.constructor = PadRightSequence;
Object.assign(PadRightSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.padCount >= this.padTotal && this.source.done();
    },
    length: function(){
        return this.source.length() + this.padTotal;
    },
    left: function(){
        return this.source.left() + (this.padTotal - this.padCount);
    },
    front: function(){
        return this.source.done() ? this.padElement : this.source.front();
    },
    popFront: function(){
        if(this.source.done()){
            this.padCount++;
        }else{
            return this.source.popFront();
        }
    },
    back: function(){
        return (this.padCount >= this.padTotal ?
            this.source.back() : this.padElement
        );
    },
    popBack: function(){
        this.padCount++;
        if(this.padCount > this.padTotal){
            return this.source.popBack();
        }
    },
    index: function(i){
        return i >= this.source.length() ? this.padElement : this.source.index(i);
    },
    slice: function(i, j){
        const sourceLength = this.source.length();
        if(i >= sourceLength){
            return new FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(j < sourceLength){
            return this.source.slice(i, j);
        }else{
            return new PadRightSequence(
                this.source.slice(i, sourceLength),
                this.padElement, j - sourceLength
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
        return new PadLeftSequence(
            this.source.copy(), this.padElement,
            this.padTotal, this.padCount
        );
    },
    reset: function(){
        this.source.reset();
        this.padCount = 0;
        return this;
    },
});

const SequencePadder = function(source){
    this.source = source;
};

Object.assign(SequencePadder.prototype, {
    left: function(length, element){
        if(this.source.unbounded()){
            return this.source;
        }else if(!this.source.bounded()){
            throw "Failed to pad sequence: Input must be known bounded or unbounded.";
        }
        if(!this.source.length) this.source.forceEager();
        const sourceLength = this.source.length();
        if(sourceLength >= length){
            return this.source;
        }else if(sourceLength === 0){
            return new FiniteRepeatElementSequence(length, element);
        }else{
            return this.leftCount(length - sourceLength, element);
        }
    },
    leftCount: function(count, element){
        return count <= 0 ? source : new PadLeftSequence(
            this.source, element, count
        );
    },
    right: function(length, element){
        if(this.source.unbounded()){
            return this.source;
        }else if(!this.source.bounded()){
            throw "Failed to pad sequence: Input must be known bounded or unbounded.";
        }
        if(!this.source.length) this.source.forceEager();
        const sourceLength = this.source.length();
        if(sourceLength >= length){
            return this.source;
        }else if(sourceLength === 0){
            return new FiniteRepeatElementSequence(length, element);
        }else{
            return this.rightCount(length - sourceLength, element);
        }
    },
    rightCount: function(count, element){
        return count <= 0 ? source : new PadRightSequence(
            this.source, element, count
        );
    },
});

/**
 *
 * @param {*} source
 */
const pad = (source) => {
    return new SequencePadder(source);
};

export const registration = {
    name: "pad",
    expected: {
        sequences: 1,
    },
    implementation: pad,
};

export default pad;
