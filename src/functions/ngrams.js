hi.NgramSequence = function(ngramSize, source, currentNgram = null){
    this.ngramSize = Math.floor(+ngramSize);
    this.source = source;
    this.currentNgram = currentNgram || [];
    while(!source.done() && this.currentNgram.length < this.ngramSize){
        this.currentNgram.push(source.nextFront());
    }
    this.maskAbsentMethods(source);
}

hi.NgramSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.NgramSequence.prototype, {
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
    // Note that modifying the returned array will break the behavior of this
    // sequence. For a value that's safe to modify, slice() the returned array.
    front: function(){
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
        return new hi.NgramSequence(
            this.ngramSize, this.source.slice(i, j + this.ngramSize)
        );
    },
    has: null,
    get: null,
    copy: function(){
        let copy = new hi.NgramSequence(this.ngramSize, this.source.copy());
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

hi.register("ngrams", {
    numbers: 1,
    sequences: 1,
}, function(ngramSize, source){
    if(+ngramSize < 1){
        return new hi.EmptySequence();
    }else{
        return new hi.NgramSequence(ngramSize, source);
    }
});

hi.register("bigrams", {
    sequences: 1,
}, function(source){
    return new hi.NgramSequence(2, source);
});

hi.register("trigrams", {
    sequences: 1,
}, function(source){
    return new hi.NgramSequence(3, source);
});
