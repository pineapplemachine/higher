hi.FlattenDeepSequence = function(source){
    this.source = source;
    this.sourceStack = [source];
    this.frontSource = source;
};

hi.FlattenDeepSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.FlattenDeepSequence.prototype, {
    // True when an element is a sequence which should be flattened.
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
        while(!this.frontSource.done()){
            const front = this.frontSource.front();
            if(!this.flattenElement(front)){
                break;
            }else{
                this.frontSource.popFront();
                const source = hi.asSequence(front);
                this.sourceStack.push(source);
                this.frontSource = source;
            }
        }
    },
    // Used internally to handle progression to the next element.
    // Resurface from empty sequences (and those containing only empties)
    bubbleStack: function(){
        while(this.sourceStack.length > 1 && this.frontSource.done()){
            this.sourceStack.pop();
            this.frontSource = this.sourceStack[this.sourceStack.length - 1];
        }
        if(!this.frontSource.done()){
            this.diveStack();
            if(this.frontSource.done()) this.bubbleStack();
        }
    },
    initialize: function(){
        this.diveStack();
        if(this.frontSource.done()) this.bubbleStack();
        this.front = function(){
            return this.frontSource.front();
        };
        this.popFront = function(){
            this.frontSource.popFront();
            this.diveStack();
            if(this.frontSource.done()) this.bubbleStack();
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
        return this.frontSource.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    // Can't support many operations because a sub-sequence might not support them.
    // TODO: Allow user to insist that the sequence should be bidirectional etc?
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

// Flatten recursively.
// Flattens arrays, iterables except strings, and sequences.
hi.register("flattenDeep", {
    sequences: 1,
}, function(source){
    return new hi.FlattenDeepSequence(source);
});
