hi.ForwardFlattenSequence = function(source, frontSource = null){
    this.source = source;
    this.frontSource = frontSource;
};

hi.BackwardFlattenSequence = function(source, frontSource = null){
    this.source = source;
    this.frontSource = frontSource;
};

hi.ForwardFlattenSequence.prototype = Object.create(hi.Sequence.prototype);
hi.ForwardFlattenSequence.prototype.constructor = hi.ForwardFlattenSequence;
Object.assign(hi.ForwardFlattenSequence.prototype, {
    reverse: function(){
        return new hi.BackwardFlattenSequence(this.source);
    },
    initialize: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            this.frontSource = hi.asSequence(this.source.nextFront());
        }
        this.done = function(){
            return this.frontSource.done();
        };
        this.front = function(){
            return this.frontSource.front();
        };
        this.popFront = function(){
            this.frontSource.popFront();
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = hi.asSequence(this.source.nextFront());
            }
        };
    },
    bounded: () => false,
    done: function(){
        this.initialize();
        return this.frontSource.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.frontSource.front();
    },
    popFront: function(){
        this.initialize();
        this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

hi.BackwardFlattenSequence.prototype = Object.create(hi.Sequence.prototype);
hi.BackwardFlattenSequence.prototype.constructor = hi.BackwardFlattenSequence;
Object.assign(hi.BackwardFlattenSequence.prototype, {
    reverse: function(){
        return new hi.ForwardFlattenSequence(this.source);
    },
    initialize: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            this.frontSource = hi.asSequence(this.source.nextBack());
        }
        this.done = function(){
            return this.frontSource.done();
        };
        this.front = function(){
            return this.frontSource.back();
        };
        this.popFront = function(){
            this.frontSource.popBack();
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = hi.asSequence(this.source.nextBack());
            }
        };
    },
    bounded: () => false,
    done: function(){
        this.initialize();
        return this.frontSource.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.frontSource.back();
    },
    popFront: function(){
        this.initialize();
        this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

// Flatten a single level deep.
hi.register("flatten", {
    sequences: 1,
}, function(source){
    return new hi.ForwardFlattenSequence(source);
});
