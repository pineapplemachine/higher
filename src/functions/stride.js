import Sequence from "../core/sequence";

const getStrideLength = function(strideLength){
    const value = Math.floor(+strideLength);
    if(value < 1) throw (
        "Failed to create stride sequence: Stride length must not be less than one."
    );
    return value;
};

/**
 * Implement stride using repeated popping of elements.
 * Note that initialization potentially changes the state of the source sequence.
 * @param {*} strideLength
 * @param {*} source
 */
const PoppingStrideSequence = function(strideLength, source){
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
};

/**
 * Implement stride using indexing.
 * For this to be available, the source must support index and length methods.
 * @param {*} strideLength
 * @param {*} source
 */
const IndexStrideSequence = function(strideLength, source){
    if(!source.bounded()){
        throw "Failed to create stride sequence: Source must be bounded.";
    }
    this.strideLength = getStrideLength(strideLength);
    this.source = source;
    this.frontIndex = 0;
    this.backIndex = source.length();
    this.backIndex -= (this.backIndex % strideLength);
    this.maskAbsentMethods(source);
};

PoppingStrideSequence.prototype = Object.create(Sequence.prototype);
PoppingStrideSequence.prototype.constructor = PoppingStrideSequence;
Object.assign(PoppingStrideSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
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

IndexStrideSequence.prototype = Object.create(Sequence.prototype);
IndexStrideSequence.prototype.constructor = IndexStrideSequence;
Object.assign(IndexStrideSequence.prototype, {
    bounded: () => true,
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

/**
 *
 * @param {*} strideLength
 * @param {*} source
 */
const stride = (strideLength, source) => {
    if(strideLength === 1){
        return source;
    }else if(source.index && source.length && source.bounded()){
        return new IndexStrideSequence(strideLength, source);
    }else{
        return new PoppingStrideSequence(strideLength, source);
    }
};

export const registration = {
    name: "stride",
    expected: {
        numbers: 1,
        sequences: 1,
    },
    implementation: stride,
};

export default stride;
