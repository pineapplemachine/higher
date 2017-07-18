import {lightWrap} from "./lightWrap";

export const isUndefined = lightWrap({
    summary: "Get whether an input is undefined.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was \`undefined\`
            and false otherwise.
        `),
        related: [
            "isNull", "isNil"
        ],
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isUndefined(value){
        return value === undefined;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isUndefined(undefined));
            hi.assertNot(hi.isUndefined(null));
            hi.assertNot(hi.isUndefined(0));
        },
    },
});

export const isNull = lightWrap({
    summary: "Get whether an input is null.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was \`null\`
            and false otherwise.
        `),
        related: [
            "isUndefined", "isNil"
        ],
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isNull(value){
        return value === null;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isNull(null));
            hi.assertNot(hi.isNull(0));
            hi.assertNot(hi.isNull(undefined));
        },
    },
});

export const isNil = lightWrap({
    summary: "Get whether an input is either null or undefined.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was either \`null\`
            or \`undefined\` and false otherwise.
        `),
        related: [
            "isUndefined", "isNull"
        ],
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isNil(value){
        return value === undefined || value === null;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isNil(null));
            hi.assert(hi.isNil(undefined));
            hi.assertNot(hi.isNil(0));
            hi.assertNot(hi.isNil(false));
        },
    },
});

export const isBoolean = lightWrap({
    summary: "Get whether an input is a boolean.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was either \`true\`
            or \`false\` and false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isBoolean(value){
        return typeof(value) === "boolean";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isBoolean(true));
            hi.assert(hi.isBoolean(false));
            hi.assertNot(hi.isBoolean(1));
            hi.assertNot(hi.isBoolean(null));
        },
    },
});

export const isNumber = lightWrap({
    summary: "Get whether an input is a number.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was any number,
            including \`NaN\`, and it returns false otherwise.
        `),
        related: [
            "isInteger", "isNaN",
        ],
        examples: [
            "basicUsage",
        ],
    },
    implementation: function isNumber(value){
        return typeof(value) === "number";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isNumber(0));
            hi.assert(hi.isNumber(1));
            hi.assert(hi.isNumber(NaN));
            hi.assert(hi.isNumber(Infinity));
            hi.assertNot(hi.isNumber(null));
            hi.assertNot(hi.isNumber("1234"));
        },
        "undefinedInput": hi => {
            hi.assertNot(hi.isNumber(undefined));
        },
        "arrayInput": hi => {
            hi.assertNot(hi.isNumber([]));
            hi.assertNot(hi.isNumber([1]));
            hi.assertNot(hi.isNumber([0, 1, 2]));
        },
    },
});

export const isInteger = lightWrap({
    summary: "Get whether an input is an integer.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was both a
            number and an integer. It returns false otherwise.
        `),
        related: [
            "isNumber", "isNaN",
        ],
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isInteger(value){
        return Number.isInteger(value);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isInteger(0));
            hi.assert(hi.isInteger(1));
            hi.assertNot(hi.isInteger(0.5));
            hi.assertNot(hi.isInteger(NaN));
            hi.assertNot(hi.isInteger("1234"));
        },
        "undefinedInput": hi => {
            hi.assertNot(hi.isInteger(undefined));
        },
        "arrayInput": hi => {
            hi.assertNot(hi.isInteger([]));
            hi.assertNot(hi.isInteger([1]));
            hi.assertNot(hi.isInteger([0, 1, 2]));
        },
    },
});

export const isNaN = lightWrap({
    summary: "Get whether an input is NaN.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was \`NaN\` and
            false otherwise.
        `),
        related: [
            "isInteger", "isNaN",
        ],
        examples: [
            "basicUsage",
        ],
        links: [
            {
                description: "EMCAScript 2018 specification's definition of NaN.",
                url: "https://tc39.github.io/ecma262/#sec-isnan-number",
            },
        ],
    },
    implementation: function isNaN(value){
        // EMCA spec says value !== value is true if and only if value is NaN.
        return value !== value;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isNaN(NaN));
            hi.assertNot(hi.isNaN(1));
            hi.assertNot(hi.isNaN(Infinity));
            hi.assertNot(hi.isNaN("some string"));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isNaN(null));
            hi.assertNot(hi.isNaN(undefined));
        },
    },
});

export const isString = lightWrap({
    summary: "Get whether an input is a string.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was a string and
            false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isString(value){
        return typeof(value) === "string";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isString("hello"));
            hi.assert(hi.isString("how are you"));
            hi.assertNot(hi.isString(1));
            hi.assertNot(hi.isString(null));
        },
        "emptyInput": hi => {
            hi.assert(hi.isString(""));
        },
        "undefinedInput": hi => {
            hi.assertNot(hi.isString(undefined));
        },
    },
});

export const isArray = lightWrap({
    summary: "Get whether an input is an array.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was an array and
            false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isArray(value){
        return value instanceof Array;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isArray([0, 1, 2, 3]));
        },
        "emptyInput": hi => {
            hi.assert(hi.isArray([]));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isArray(null));
            hi.assertNot(hi.isArray(undefined));
        },
    },
});

export const isObject = lightWrap({
    summary: "Get whether an input is an object.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was an object and
            false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isObject(value){
        return Object.prototype.toString.call(value) === "[object Object]";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isObject({x: 0, y: 1}));
        },
        "emptyInput": hi => {
            hi.assert(hi.isObject({}));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isObject(null));
            hi.assertNot(hi.isObject(undefined));
        },
    },
});

export const isIterable = lightWrap({
    summary: "Get whether an input is an iterable.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was a iterable and
            false otherwise. An iterable is any value for which a statement
            like \`for(element of iterable)\` is valid.
        `),
        examples: [
            "basicUsage", "generatorInput"
        ],
    },
    implementation: function isIterable(value){
        return (
            value !== undefined && value !== null &&
            isFunction(value[Symbol.iterator])
        );
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isIterable([1, 2, 3]));
        },
        "generatorInput": hi => {
            const countUp = function*(n){
                while(true) yield n++;
            };
            hi.assert(hi.isIterable(countUp(0)));
        },
        "stringInput": hi => {
            hi.assert(hi.isIterable(""));
            hi.assert(hi.isIterable("hello"));
        },
        "objectInput": hi => {
            hi.assertNot(hi.isIterable({}));
            hi.assertNot(hi.isIterable({x: 0, y: 1}));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isIterable(null));
            hi.assertNot(hi.isIterable(undefined));
        },
    },
});

export const isFunction = lightWrap({
    summary: "Get whether an input is a function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was a function and
            false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isFunction(value){
        return value instanceof Function;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isFunction(i => i));
            hi.assert(hi.isFunction(console.log));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isFunction(null));
            hi.assertNot(hi.isFunction(undefined));
        },
    },
});
