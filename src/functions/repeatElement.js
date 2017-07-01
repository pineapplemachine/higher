hi.FiniteRepeatElementSequence = function(
    repetitions, element, finishedRepetitions = 0
){
    this.repetitions = repetitions;
    this.finishedRepetitions = finishedRepetitions || 0;
    this.element = element;
};

hi.InfiniteRepeatElementSequence = function(element){
    this.element = element;
};

hi.NullRepeatElementSequence = function(element){
    this.element = element;
};

hi.FiniteRepeatElementSequence.prototype = Object.create(hi.Sequence.prototype);
hi.FiniteRepeatElementSequence.prototype.constructor = hi.FiniteRepeatElementSequence;
Object.assign(hi.FiniteRepeatElementSequence.prototype, {
    seed: function(element){
        this.element = element;
        return this;
    },
    repeat: function(repetitions = null){
        if(repetitions === null || !isFinite(repetitions)){
            return new hi.InfiniteRepeatElementSequence(this.element);
        }else if(repetitions <= 0){
            return new hi.NullRepeatElementSequence(this.element);
        }else{
            return new hi.FiniteRepeatElementSequence(
                this.element, this.repetitions * repetitions
            );
        }
    },
    reverse: function(){
        return this;
    },
    shuffle: function(){
        return this;
    },
    bounded: () => true,
    done: function(){
        return this.finishedRepetitions >= this.repetitions;
    },
    length: function(){
        return this.repetitions;
    },
    left: function(){
        return this.finishedRepetitions - this.repetitions;
    },
    front: function(){
        return this.element;
    },
    popFront: function(){
        this.finishedRepetitions++;
    },
    back: function(){
        return this.element;
    },
    popBack: function(){
        this.finishedRepetitions++;
    },
    index: function(i){
        return this.element;
    },
    slice: function(i, j){
        return new hi.FiniteRepeatElementSequence(this.element, j - i);
    },
    has: null,
    get: null,
    copy: function(){
        return new hi.FiniteRepeatElementSequence(
            this.element, this.repetitions, this.finishedRepetitions
        );
    },
    reset: function(){
        this.finishedRepetitions = 0;
        return this;
    },
});

hi.InfiniteRepeatElementSequence.prototype = Object.create(hi.Sequence.prototype);
hi.InfiniteRepeatElementSequence.prototype.constructor = hi.InfiniteRepeatElementSequence;
Object.assign(hi.InfiniteRepeatElementSequence.prototype, {
    repetitions: Infinity,
    seed: function(element){
        this.element = element;
        return this;
    },
    repeat: function(repetitions){
        return this;
    },
    reverse: function(){
        return this;
    },
    shuffle: function(){
        return this;
    },
    bounded: () => false,
    done: () => false,
    length: null,
    left: null,
    front: function(){
        return this.element;
    },
    popFront: () => {},
    back: function(){
        return this.element;
    },
    popBack: () => {},
    index: function(i){
        return this.element;
    },
    has: null,
    get: null,
    slice: function(i, j){
        return new hi.FiniteRepeatElementSequence(this.element, j - i);
    },
    copy: function(){
        return new hi.InfiniteRepeatElementSequence(this.element);
    },
    reset: function(){
        return this;
    },
});

hi.NullRepeatElementSequence.prototype = Object.create(hi.EmptySequence.prototype);
hi.NullRepeatElementSequence.prototype.constructor = hi.NullRepeatElementSequence;
Object.assign(hi.NullRepeatElementSequence.prototype, {
    repetitions: 0,
    shuffle: function(){
        return this;
    },
    seed: function(element){
        this.element = element;
        return this;
    },
    slice: function(i, j){
        return new hi.NullRepeatElementSequence(this.element);
    },
    copy: function(){
        return new hi.NullRepeatElementSequence(this.element);
    },
});

hi.repeatElement = function(){
    if(arguments.length === 1){
        return new hi.InfiniteRepeatElementSequence(arguments[0]);
    }else if(arguments.length >= 2){
        const element = arguments[0];
        const repetitions = arguments[1];
        if(isNaN(repetitions)){
            throw hi.repeatElement.argumentsError;
        }else if(repetitions <= 0){
            return new hi.NullRepeatElementSequence(element);
        }else if(!isFinite(repetitions)){
            return new hi.InfiniteRepeatElementSequence(element);
        }else{
            const repetitions = Math.floor(+repetitions);
            return new hi.FiniteRepeatElementSequence(repetitions, element);
        }
    }else{
        throw hi.repeatElement.argumentsError;
    }
};

// Error object thrown when the arguments to repeatElement are incorrect.
hi.repeatElement.argumentsError = (
    "Failed to repeat element: The function must be called with one argument " +
    "or two arguments. When there is one argument, it is the element to be " +
    "infinitely repeated. When there are two arguments, the first must be the " +
    "number of times to repeat and the second the element to be repeated."
);
