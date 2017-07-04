import {isFunction} from "../core/types";

const assertMessage = (message, condition) => (isFunction(message) ?
    message(condition) : (message || "Assertion error")
);

const AssertError = function(message, value = undefined){
    this.message = message;
    this.value = value;
};

AssertError.prototype = Object.create(Error.prototype);
AssertError.prototype.constructor = AssertError;

const assert = function(condition, message = undefined){
    if(!condition) throw new AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

const assertNot = function(condition, message = undefined){
    if(condition) throw new AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

const assertEqual = function(...values){
    for(let i = 1; i < values.length; i++){
        if(values[i] !== values[0]) throw new AssertError(
            "Values must be equal.", values
        );
    }
    return values[0];
};

export default {assert, assertNot, assertEqual};
