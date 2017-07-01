// Map sequence optimized for no input sequences.
hi.NullMapSequence = function(transform){
    this.transform = transform;
};

// Map sequence optimized for one input sequence.
hi.SingularMapSequence = function(transform, source){
    this.source = source;
    this.transform = transform;
    this.maskAbsentMethods(source);
};

// Map sequence for any number of input sequences.
hi.PluralMapSequence = function(transform, sources){
    this.sources = sources;
    this.source = sources[0];
    this.transform = transform;
    for(const source of sources){
        this.maskAbsentMethods(source);
    }
};

hi.NullMapSequence.prototype = Object.create(hi.EmptySequence.prototype);
hi.NullMapSequence.prototype.constructor = hi.NullMapSequence;

hi.SingularMapSequence.prototype = Object.create(hi.Sequence.prototype);
hi.SingularMapSequence.prototype.constructor = hi.SingularMapSequence;
Object.assign(hi.SingularMapSequence.prototype, {
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
        return this.transform(this.source.front());
    },
    popFront: function(){
        this.source.popFront();
    },
    back: function(){
        return this.transform(this.source.back());
    },
    popBack: function(){
        this.source.popBack();
    },
    index: function(i){
        return this.transform(this.source.index(i));
    },
    slice: function(i, j){
        return new hi.SingularMapSequence(this.transform, this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.transform(this.source.get(i));
    },
    copy: function(){
        return new hi.SingularMapSequence(this.transform, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

hi.PluralMapSequence.prototype = Object.create(hi.Sequence.prototype);
hi.PluralMapSequence.prototype.constructor = hi.PluralMapSequence;
Object.assign(hi.PluralMapSequence.prototype, {
    bounded: function(){
        for(const source of this.sources){
            if(!source.bounded()) return false;
        }
        return true;
    },
    done: function(){
        for(const source of this.sources){
            if(source.done()) return true;
        }
        return false;
    },
    length: function(){
        let min = this.sources[0].length;
        for(let i = 1; i < this.sources.length; i++){
            min = Math.min(min, this.sources[i].length());
        }
        return min;
    },
    left: function(){
        let min = this.sources[0].left;
        for(let i = 1; i < this.sources.length; i++){
            min = Math.min(min, this.sources[i].left());
        }
        return min;
    },
    front: function(){
        const elements = [];
        for(const source of this.sources) elements.push(source.front());
        return this.transform.apply(this, elements);
    },
    popFront: function(){
        for(const source of this.sources){
            source.popFront();
        }
    },
    back: function(){
        const elements = [];
        for(const source of this.sources) elements.push(source.back());
        return this.transform.apply(this, elements);
    },
    popBack: function(){
        for(const source of this.sources){
            source.popBack();
        }
    },
    index: function(i){
        const elements = [];
        for(const source of this.sources) elements.push(source.index(i));
        return this.transform.apply(this, elements);
    },
    slice: function(i, j){
        const slices = [];
        for(const source of this.sources) slices.push(source.slice(i, j));
        return new hi.PluralMapSequence(this.transform, slices);
    },
    has: function(i){
        for(const source of this.sources){
            if(!source.has(i)) return false;
        }
        return true;
    },
    get: function(i){
        const elements = [];
        for(const source of this.sources) elements.push(source.get(i));
        return this.transform.apply(this, elements);
    },
    copy: function(){
        const copies = [];
        for(const source of this.sources) copies.push(source.copy());
        return new hi.PluralMapSequence(this.transform, copies);
    },
    reset: function(){
        for(const source of this.sources) source.reset();
        return this;
    },
});

hi.register("map", {
    functions: 1,
    sequences: "*",
}, function(transform, sources){
    if(sources.length === 1){
        return new hi.SingularMapSequence(transform, sources[0]);
    }else if(sources.length === 0){
        return new hi.NullMapSequence(transform);
    }else{
        return new hi.PluralMapSequence(transform, sources);
    }
});
