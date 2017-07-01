hi.DropHeadSequence = function(dropElements, source, initialized = false){
    this.dropElements = dropElements;
    this.source = source;
    this.initialized = initialized;
    this.maskAbsentMethods(source);
};

hi.DropHeadSequence.prototype = Object.create(hi.Sequence.prototype);
hi.DropHeadSequence.prototype.constructor = hi.DropHeadSequence;
Object.assign(hi.DropHeadSequence.prototype, {
    initialize: function(){
        this.initialized = true;
        for(let i = 0; i < this.dropElements && !this.source.done(); i++){
            this.source.popFront();
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        if(!this.initialized) this.initialize();
        return this.source.done();
    },
    length: function(){
        return this.source.length() - this.dropElements;
    },
    left: function(){
        return this.source.left() - this.initialized * this.dropElements;
    },
    front: function(){
        if(!this.initialized) this.initialize();
        return this.source.front();
    },
    popFront: function(){
        if(!this.initialized) this.initialize();
        this.source.popFront();
    },
    back: null,
    popBack: null,
    index: function(i){
        return this.source.index(i + this.dropElements);
    },
    // Don't create DropHeadSequences for sequences that already have slicing!
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new hi.DropHeadSequence(
            this.dropElements, this.source.copy(), this.initialized
        );
    },
    reset: function(){
        this.source.reset();
        this.DropHeadSequence = false;
        return this;
    },
});

hi.register("dropHead", {
    numbers: 1,
    sequences: 1,
}, function(dropElements, source){
    if(dropElements <= 0){
        return source;
    }else if(source.slice && source.length){
        return source.slice(dropElements, source.length());
    }else{
        return new hi.DropHeadSequence(dropElements, source);
    }
});
