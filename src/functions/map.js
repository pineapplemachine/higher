// Map sequence optimized for no input sequences.
function NullMapSequence(transform){
    this.transform = transform;
}

// Map sequence optimized for one input sequence.
function SingularMapSequence(transform, source){
    this.source = source;
    this.transform = transform;
    this.maskAbsentMethods(source);
}

// Map sequence for any number of input sequences.
function PluralMapSequence(transform, sources){
    this.sources = sources;
    this.source = sources[0];
    this.transform = transform;
    for(let source of sources){
        this.maskAbsentMethods(source);
    }
}

NullMapSequence.prototype = Object.create(EmptySequence.prototype);

SingularMapSequence.prototype = Object.create(Sequence.prototype);
Object.assign(SingularMapSequence.prototype, {
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
        return new SingularMapSequence(this.transform, this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.transform(this.source.get(i));
    },
    copy: function(){
        return new SingularMapSequence(this.transform, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

PluralMapSequence.prototype = Object.create(Sequence.prototype);
Object.assign(PluralMapSequence.prototype, {
    bounded: function(){
        for(let source of this.sources){
            if(!source.bounded()) return false;
        }
        return true;
    },
    done: function(){
        for(let source of this.sources){
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
        let elements = [];
        for(let source of this.sources) elements.push(source.front());
        return this.transform.apply(this, elements);
    },
    popFront: function(){
        for(let source of this.sources){
            source.popFront();
        }
    },
    back: function(){
        let elements = [];
        for(let source of this.sources) elements.push(source.back());
        return this.transform.apply(this, elements);
    },
    popBack: function(){
        for(let source of this.sources){
            source.popBack();
        }
    },
    index: function(i){
        let elements = [];
        for(let source of this.sources) elements.push(source.index(i));
        return this.transform.apply(this, elements);
    },
    slice: function(i, j){
        let slices = [];
        for(let source of this.sources) slices.push(source.slice(i, j));
        return new PluralMapSequence(this.transform, slices);
    },
    has: function(i){
        for(let source of this.sources){
            if(!source.has(i)) return false;
        }
        return true;
    },
    get: function(i){
        let elements = [];
        for(let source of this.sources) elements.push(source.get(i));
        return this.transform.apply(this, elements);
    },
    copy: function(){
        let copies = [];
        for(let source of this.sources) copies.push(source.copy());
        return new PluralMapSequence(this.transform, copies);
    },
    reset: function(){
        for(let source of this.sources) source.reset();
        return this;
    },
});

const map = registerFunction("map", {
    functions: 1,
    sequences: "*",
}, function(transform, sources){
    if(sources.length === 1){
        return new SingularMapSequence(transform, sources[0]);
    }else if(sources.length === 0){
        return new NullMapSequence(transform);
    }else{
        return new PluralMapSequence(transform, sources);
    }
});
