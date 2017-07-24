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
    summary: "Throw an @AssertError when a condition isn't met.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind to act as a condition,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns its first argument.
        `),
        throws: (`
            The function throws an @AssertError when the given condition was
            falsey.
            If a second argument was provided, then that string will be
            included in the message attached to the thrown error object.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet",
        ],
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
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assert(100 === 100);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assert(100 === 9999);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertNot = lightWrap({
    summary: "Throw an @AssertError when a value is truthy.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind to act as a condition,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns its first argument.
        `),
        throws: (`
            The function throws an @AssertError when the given condition was
            truthy.
            If a second argument was provided, then that string will be
            included in the message attached to the thrown error object.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet",
        ],
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
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertNot(100 === 9999);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNot(100 === 100);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertUndefined = lightWrap({
    summary: "Throw an @AssertError if a value is not @undefined.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns @undefined.
        `),
        throws: (`
            The function throws an @AssertError when the first argument was
            not @undefined.
            If a second argument was provided, then that string will be
            included in the message attached to the thrown error object.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet",
        ],
        related: [
            "assertNull", "assertNil",
        ],
    },
    implementation: function assertUndefined(value, message = undefined){
        if(value !== undefined) throw AssertError(
            message || "Value must be undefined.", value
        );
        return undefined;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertUndefined(undefined);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertUndefined("defined!");
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "nullInput": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertUndefined(null);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertNull = lightWrap({
    summary: "Throw an @AssertError if a value is not @null.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns @null.
        `),
        throws: (`
            The function throws an @AssertError when the first argument was
            not @null.
            If a second argument was provided, then that string will be
            included in the message attached to the thrown error object.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet",
        ],
        related: [
            "assertUndefined", "assertNil",
        ],
    },
    implementation: function assertNull(value, message = undefined){
        if(value !== null) throw AssertError(
            message || "Value must be null.", value
        );
        return null;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertNull(null);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNull(5000);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "undefinedInput": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNull(undefined);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertNil = lightWrap({
    summary: "Throw an @AssertError if a value is not @null or @undefined.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns its first argument.
        `),
        throws: (`
            The function throws an @AssertError when the first argument was
            not either @null or @undefined.
            If a second argument was provided, then that string will be
            included in the message attached to the thrown error object.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet",
        ],
        related: [
            "assertUndefined", "assertNull",
        ],
    },
    implementation: function assertNil(value, message = undefined){
        if(value !== null && value !== undefined) throw AssertError(
            message || "Value must be null or undefined.", value
        );
        return value;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertNil(null);
            hi.assertNil(undefined);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNil("some string");
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "falseyInput": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNil(false);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertNaN = lightWrap({
    summary: "Throw an @AssertError if a value is not @NaN.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns its first argument.
        `),
        throws: (`
            The function throws an @AssertError when the first argument was
            not @NaN.
            The function does not throw any error when the first argument was
            a non-numeric value such as a string or @null. It throws an error
            only when the input was literally @NaN.
            If a second argument was provided, then that string will be
            included in the message attached to the thrown error object.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet", "stringInput",
        ],
        links: [
            {
                description: "EMCAScript 2018 specification's definition of NaN.",
                url: "https://tc39.github.io/ecma262/#sec-isnan-number",
            },
        ],
    },
    implementation: function assertNaN(value, message = undefined){
        if(!isNaN(value)) throw AssertError(
            message || "Value must be NaN.", value
        );
        return value;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertNaN(NaN);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNaN(12345);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "stringInput": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNaN("not a numeric value, but not literally NaN either");
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertEqual = lightWrap({
    summary: "Throw an @AssertError if the inputs aren't all equal.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects any number of arguments of any kind.
        `),
        returns: (`
            The function returns its first argument, or @undefined when the
            function was called without arguments.
        `),
        throws: (`
            The function throws an @AssertError when the arguments were not
            judged to be deeply equal according to the @isEqual function.
        `),
        examples: [
            "basicUsageMet", "sequenceInput", "objectInput", "basicUsageUnmet",
        ],
        related: [
            "assertNotEqual",
        ],
    },
    implementation: function assertEqual(...values){
        if(values.length === 0) return undefined;
        if(!isEqual(...values)) throw AssertError(
            "Values must be equal.", values
        );
        return values[0];
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertEqual(1, 1);
            hi.assertEqual("abc", "abc");
        },
        "sequenceInput": hi => {
            const square = i => i * i;
            hi.assertEqual(hi.map(square, [1, 2, 3, 4]), [1, 4, 9, 16]);
        },
        "objectInput": hi => {
            const a = {"hello": 1, "world": 2};
            const b = {"hello": 1, "world": 2};
            hi.assertEqual(a, b);
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertEqual("different", "strings");
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "noInputs": hi => {
            // Don't throw an error
            const result = hi.assertEqual();
            // And return undefined
            hi.assertUndefined(result);
        },
        "oneInput": hi => {
            // Don't throw an error
            const result = hi.assertEqual(100);
            // And return the first argument
            hi.assert(result === 100);
        },
    },
});

export const assertNotEqual = lightWrap({
    summary: "Throw an @AssertError if the inputs are all equal.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects any number of arguments of any kind.
        `),
        returns: (`
            The function returns its first argument, or @undefined when the
            function was called without arguments.
        `),
        throws: (`
            The function throws an @AssertError when the arguments were all
            judged to be deeply equal according to the @isEqual function.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmet",
        ],
        related: [
            "assertEqual",
        ],
    },
    implementation: function assertNotEqual(...values){
        if(values.length === 0) return undefined;
        if(isEqual(...values)) throw AssertError(
            "Values must not be equal.", values
        );
        return values;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertNotEqual(500, 10000);
            hi.assertNotEqual("abcdef", "uvwxyz");
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertNotEqual(1, 1);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export const assertEmpty = lightWrap({
    summary: "Throw an @AssertError if a value isn't an empty sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any kind,
            and an optional second string argument providing human-readable
            information about the condition being asserted.
        `),
        returns: (`
            The function returns its first argument.
        `),
        throws: (`
            The function throws an @AssertError when the first argument either
            was not a sequence, or was a sequence but was not empty.
        `),
        developers: (`
            An inpt sequence is considered to be empty when its "done" method
            returns a truthy value, when it either has a length of zero or an
            unknown length, and when it either has zero elements left or an
            unknown number of elements left.
        `),
        examples: [
            "basicUsageMet", "filterSequenceInput", "basicUsageUnmet",
        ],
        related: [
            "assertEqual",
        ],
    },
    implementation: function assertEmpty(source, message = undefined){
        const sequence = asSequence(source);
        if(sequence && sequence.done() &&
            (!sequence.length || sequence.length() === 0) &&
            (!sequence.left || sequence.left() === 0)
        ) return source;
        throw AssertError(message || "Value must be an empty sequence.", source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertEmpty([]);
            hi.assertEmpty("");
        },
        "filterSequenceInput": hi => {
            const even = i => (i % 2 === 0);
            hi.assertEmpty(hi.filter(even, [1, 3, 5, 9, 111, 333]));
        },
        "basicUsageUnmet": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError.
                hi.assertEmpty([1, 2, 3, 4]);
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
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
        examples: [
            "basicUsageMet", "basicUsageUnmetNoError", "basicUsageUnmetPredicate",
        ],
        related: [
            "assertFailWith",
        ],
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
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertFail(
                (error) => (error.message = "HELLO"),
                () => {throw new Error("HELLO");}
            );
        },
        "basicUsageUnmetNoError": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError because the callback does not throw an error.
                hi.assertFail(
                    (error) => true,
                    () => {let x = "Not throwing any errors!";}
                );
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "basicUsageUnmetPredicate": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError because the thrown error doesn't satisfy the predicate.
                hi.assertFail(
                    (error) => (error.message === "nope"),
                    () => {throw new Error("Won't satisfy the predicate.")}
                );
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
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
            the error is not of the correct type, i.e. its "type" attribute
            does not match the type string if a string was passed, or does not
            match the error type if an error type was passed.
        `),
        examples: [
            "basicUsageMet", "basicUsageUnmetNoError", "basicUsageUnmetType",
        ],
        related: [
            "assertFailWith",
        ],
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
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageMet": hi => {
            hi.assertFailWith(hi.error.NotBoundedError, () => {
                // Get an unbounded sequence
                const seq = hi.counter();
                // Throws a NotBoundedError because the sequence isn't bounded
                hi.error.NotBoundedError.enforce(seq);
            });
        },
        "basicUsageUnmetNoError": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError because the callback does not throw an error.
                hi.assertFailWith(hi.error.NotBoundedError, () => {
                    let x = "Not throwing any errors!";
                });
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
        "basicUsageUnmetType": hi => {
            let caught = undefined;
            try{
                // Throws an AssertError because the thrown error isn't the right type.
                hi.assertFailWith(hi.error.NotBoundedError, () => {
                    throw new Error("Not a NotBoundedError");
                });
            }catch(error){
                caught = error;
            }
            if(!caught){ // Won't happen, because caught now holds an AssertError.
                throw new Error();
            }
        },
    },
});

export default assert;
