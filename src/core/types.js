// True when the input is a number.
hi.isNumber = function(value){
    return !isNaN(value);
}
// True when the input is a string.
hi.isString = function(value){
    return value instanceof String || typeof value === "string";
}
// True when the input is an array.
hi.isArray = function(value){
    return value instanceof Array;
}
// True when the input is an object.
hi.isObject = function(value){
    return Object.prototype.toString.call(value) === "[object Object]";
}
// True when the input is callable.
hi.isFunction = function(value){
    return value instanceof Function;
}
// True when the input is an iterable.
hi.isIterable = function(value){
    return hi.isFunction(value[Symbol.iterator]);
}
// True when the input is a sequence.
hi.isSequence = function(value){
    return hi.isIterable(value) && (
        hi.isFunction(value.front) &&
        hi.isFunction(value.popFront) &&
        hi.isFunction(value.nextFront) &&
        hi.isFunction(value.consume) &&
        hi.isFunction(value.done) &&
        hi.isFunction(value.array) &&
        hi.isFunction(value.object)
    );
}
