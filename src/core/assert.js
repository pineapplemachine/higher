import {asSequence} from "./asSequence";
import {error} from "./error";
import {isEqual} from "./isEqual";
import {isSequence} from "./sequence";
import {isArray, isFunction, isUndefined} from "./types";

import {equals} from "../functions/equals";

const assertMessage = (message, value) => (isFunction(message) ?
    message(value) : (message || "Assertion error.")
);

export const AssertError = error({
    url: "", // TODO
    constructor: function(message, value = undefined){
        this.message = message;
        this.value = value;
    },
});

// Throw an error if the condition isn't met.
export const assert = function(condition, message = undefined){
    if(!condition) throw AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

// Throw an error if the condition is met.
export const assertNot = function(condition, message = undefined){
    if(condition) throw AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

// Throw an error if the input value isn't undefined.
export const assertUndefined = function(value, message = undefined){
    if(!isUndefined(value)) throw AssertError(
        assertMessage(message || "Value must be undefined.", value), value
    );
    return value;
};

export const assertNaN = function(value, message = undefined){
    // EMCA spec says value !== value is true if and only if value is NaN.
    // https://tc39.github.io/ecma262/#sec-isnan-number
    if(value === value) throw AssertError(
        assertMessage(message || "Value must be NaN.", value), value
    );
    return value;
};

// Throw an error if all the given values aren't equal.
export const assertEqual = function(...values){
    if(values.length === 0) return undefined;
    if(!isEqual(...values)) throw AssertError(
        "Values must be equal.", values
    );
    return values;
};

export const assertNotEqual = function(...values){
    if(values.length === 0) return undefined;
    if(isEqual(...values)) throw AssertError(
        "Values must not be equal.", values
    );
    return values;
};

export const assertEmpty = function(source, message = undefined){
    const sequence = asSequence(source);
    if(sequence.done() &&
        (!sequence.length || sequence.length() === 0) &&
        (!sequence.left || sequence.left() === 0)
    ) return source;
    throw AssertError(
        assertMessage(message || "Sequence must be empty.", source), source
    );
};

export const assertFail = function(predicate, callback){
    try{
        callback();
    }catch(error){
        if(predicate(error)) return error;
        throw AssertError(
            "Function must throw an error satisfying the predicate.", callback
        );
    }
    throw AssertError("Function must throw an error.", callback);
};

export default assert;
