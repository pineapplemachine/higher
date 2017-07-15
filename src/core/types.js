export const isUndefined = (value) => {
    return value === undefined;
};

export const isBoolean = (value) => {
    return value instanceof Boolean;
};

export const isNumber = (value) => {
    return typeof(value) === "number";
};

export const isInteger = (value) => {
    return Number.isInteger(value);
};

export const isNaN = (value) => {
    // EMCA spec says value !== value is true if and only if value is NaN.
    // https://tc39.github.io/ecma262/#sec-isnan-number
    return value !== value;
};

export const isString = (value) => {
    return typeof(value) === "string";
};

export const isArray = (value) => {
    return value instanceof Array;
};

export const isObject = (value) => {
    return Object.prototype.toString.call(value) === "[object Object]";
};

export const isFunction = (value) => {
    return value instanceof Function;
};

export const isIterable = (value) => {
    return value && isFunction(value[Symbol.iterator]);
};

export default {
    isUndefined,
    isBoolean,
    isNumber,
    isInteger,
    isString,
    isArray,
    isObject,
    isFunction,
    isIterable
};
