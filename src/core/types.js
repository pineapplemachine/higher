// True when the input is a number.
function isNumber(value){
    return !isNaN(value);
}
// True when the input is a string.
function isString(value){
    return value instanceof String || typeof value === "string";
}
// True when the input is an array.
function isArray(value){
    return value instanceof Array;
}
// True when the input is an object.
function isObject(value){
    return Object.prototype.toString.call(value) === "[object Object]";
}
// True when the input is callable.
function isFunction(value){
    return value instanceof Function;
}
// True when the input is an iterable.
function isIterable(value){
    return isFunction(value[Symbol.iterator]);
}
// True when the input is a sequence.
function isSequence(value){
    return isIterable(value) && (
        isFunction(value.front) &&
        isFunction(value.popFront) &&
        isFunction(value.nextFront) &&
        isFunction(value.consume) &&
        isFunction(value.done) &&
        isFunction(value.array) &&
        isFunction(value.object)
    );
}
