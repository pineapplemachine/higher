import {isArray, isFunction, isIterable, isObject, isSequence, isString} from "./types";
import Sequence from "./sequence";

/**
 * Check whether a value is a sequence or can be coerced to a sequence type.
 * @param {*} value
 */
function validAsSequence(value){
    return isIterable(value) || isObject(value);
}

function validAsBoundedSequence(value){
    return (
        (isSequence(value) && value.bounded()) ||
        isArray(value) || isString(value) || isObject(value)
    );
}

function canGetLength(source){
    return isString(source) || "length" in source;
}

function getLength(source){
    if(isFunction(source.length)) return source.length();
    else return source.length;
}

/**
 * Get an array, string, iterable, or object as a sequence.
 * If it receives a sequences as input, returns that sequence.
 * For all other inputs an error is thrown.
 * TODO: Perhaps strings shouldn't be automatically converted to sequences?
 * @param {*} source
 */
function asSequence(source){
    if(isSequence(source)){
        return source;
    }else if(isArray(source)){
        return new hi.ArraySequence(source);
    }else if(isString(source)){
        return new hi.StringSequence(source);
    }else if(isIterable(source)){
        return new hi.IterableSequence(source);
    }else if(isObject(source)){
        return new hi.ObjectSequence(source);
    }else{
        throw (
            "Value is not valid as a sequence. Only arrays, strings, " +
            "iterables, and objects can be made into sequences."
        );
    }
}

/**
 * Get a sequence for enumerating the elements of an array.
 * Optionally accepts an inclusive start index and an exclusive end index.
 * When start and end indexes aren't given, the sequence enumerates the
 * entire contents of the array.
 * @param {*} source
 * @param {*} low
 * @param {*} high
 */
function ArraySequence(source, low, high){
    this.source = source;
    this.lowIndex = isNaN(low) ? 0 : low;
    this.highIndex = isNaN(high) ? source.length : high;
    this.frontIndex = this.lowIndex;
    this.backIndex = this.highIndex;
}

ArraySequence.prototype = Object.create(Sequence.prototype);
ArraySequence.prototype.constructor = ArraySequence;
Object.assign(ArraySequence.prototype, {
    array: function(limit){
        if(limit <= 0){
            return [];
        }else if(this.lowIndex !== 0){
            if(!limit){
                return this.source.slice(this.lowIndex, this.highIndex);
            }else{
                const length = this.source.length - this.lowIndex;
                return this.source.slice(this.lowIndex, this.lowIndex + (
                    limit < length ? limit : length
                ));
            }
        }else if(!limit || limit >= this.source.length){
            return this.source;
        }else{
            return this.source.slice(limit);
        }
    },
    arrayAsync: function(limit){
        return new hi.Promise((resolve, reject) => resolve(this.array(limit)));
    },
    newArray: function(limit){
        if(limit <= 0){
            return [];
        }else if(!limit || limit >= this.source.length){
            return this.source.slice();
        }else{
            return this.source.slice(limit);
        }
    },
    newArrayAsync: function(limit){
        return new hi.Promise((resolve, reject) => resolve(this.newArray(limit)));
    },
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
        return new ArraySequence(
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
        const copy = new ArraySequence(this.source, this.lowIndex, this.highIndex);
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

/**
 * Get a sequence for enumerating the characters in a string.
 * Optionally accepts an inclusive start index and an exclusive end index.
 * When start and end indexes aren't given, the sequence enumerates the
 * entire contents of the string.
 * @param {*} source
 * @param {*} low
 * @param {*} high
 */
function StringSequence(source, low, high){
    this.source = source;
    this.lowIndex = isNaN(low) ? 0 : low;
    this.highIndex = isNaN(high) ? source.length : high;
    this.frontIndex = this.lowIndex;
    this.backIndex = this.highIndex;
}

StringSequence.prototype = Object.create(Sequence.prototype);
StringSequence.prototype.constructor = StringSequence;
Object.assign(StringSequence.prototype, {
    string: function(){
        if(this.lowIndex === 0 && this.highIndex === this.source.length){
            return this.source;
        }else{
            return this.source.slice(this.lowIndex, this.highIndex);
        }
    },
    stringAsync: function(){
        return new hi.Promise((resolve, reject) => resolve(this.string()));
    },
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
        return new StringSequence(
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
        const copy = new StringSequence(this.source, this.lowIndex, this.highIndex);
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

/**
 * Get a sequence that enumerates the key, value pairs of an arbitrary object.
 * Optionally accepts an array of keys indicating which keys of the object
 * should be enumerated. When not explicitly provided, the sequence enumerates
 * key, value pairs for all of the object's own keys.
 * @param {*} source
 * @param {*} keys
 */
function ObjectSequence(source, keys){
    this.source = source;
    this.keys = keys || Object.keys(source);
    this.keyIndex = 0;
}

ObjectSequence.prototype = Object.create(Sequence.prototype);
ObjectSequence.prototype.constructor = ObjectSequence;
Object.assign(ObjectSequence.prototype, {
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
        const key = this.keys[this.keyIndex];
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
        const copy = new ObjectSequence(this.source, this.keys);
        copy.keyIndex = this.keyIndex;
        return copy;
    },
    reset: function(){
        this.keyIndex = 0;
        return this;
    },
});

/**
 * Get a sequence that enumerates the items of an iterable.
 * An iterable is anything with a "next" method returning an object with two
 * attributes, "done" being a boolean indicating when the iterator has been
 * fully consumed and "value" being the current element of the iterator.
 * @param {*} source
 */
function IterableSequence(source){
    this.source = source;
    this.item = source.next();
}

IterableSequence.prototype = Object.create(Sequence.prototype);
IterableSequence.prototype.constructor = IterableSequence;
Object.assign(IterableSequence.prototype, {
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

export {
    validAsSequence,
    validAsBoundedSequence,
    canGetLength,
    getLength,
    asSequence,
    ArraySequence,
    StringSequence,
    ObjectSequence,
    IterableSequence,
};
