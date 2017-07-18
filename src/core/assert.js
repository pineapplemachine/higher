import {asSequence} from "./asSequence";
import {error} from "./error";
import {isEqual} from "./isEqual";
import {lightWrap} from "./lightWrap";
import {isSequence} from "./sequence";
import {isArray, isFunction, isNaN, isString} from "./types";

export const AssertError = error({
    summary: "An assertion failed.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects a message string and an optional value
            to attach to the produced error object; the value object should
            indicate what argument or arguments were passed such that the
            assertion was made to fail.
        `),
    },
    constructor: function(message, value = undefined){
        this.message = message ? "Assertion error: " + message : "Assertion error.";
        this.value = value;
    },
});

export const assert = lightWrap({
    summary: "Throw an @AssertError if a condition isn't met.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        related: [
            "assertNot"
        ],
    },
    implementation: function assert(condition, message = undefined){
        if(!condition) throw AssertError(
            message, condition
        );
        return condition;
    },
});

export const assertNot = lightWrap({
    summary: "Throw an @AssertError if a value is truthy.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        related: [
            "assert"
        ],
    },
    implementation: function assertNot(condition, message = undefined){
        if(condition) throw AssertError(
            message, condition
        );
        return condition;
    },
});

export const assertUndefined = lightWrap({
    summary: "Throw an @AssertError if a value is not `undefined`.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function assertUndefined(value, message = undefined){
        if(value !== undefined) throw AssertError(
            message || "Value must be undefined.", value
        );
        return undefined;
    },
});

export const assertNaN = lightWrap({
    summary: "Throw an @AssertError if a value is not `NaN`.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function assertNaN(value, message = undefined){
        if(!isNaN(value)) throw AssertError(
            message || "Value must be NaN.", value
        );
        return value;
    },
});

export const assertEqual = lightWrap({
    summary: "Throw an @AssertError if the inputs aren't all equal.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        related: [
            "assertNotEqual"
        ],
    },
    implementation: function assertEqual(...values){
        if(values.length === 0) return undefined;
        if(!isEqual(...values)) throw AssertError(
            "Values must be equal.", values
        );
        return values;
    },
});

export const assertNotEqual = lightWrap({
    summary: "Throw an @AssertError if the inputs are all equal.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        related: [
            "assertEqual"
        ],
    },
    implementation: function assertNotEqual(...values){
        if(values.length === 0) return undefined;
        if(isEqual(...values)) throw AssertError(
            "Values must not be equal.", values
        );
        return values;
    },
});

export const assertEmpty = lightWrap({
    summary: "Throw an @AssertError if a value isn't an empty sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function assertEmpty(source){
        const sequence = asSequence(source);
        if(sequence && sequence.done() &&
            (!sequence.length || sequence.length() === 0) &&
            (!sequence.left || sequence.left() === 0)
        ) return source;
        throw AssertError("Value must be an empty sequence.", source);
    },
});

export const assertFail = lightWrap({
    summary: "Throw an @AssertError if a callback doesn't throw an error satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects two functions as input, a predicate and a
            callback.
        `),
        returns: (`
            The function returns the error that was thrown by the callback.
            The function always produces an @AssertError if the callback didn't
            throw an error.
        `),
        throws: (`
            Throws an @AssertError when either the callback does not itself
            throw an error when invoked or the callback does throw an error but
            the error object does not satisfy the given predicate.
        `),
    },
    implementation: function assertFail(predicate, callback){
        try{
            callback();
        }catch(error){
            if(predicate(error)) return error;
        }
        throw AssertError(
            "Function must throw an error satisfying the predicate.", callback
        );
    },
});

export const assertFailWith = lightWrap({
    summary: "Throw an @AssertError if a callback doesn't throw an error of a given type.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a higher error type or a string as its first
            argument and a callback function as its second argument.
        `),
        returns: (`
            The function returns the error that was thrown by the callback.
            The function always produces an @AssertError if the callback didn't
            throw an error.
        `),
        throws: (`
            Throws an @AssertError when either the callback does not itself
            throw an error when invoked or the callback does throw an error but
            the error is not of the correct type, i.e. its \`type\` attribute
            does not match the type string if a string was passed, or does not
            match the error type if an error type was passed.
        `),
    },
    implementation: function assertFailWith(errorType, callback){
        const type = isString(errorType) ? errorType : errorType.type;
        try{
            callback();
        }catch(error){
            if(error.type === type) return error;
        }
        throw AssertError(
            `Function must throw an error of type "${type}".`, callback
        );
    },
});

export default assert;
