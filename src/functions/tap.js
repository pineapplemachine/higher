import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const TapSequence = Sequence.extend({
    constructor: function TapSequence(callback, source){
        this.callback = callback;
        this.source = source;
        this.frontValue = null;
        this.backValue = null;
        this.cachedFront = false;
        this.cachedBack = false;
        this.maskAbsentMethods(source);
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
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        this.frontValue = this.source.front();
        this.cachedFront = true;
        return this.frontValue;
    },
    popFront: function(){
        this.callback(this.cachedFront ? this.frontValue : this.source.front());
        this.source.popFront();
        this.cachedFront = false;
    },
    back: function(){
        this.backValue = this.source.back();
        this.cachedBack = true;
        return this.backValue;
    },
    popBack: function(){
        this.callback(this.cachedBack ? this.backValue : this.source.back());
        this.source.popBack();
        this.cachedBack = false;
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return new TapSequence(this.callback, this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new TapSequence(this.callback, this.source.copy());
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        copy.cachedFront = this.cachedFront;
        copy.cachedBack = this.cachedBack;
    },
    reset: function(){
        this.source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Like each, except the callbacks are invoked as the sequence is consumed,
// as opposed to the sequence being consumed immediately.
export const tap = wrap({
    name: "tap",
    attachSequence: true,
    async: false,
    sequences: [
        TapSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (callback, source) => {
        return new TapSequence(callback, source);
    },
});

export default tap;
