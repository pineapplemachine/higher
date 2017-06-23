// A chronically empty sequence.
function EmptySequence(){}

EmptySequence.prototype = Object.create(Sequence.prototype);
Object.assign(EmptySequence.prototype, {
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

const empty = registerFunction("empty", {}, function(){
    return new EmptySequence();
});
