// True when the input is undefined.
/**
 * Checks if the input is undefined.
 * @param {*} The value to check
 * @returns {Boolean} Whether or not the `value` is `undefined`.
 */
hi.isUndefined = function(value){
    return typeof (value) === "undefined";
};

/**
 * Checks if the `value` is a valid `Number` instance.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is a `Number`.
 */
hi.isNumber = function(value){
    return !isNaN(value);
};

/**
 * Checks whether or not the `value` is a `String`.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is a string.
 */
function isString(value){
    return value instanceof String || typeof value === "string";
}

/**
 * Checks whether or not the `value` is an array.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is an array.
 */
function isArray(value){
    return value instanceof Array;
}

/**
 * Checks whether or not the `value` is an `Object`.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is an object.
 */
function isObject(value){
    return Object.prototype.toString.call(value) === "[object Object]";
}

/**
 * Checks if `value` is a function/callable.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is a function.
 */
function isFunction(value){
    return value instanceof Function;
}

/**
 * Checks if `value` is an `Iterable`.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is an iterable.
 */
function isIterable(value){
    return isFunction(value[Symbol.iterator]);
}

/**
 * Checks to see if the input `value` is a `sequence`.
 * @param {*} value The value to check
 * @returns {Boolean} Whether or not the `value` is a `sequence`.
 */
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

export default {isNumber, isString, isArray, isObject, isFunction, isIterable, isSequence};
