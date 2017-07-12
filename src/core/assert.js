import {asSequence} from "./asSequence";
import {error} from "./error";
import {isSequence} from "./sequence";
import {isArray, isFunction, isUndefined} from "./types";

import {equals} from "../functions/equals";

const assertMessage = (message, value) => (isFunction(message) ?
    message(value) : (message || "Assertion error")
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
        assertMessage(message, value), value
    );
    return value;
};

// Throw an error if all the given values aren't equal.
export const assertEqual = function(...values){
    for(let i = 1; i < values.length; i++){
        if(values[i] !== values[0]) throw AssertError(
            "Values must be equal.", values
        );
    }
    return values[0];
};

// Throw an error if the elements of two sequences aren't equal.
// Compares elements recursively, i.e. if the inputs are sequences of sequences
// then those corresponding contained sequences are checked for equality, too.
export const assertSeqEqual = function(sequenceA, sequenceB){
    const compare = (a, b) => {
        if(isSequence(a) || isSequence(b) || isArray(a) || isArray(b)){
            return equals.implementation(compare, [
                asSequence(a), asSequence(b)
            ]);
        }else{
            return a === b;
        }
    };
    if(!compare(sequenceA, sequenceB)) throw AssertError(
        "Sequences must be equal.", [sequenceA, sequenceB]
    );
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
