hi.SequencePadder = function(source){
    this.source = source;
};

Object.assign(hi.SequencePadder.prototype, {
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
        }else{
            return this.leftCount(length - sourceLength, element);
        }
    },
    leftCount: function(count, element){
        return count <= 0 ? source : new hi.PadLeftSequence(
            this.source, element, count
        );
    },
    right: function(length, element){
        // TODO
    },
    rightCount: function(count, element){
        // TODO
    },
});

hi.PadLeftSequence = function(
    source, padElement, leftCount, leftPadded = undefined
){
    this.source = source;
    this.padElement = padElement;
    this.leftCount = leftCount;
    this.leftPadded = leftPadded || 0;
    this.maskAbsentMethods(source);
};

hi.PadLeftSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.PadLeftSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.leftPadded >= this.leftCount && this.source.done();
    },
    length: function(){
        return this.source.length() + this.leftCount;
    },
    left: function(){
        return this.source.left() + (this.leftCount - this.leftPadded);
    },
    front: function(){
        return (this.leftPadded >= this.leftCount ?
            this.source.front() : this.padElement
        );
    },
    popFront: function(){
        this.leftPadded++;
        if(this.leftPadded > this.leftCount){
            return this.source.popFront();
        }
    },
    back: function(){
        return this.source.done() ? this.padElement : this.source.back();
    },
    popBack: function(){
        if(this.source.done()){
            this.leftPadded++;
        }else{
            return this.source.popBack();
        }
    },
    index: function(i){
        return (i < this.leftCount ?
            this.padElement : this.source.index(i - this.leftCount)
        );
    },
    slice: function(i, j){
        if(j < this.leftCount){
            return new hi.FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(i >= this.leftCount){
            return this.source.slice(i - this.leftCount, j - this.leftCount);
        }else{
            return new hi.PadLeftSequence(
                this.source.slice(0, j - this.leftCount),
                this.padElement, this.leftCount - i
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
        return new hi.PadLeftSequence(
            this.source.copy(), this.padElement,
            this.leftCount, this.leftPadded
        );
    },
    reset: function(){
        this.source.reset();
        this.leftPadded = 0;
        return this;
    },
});

hi.register("pad", {
    sequences: 1,
}, function(source){
    return new hi.SequencePadder(source);
});