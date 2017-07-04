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
        }else if(sourceLength === 0){
            return new hi.FiniteRepeatElementSequence(length, element);
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
            return new hi.FiniteRepeatElementSequence(length, element);
        }else{
            return this.rightCount(length - sourceLength, element);
        }
    },
    rightCount: function(count, element){
        return count <= 0 ? source : new hi.PadRightSequence(
            this.source, element, count
        );
    },
});

hi.PadLeftSequence = function(
    source, padElement, padTotal, padCount = undefined
){
    this.source = source;
    this.padElement = padElement;
    this.padTotal = padTotal;
    this.padCount = padCount || 0;
    this.maskAbsentMethods(source);
};

hi.PadRightSequence = function(
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

hi.PadLeftSequence.prototype = Object.create(hi.Sequence.prototype);
hi.PadLeftSequence.prototype.constructor = hi.PadLeftSequence;
Object.assign(hi.PadLeftSequence.prototype, {
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
            return new hi.FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(i >= this.padTotal){
            return this.source.slice(i - this.padTotal, j - this.padTotal);
        }else{
            return new hi.PadLeftSequence(
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
        return new hi.PadLeftSequence(
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

hi.PadRightSequence.prototype = Object.create(hi.Sequence.prototype);
hi.PadRightSequence.prototype.constructor = hi.PadRightSequence;
Object.assign(hi.PadRightSequence.prototype, {
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
            return new hi.FiniteRepeatElementSequence(j - i, this.padElement);
        }else if(j < sourceLength){
            return this.source.slice(i, j);
        }else{
            return new hi.PadRightSequence(
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
        return new hi.PadLeftSequence(
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

hi.register("pad", {
    sequences: 1,
}, function(source){
    return new hi.SequencePadder(source);
});
