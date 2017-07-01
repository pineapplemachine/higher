// Result of calling range with a step of greater than 0.
hi.RecurSequence = function(transform, seedValue = null, frontValue = null){
    this.transform = transform;
    this.seedValue = seedValue;
    this.frontValue = frontValue;
};

hi.RecurSequence.prototype = Object.create(hi.Sequence.prototype);
hi.RecurSequence.prototype.constructor = hi.RecurSequence;
Object.assign(hi.RecurSequence.prototype, {
    // Call this to set the initial value of the generator.
    // Necessarily resets the state of the sequence.
    seed: function(value){
        this.seedValue = value;
        this.frontValue = value;
        return this;
    },
    unbounded: () => true,
    bounded: () => false,
    done: () => false,
    length: null,
    left: null,
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue = this.transform(this.frontValue);
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: function(){
        return new hi.RecurSequence(
            this.transform, this.seedValue, this.frontValue
        );
    },
    reset: function(){
        this.frontValue = this.seedValue;
        return this;
    },
});

// Create a sequence enumerating numbers in a linear range.
// When one number is passed, it is an exclusive upper bound.
// When two numbers are passed, they are the inclusive lower and exclusive
// higher bounds, respectively.
// When three numbers are passed they are the lower and higher bounds and
// the step from one value to the next, respectively.
// The step is 1 by default but fractical, negative, and zero values are
// also accepted.
hi.recur = function(transform){
    if(!hi.isFunction(transform)) throw (
        "Failed to create recur sequence: Input must be a function."
    );
    return new hi.RecurSequence(transform);
};
