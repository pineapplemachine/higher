function NgramSequence(ngramSize, source, currentNgram = null){
    this.ngramSize = Math.floor(+ngramSize);
    this.source = source;
    this.currentNgram = currentNgram || [];
    while(!source.done() && this.currentNgram.length < this.ngramSize){
        this.currentNgram.push(source.nextFront());
    }
    // Sequence only supports has if the source has known length.
    if(!source.length){
        this.has = null;
    }
    this.maskAbsentMethods(source);
}

NgramSequence.prototype = Object.create(Sequence.prototype);
Object.assign(NgramSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.source.done() && this.currentNgram.length < this.ngramSize;
    },
    length: function(){
        return 1 + this.source.length() - this.ngramSize;
    },
    left: function(){
        return 1 + this.source.left();
    },
    front: function(){
        return this.currentNgram.slice();
    },
    // Faster than front, but the return value must not be modified.
    frontImm: function(){
        return this.currentNgram;
    },
    popFront: function(){
        this.currentNgram.shift();
        if(!this.source.done()){
            this.currentNgram.push(this.source.nextFront());
        }
    },
    back: null,
    popBack: null,
    index: function(i){
        let ngram = [];
        for(let j = i; j < i + this.ngramSize; j++){
            ngram.push(this.source.index(i));
        }
    },
    slice: function(i, j){
        return new NgramSequence(
            this.ngramSize, this.source.slice(i, j + this.ngramSize)
        );
    },
    has: function(i){
        return Number.isInteger(i) && i >= 0 && i < this.length();
    },
    get: function(i){
        return this.index(i);
    },
    copy: function(){
        let copy = new NgramSequence(this.ngramSize, this.source.copy());
        copy.currentNgram = this.currentNgram.slice();
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.currentNgram = [];
        while(!this.source.done() && this.currentNgram.length < this.ngramSize){
            this.currentNgram.push(this.source.nextFront());
        }
        return this;
    },
});

const ngrams = registerFunction("ngrams", {
    numbers: 1,
    sequences: 1,
}, function(ngramSize, source){
    if(+ngramSize < 1){
        return new EmptySequence();
    }else{
        return new NgramSequence(ngramSize, source);
    }
});

const bigrams = registerFunction("bigrams", {
    sequences: 1,
}, function(source){
    return new NgramSequence(2, source);
});

const trigrams = registerFunction("trigrams", {
    sequences: 1,
}, function(source){
    return new NgramSequence(3, source);
});
