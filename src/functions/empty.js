// A chronically empty sequence.
hi.EmptySequence = function(){}

hi.EmptySequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.EmptySequence.prototype, {
    repeat: function(repetitions){
        const sequence = new hi.NullRepeatSequence(this);
        sequence.repetitions = repetitions;
        return sequence;
    },
    reverse: function(){
        return this;
    },
    bounded: () => true,
    done: () => true,
    length: () => 0,
    left: () => 0,
    front: () => undefined,
    popFront: () => {},
    back: () => undefined,
    popBack: () => {},
    index: (i) => undefined,
    has: (i) => false,
    get: (i) => undefined,
    slice: function(i, j){
        return this;
    },
    copy: function(){
        return this;
    },
    reset: function(){
        return this;
    },
});

hi.register("empty", {}, function(){
    return new hi.EmptySequence();
});
