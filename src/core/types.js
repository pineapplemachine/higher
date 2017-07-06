export const isUndefined = (value) => {
    return value === undefined;
};

export const isNumber = (value) => {
    return !isNaN(value);
};

export const isString = (value) => {
    return value instanceof String || typeof value === "string";
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
    return isFunction(value[Symbol.iterator]);
};

export default {
    isUndefined,
    isNumber,
    isString,
    isArray,
    isObject,
    isFunction,
    isIterable
};
