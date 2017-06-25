const getStrideLength = function(strideLength){
    let value = Math.floor(+strideLength);
    if(value < 1) throw (
        "Failed to create stride sequence: Stride length must not be less than one."
    );
    return value;
};

// Implement stride using repeated popping of elements.
// Note that initialization potentially changes the state of the source sequence.
hi.PoppingStrideSequence = function(strideLength, source){
    this.strideLength = getStrideLength(strideLength);
    this.source = source;
    this.maskAbsentMethods(source);
    if(source.back && source.length){
        let pop = source.length() % strideLength;
        for(let i = 0; i < pop && !source.done(); i++){
            source.popBack();
        }
    }else{
        this.back = null;
    }
};

// Implement stride using indexing.
// For this to be available, the source must support index and length methods.
hi.IndexStrideSequence = function(strideLength, source){
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

hi.PoppingStrideSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.PoppingStrideSequence.prototype, {
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
        let copy = new hi.StrideSequence(this.strideLength, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

hi.IndexStrideSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.IndexStrideSequence.prototype, {
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
        return new hi.IndexStrideSequence(this.strideLength,
            this.source.slice(i * this.strideLength, j * this.strideLength)
        );
    },
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        let copy = new hi.IndexStrideSequence(this.strideLength, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        this.backIndex = source.length();
        this.backIndex -= (this.backIndex % strideLength);
        return this;
    },
});

hi.register("stride", {
    numbers: 1,
    sequences: 1,
}, function(strideLength, source){
    if(strideLength === 1){
        return source;
    }else if(source.index && source.length && source.bounded()){
        return new hi.IndexStrideSequence(strideLength, source);
    }else{
        return new hi.PoppingStrideSequence(strideLength, source);
    }
});
