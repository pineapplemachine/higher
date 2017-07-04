import Sequence from "../core/sequence";

const ReverseSequence = function(source){
    if(!source.back){
        throw "Failed to reverse sequence: Sequence must be bidirectional.";
    }
    this.source = source;
    this.maskAbsentMethods(source);
    // Length property is required to support index and slice operations.
    if(!source.length){
        this.index = null;
        this.slice = null;
    }
};

ReverseSequence.prototype = Object.create(Sequence.prototype);
ReverseSequence.prototype.constructor = ReverseSequence;
Object.assign(ReverseSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
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
        return this.source.back();
    },
    popFront: function(){
        return this.source.popBack();
    },
    back: function(){
        return this.source.front();
    },
    popBack: function(){
        return this.source.popFront();
    },
    index: function(i){
        return this.source.index(this.source.length - i - 1);
    },
    slice: function(i, j){
        return new ReverseSequence(this.source.slice(
            this.source.length - j - 1,
            this.source.length - i - 1
        ));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new ReverseSequence(this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
    // This sequence requires special handling when collapsing.
    collapseBreak: function(target, length){
        let i = 0;
        let j = length;
        while(i < j){
            const t = target[i];
            target[i] = target[j - 1];
            target[j - 1] = t;
            i++;
            j--;
        }
        return length;
    },
});

/**
 *
 * @param {*} source
 */
const reverse = (source) => {
    if(source instanceof ReverseSequence){
        return source.source;
    }else if(source.back){
        return new ReverseSequence(source);
    }else if(source.bounded()){
        // For large sequences this can be expensive, but the only way to do it.
        return new ReverseSequence(new hi.LazyArraySequence(source));
    }else{
        throw "Failed to reverse sequence: Can't reverse unidirectional unbounded sequence.";
    }
};

export const registration = {
    name: "reverse",
    expected: {sequences: 1},
    implementation: reverse,
};

export default reverse;
