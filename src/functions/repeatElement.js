function FiniteRepeatElementSequence(
    repetitions, element, finishedRepetitions = 0
){
    this.repetitions = repetitions;
    this.finishedRepetitions = finishedRepetitions || 0;
    this.element = element;
}

function InfiniteRepeatElementSequence(element){
    this.element = element;
}

FiniteRepeatElementSequence.prototype = Object.create(Sequence.prototype);
Object.assign(FiniteRepeatElementSequence.prototype, {
    seed: function(element){
        this.element = element;
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
    has: (i) => false,
    get: (i) => undefined,
    slice: function(i, j){
        return new FiniteRepeatElementSequence(this.element, j - i);
    },
    copy: function(){
        return new FiniteRepeatElementSequence(
            this.element, this.repetitions, this.finishedRepetitions
        );
    },
    reset: function(){
        this.finishedRepetitions = 0;
        return this;
    },
});

InfiniteRepeatElementSequence.prototype = Object.create(Sequence.prototype);
Object.assign(InfiniteRepeatElementSequence.prototype, {
    seed: function(element){
        this.element = element;
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
    has: (i) => false,
    get: (i) => undefined,
    slice: function(i, j){
        return new FiniteRepeatElementSequence(this.element, j - i);
    },
    copy: function(){
        return new InfiniteRepeatElementSequence(this.element);
    },
    reset: function(){
        return this;
    },
});

hi.repeatElement = function(){
    if(arguments.length === 1){
        return new InfiniteRepeatElementSequence(arguments[0]);
    }else if(arguments.length === 2){
        if(isNaN(arguments[0])){
            throw (
                "Failed to repeat element: First of two arguments is expected " +
                "to be a number."
            );
        }
        let repetitions = Math.floor(+arguments[0]);
        return new FiniteRepeatElementSequence(repetitions, arguments[1]);
    }else{
        throw (
            "Failed to repeat element: Function expects either one argument " +
            "representing an element to repeat infinitely, or two arguments, " +
            "the first being a number of times to repeat and the second being " +
            "the element to repeat."
        );
    }
};
