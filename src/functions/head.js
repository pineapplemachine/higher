// Fallback implementation of first function for when slicing is unavailable.
function HeadSequence(elements, source, frontIndex = 0){
    this.elements = elements;
    this.source = source;
    this.frontIndex = frontIndex;
    this.maskAbsentMethods(source);
}

HeadSequence.prototype = Object.create(Sequence.prototype);
Object.assign(HeadSequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.frontIndex >= this.elements || this.source.done();
    },
    length: function(){
        let sourceLength = this.source.length();
        return sourceLength < this.elements ? sourceLength : this.elements;
    },
    left: function(){
        let sourceLeft = this.source.left();
        let indexLeft = this.elements - this.frontIndex;
        return sourceLeft < indexLeft ? sourceLeft : indexLeft;
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new HeadSequence(
            this.elements, this.source.copy(), this.frontIndex
        );
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        return this;
    },
});

// Get a sequence for enumerating the first so many elements of the input.
// The resulting sequence may be shorter than the length specified, but
// will never be longer.
hi.register("head", {
    numbers: 1,
    sequences: 1,
}, function(elements, source){
    if(elements < 1){
        return new EmptySequence();
    }else if(source.length && source.slice){
        let length = source.length();
        return source.slice(0, length < elements ? length : elements);
    }else{
        return new HeadSequence(elements, source);
    }
});
