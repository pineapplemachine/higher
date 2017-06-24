hi.LazyArraySequence = function(source){
    if(!source.bounded()){
        throw "Failed to create lazy array: Input must be bounded.";
    }
    this.source = source;
    this.originalSource = source;
    this.arraySequence = null;
}

hi.LazyArraySequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.LazyArraySequence.prototype, {
    // Called when the sequence is accessed. Loads the source sequence
    // into an array and redirects this sequence to point to its contents.
    load: function(){
        this.arraySequence = hi.asSequence(this.source.array());
        this.source = this.arraySequence.source;
        this.lowIndex = this.arraySequence.lowIndex;
        this.highIndex = this.arraySequence.highIndex;
        this.frontIndex = this.arraySequence.frontIndex;
        this.backIndex = this.arraySequence.backIndex;
        this.done = this.arraySequence.done;
        this.length = this.arraySequence.length;
        this.left = this.arraySequence.left;
        this.front = this.arraySequence.front;
        this.popFront = this.arraySequence.popFront;
        this.back = this.arraySequence.back;
        this.popBack = this.arraySequence.popBack;
        this.index = this.arraySequence.index;
        this.slice = this.arraySequence.slice;
        this.has = this.arraySequence.has;
        this.get = this.arraySequence.get;
        this.copy = this.arraySequence.copy;
        this.reset = this.arraySequence.reset;
    },
    bounded: () => true,
    done: function(){
        if(!this.arraySequence) this.load();
        return this.done();
    },
    length: function(){
        if(!this.arraySequence) this.load();
        return this.length();
    },
    left: function(){
        if(!this.arraySequence) this.load();
        return this.left();
    },
    front: function(){
        if(!this.arraySequence) this.load();
        return this.front();
    },
    popFront: function(){
        if(!this.arraySequence) this.load();
        return this.popFront();
    },
    back: function(){
        if(!this.arraySequence) this.load();
        return this.back();
    },
    popBack: function(){
        if(!this.arraySequence) this.load();
        return this.popBack();
    },
    index: function(i){
        if(!this.arraySequence) this.load();
        return this.index(i);
    },
    has: function(i){
        if(!this.arraySequence) this.load();
        return this.has(i);
    },
    get: function(i){
        if(!this.arraySequence) this.load();
        return this.get(i);
    },
    slice: function(i, j){
        if(!this.arraySequence) this.load();
        return this.slice(i, j);
    },
    copy: function(){
        if(this.arraySequence) return this.arraySequence.copy();
        else return new hi.LazyArraySequence(this.source);
    },
    reset: function(){
        return this;
    },
});

// Load a sequence in-memory as an array and acquire a sequence for enumerating
// that array's contents, but only when something attempts to actually access
// the sequence's content.
hi.register("arrayLazy", {
    sequences: 1,
}, function(source){
    return new hi.LazyArraySequence(source);
});
