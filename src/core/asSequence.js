// Check whether a value is a sequence or can be coerced to a sequence type.
hi.validAsSequence = function(value){
    return hi.isIterable(value) || hi.isObject(value);
};

hi.validAsBoundedSequence = function(value){
    return (
        (hi.isSequence(value) && value.bounded()) ||
        hi.isArray(value) || hi.isString(value) || hi.isObject(value)
    );
};

// Get an array, string, iterable, or object as a sequence.
// If it receives a sequences as input, returns that sequence.
// For all other inputs an error is thrown.
hi.asSequence = function(source){
    if(hi.isSequence(source)){
        return source;
    }else if(hi.isArray(source)){
        return new hi.ArraySequence(source);
    }else if(hi.isString(source)){
        return new hi.StringSequence(source);
    }else if(hi.isIterable(source)){
        return new hi.IterableSequence(source);
    }else if(hi.isObject(source)){
        return new hi.ObjectSequence(source);
    }else{
        throw (
            "Value is not valid as a sequence. Only arrays, strings, " +
            "iterables, and objects can be made into sequences."
        );
    }
};

// Convenient alias for same.
hi.seq = hi.asSequence;

// Get a sequence for enumerating the elements of an array.
// Optionally accepts an inclusive start index and an exclusive end index.
// When start and end indexes aren't given, the sequence enumerates the
// entire contents of the array.
hi.ArraySequence = function(source, low, high){
    this.source = source;
    this.lowIndex = isNaN(low) ? 0 : low;
    this.highIndex = isNaN(high) ? source.length : high;
    this.frontIndex = this.lowIndex;
    this.backIndex = this.highIndex;
};

hi.ArraySequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.ArraySequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    left: function(){
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        return this.source[this.frontIndex];
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.source[this.backIndex - 1];
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        return this.source[this.lowIndex + i];
    },
    slice: function(i, j){
        return new hi.ArraySequence(
            this.source, this.lowIndex + i, this.lowIndex + j
        );
    },
    has: function(i){
        return Number.isInteger(i) && i >= 0 && i < this.length();
    },
    get: function(i){
        return this.source[i - this.lowIndex];
    },
    copy: function(){
        let copy = new hi.ArraySequence(this.source, this.lowIndex, this.highIndex);
        copy.frontIndex = this.frontIndex;
        copy.backIndex = this.backIndex;
        return copy;
    },
    reset: function(){
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        return this;
    },
});

// Get a sequence for enumerating the characters in a string.
// Optionally accepts an inclusive start index and an exclusive end index.
// When start and end indexes aren't given, the sequence enumerates the
// entire contents of the string.
hi.StringSequence = function(source, low, high){
    this.source = source;
    this.lowIndex = isNaN(low) ? 0 : low;
    this.highIndex = isNaN(high) ? source.length : high;
    this.frontIndex = this.lowIndex;
    this.backIndex = this.highIndex;
};

hi.StringSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.StringSequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.source.length;
    },
    left: function(){
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        return this.source[this.frontIndex];
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.source[this.backIndex - 1];
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        return this.source[this.lowIndex + i];
    },
    slice: function(i, j){
        return new hi.StringSequence(
            this.source, this.lowIdex + i, this.lowIndex + j
        );
    },
    has: function(i){
        return Number.isInteger(i) && i >= 0 && i < this.length();
    },
    get: function(i){
        return this.source[i - this.lowIndex];
    },
    copy: function(){
        let copy = new hi.StringSequence(this.source, this.lowIndex, this.highIndex);
        copy.frontIndex = this.frontIndex;
        copy.backIndex = this.backIndex;
        return copy;
    },
    reset: function(){
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        return this;
    },
});

// Get a sequence that enumerates the key, value pairs of an arbitrary object.
// Optionally accepts an array of keys indicating which keys of the object
// should be enumerated. When not explicitly provided, the sequence enumerates
// key, value pairs for all of the object's own keys.
hi.ObjectSequence = function(source, keys){
    this.source = source;
    this.keys = keys || Object.keys(source);
    this.keyIndex = 0;
};

hi.ObjectSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.ObjectSequence.prototype, {
    bounded: () => true,
    done: function(){
        return this.keyIndex >= this.keys.length;
    },
    length: function(){
        return this.keys.length;
    },
    left: function(){
        return this.keys.length - this.keyIndex;
    },
    front: function(){
        let key = this.keys[this.keyIndex];
        return {key: key, value: this.source[key]};
    },
    popFront: function(){
        return this.keyIndex++;
    },
    // Bidirectionality is technically possible but conceptually dodgy
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: function(i){
        return i in this.source;
    },
    get: function(i){
        return this.source[i];
    },
    copy: function(){
        let copy = new hi.ObjectSequence(this.source, this.keys);
        copy.keyIndex = this.keyIndex;
        return copy;
    },
    reset: function(){
        this.keyIndex = 0;
        return this;
    },
});

// Get a sequence that enumerates the items of an iterable.
// An iterable is anything with a "next" method returning an object with two
// attributes, "done" being a boolean indicating when the iterator has been
// fully consumed and "value" being the current element of the iterator.
hi.IterableSequence = function(source){
    this.source = source;
    this.item = source.next();
};

hi.IterableSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.IterableSequence.prototype, {
    bounded: () => false,
    done: function(){
        return this.item.done;
    },
    length: null,
    left: null,
    front: function(){
        return this.item.value;
    },
    popFront: function(){
        this.item = this.source.next();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: null,
    reset: null,
});
