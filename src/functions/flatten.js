hi.FlattenDeepSequence = function(source){
    this.source = source;
    this.sourceStack = [source];
    this.currentSource = source;
}

hi.FlattenDeepSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.FlattenDeepSequence.prototype, {
    flattenElement: function(element){
        return !hi.isString(element) && (
            hi.isArray(element) ||
            hi.isIterable(element) ||
            hi.isSequence(element)
        );
    },
    // Used internally to handle progression to the next element.
    // Dive into the lowest possible sequence.
    diveStack: function(){
        while(!this.currentSource.done()){
            const front = this.currentSource.front();
            if(!this.flattenElement(front)){
                break;
            }else{
                this.currentSource.popFront();
                const source = hi.asSequence(front);
                this.sourceStack.push(source);
                this.currentSource = source;
            }
        }
    },
    // Used internally to handle progression to the next element.
    // Resurface from empty sequences (and those containing only empties)
    bubbleStack: function(){
        while(this.sourceStack.length > 1 && this.currentSource.done()){
            this.sourceStack.pop();
            this.currentSource = this.sourceStack[this.sourceStack.length - 1];
        }
        if(!this.currentSource.done()){
            this.diveStack();
            if(this.currentSource.done()) this.bubbleStack();
        }
    },
    initialize: function(){
        this.diveStack();
        if(this.currentSource.done()) this.bubbleStack();
        this.front = function(){
            return this.currentSource.front();
        };
        this.popFront = function(){
            this.currentSource.popFront();
            this.diveStack();
            if(this.currentSource.done()) this.bubbleStack();
        };
    },
    bounded: () => false,
    done: function(){
        return this.sourceStack[0].done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.currentSource.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

// Flatten a single level deep.
hi.flatten = function(source){
    let sequences = [];
    for(let element of source) sequences.push(hi.asSequence(element));
    return new hi.ConcatSequence(sequences);
};
hi.Sequence.prototype.flatten = function(){
    return new hi.ConcatSequence(hi.asArray(this));
};

// Flatten recursively.
// Flattens arrays, iterables except strings, and sequences.
hi.register("flattenDeep", {
    sequences: 1,
}, function(source){
    return new hi.FlattenDeepSequence(source);
});

