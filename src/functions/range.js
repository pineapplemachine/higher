// Result of calling range with a step of greater than 0.
hi.ForwardNumberRangeSequence = function(start, end, step = 1){
    if(step <= 0){
        throw "Failed to create range: Step must be greater than zero.";
    }
    this.start = start;
    this.end = end;
    this.step = step;
    this.frontValue = start;
    this.backValue = end - (end % step);
};

// Result of calling range with a step of less than 0.
hi.BackwardNumberRangeSequence = function(start, end, step = -1){
    if(step >= 0){
        throw "Failed to create range: Step must be less than zero.";
    }
    this.start = start;
    this.end = end;
    this.step = step;
    this.frontValue = start;
    this.backValue = end + (end % -step);
};

hi.ForwardNumberRangeSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.ForwardNumberRangeSequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.frontValue >= this.backValue;
    },
    length: function(){
        return Math.floor((this.end - this.start) / this.step);
    },
    left: function(){
        return Math.floor((this.backValue - this.frontValue) / this.step);
    },
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue += this.step;
    },
    back: function(){
        return this.backValue;
    },
    popBack: function(){
        this.backValue += this.step;
    },
    index: function(i){
        return this.start + i * this.step;
    },
    slice: function(i, j){
        return new hi.ForwardNumberRangeSequence(
            this.start + i * this.step, this.start + j * this.step, this.step
        );
    },
    copy: function(){
        let copy = new hi.ForwardNumberRangeSequence(
            this.start, this.end, this.step
        );
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        return copy;
    },
    reset: function(){
        this.frontValue = this.start;
        this.backValue = this.end;
    },
});

hi.BackwardNumberRangeSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.BackwardNumberRangeSequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.frontValue < this.backValue;
    },
    length: function(){
        return Math.floor((this.start - this.end) / this.step);
    },
    left: function(){
        return Math.floor((this.frontValue - this.backValue) / this.step);
    },
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue += this.step;
    },
    back: function(){
        return this.backValue;
    },
    popBack: function(){
        this.backValue += this.step;
    },
    index: function(i){
        return this.start + i * this.step;
    },
    slice: function(i, j){
        return new hi.BackwardNumberRangeSequence(
            this.start + i * this.step, this.start + j * this.step, this.step
        );
    },
    copy: function(){
        let copy = new hi.BackwardNumberRangeSequence(
            this.start, this.end, this.step
        );
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        return copy;
    },
    reset: function(){
        this.frontValue = this.start;
        this.backValue = this.end;
    },
});

// Result of calling range with a step of 0.
// Looks on the surface like any other number range sequence,
// but is actually unbounded.
hi.NullStepRangeSequence = function(start, end){
    this.start = start;
    this.end = end;
    this.step = 0;
    this.element = start;
};

hi.NullStepRangeSequence.prototype = Object.create(
    hi.InfiniteRepeatElementSequence.prototype
);

// Create a sequence enumerating numbers in a linear range.
// When one number is passed, it is an exclusive upper bound.
// When two numbers are passed, they are the inclusive lower and exclusive
// higher bounds, respectively.
// When three numbers are passed they are the lower and higher bounds and
// the step from one value to the next, respectively.
// The step is 1 by default but fractical, negative, and zero values are
// also accepted.
hi.register("range", {
    numbers: [1, 3],
}, function(numbers){
    if(numbers.length === 1){
        return new hi.ForwardNumberRangeSequence(0, numbers[0], 1);
    }else if(numbers.length === 2){
        return new hi.ForwardNumberRangeSequence(numbers[0], numbers[1], 1);
    }else if(numbers[2] > 0){
        return new hi.ForwardNumberRangeSequence(numbers[0], numbers[1], numbers[2]);
    }else if(numbers[2] < 0){
        return new hi.BackwardNumberRangeSequence(numbers[0], numbers[1], numbers[2]);
    }else{
        return new hi.NullStepRangeSequence(numbers[0], numbers[1]);
    }
});
