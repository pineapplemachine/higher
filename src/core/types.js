export const isUndefined = (value) => {
    return value === undefined;
};

export const isBoolean = (value) => {
    return value instanceof Boolean;
};

export const isNumber = (value) => {
    return value.constructor === Number;
};

export const isInteger = (value) => {
    return Number.isInteger(value);
};

export const isString = (value) => {
    return value.constructor === String;
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
    isBoolean,
    isNumber,
    isString,
    isArray,
    isObject,
    isFunction,
    isIterable
};
