import {isFunction, isUndefined} from "../core/types";

const assertMessage = (message, value) => (isFunction(message) ?
    message(value) : (message || "Assertion error")
);

export const AssertError = function(message, value = undefined){
    this.message = message;
    this.value = value;
};

AssertError.prototype = Object.create(Error.prototype);
AssertError.prototype.constructor = AssertError;

export const assert = function(condition, message = undefined){
    if(!condition) throw new AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

export const assertNot = function(condition, message = undefined){
    if(condition) throw new AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

export const assertUndefined = function(value, message = undefined){
    if(!isUndefined(value)) throw new AssertError(
        assertMessage(message, value), value
    );
    return value;
};

export const assertEqual = function(...values){
    for(let i = 1; i < values.length; i++){
        if(values[i] !== values[0]) throw new AssertError(
            "Values must be equal.", values
        );
    }
    return values[0];
};

export default assert;
