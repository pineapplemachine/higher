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
        return typeof(value) === "boolean" || value instanceof Boolean;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isBoolean(true));
            hi.assert(hi.isBoolean(false));
            hi.assertNot(hi.isBoolean(1));
            hi.assertNot(hi.isBoolean(null));
        },
        "newBooleanInput": hi => {
            hi.assert(hi.isBoolean(new Boolean(true)));
            hi.assert(hi.isBoolean(new Boolean(false)));
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
            including #NaN, and it returns false otherwise.
        `),
        related: [
            "isInteger", "isNaN",
        ],
        examples: [
            "basicUsage",
        ],
    },
    implementation: function isNumber(value){
        return typeof(value) === "number" || value instanceof Number;
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
        "newNumberInput": hi => {
            hi.assert(hi.isNumber(new Number(2)));
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
        return typeof(value) === "string" || value instanceof String;
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
        "newStringInput": hi => {
            hi.assert(hi.isString(new String("hello")));
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

export const isSymbol = lightWrap({
    summary: "Get whether an input is a symbol primitive.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was a symbol and
            false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
        links: {
            "description": "Exploring ES6 chapter regarding symbols",
            "url": "http://exploringjs.com/es6/ch_symbols.html"
        },
    },
    implementation: function isSymbol(value){
        return typeof(value) === "symbol";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isSymbol(Symbol.iterator));
            hi.assert(hi.isSymbol(Symbol("hello!")));
        },
        "nilInputs": hi => {
            hi.assertNot(hi.isSymbol(null));
            hi.assertNot(hi.isSymbol(undefined));
        },
        "stringInputs": hi => {
            hi.assertNot(hi.isSymbol(""));
            hi.assertNot(hi.isSymbol("xyz"));
        },
    },
});

export const isPrimitive = lightWrap({
    summary: "Get whether an input is a primitive value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether an input is a primitive value.
            Numbers, smybols, booleans, strings, #null, and #undefined are all
            primitive values.
        `),
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was a primitive value
            and false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
        links: {
            "description": "JavaScript data types and data structures",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Primitive_values"
        },
    },
    implementation: function isPrimitive(value){
        if(
            value === null || value === undefined || value instanceof Boolean ||
            value instanceof Number || value instanceof String
        ){
            return true;
        }
        const type = typeof(value);
        return type === "boolean" || type === "number" || type === "string" || type === "symbol";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isPrimitive(null));
            hi.assert(hi.isPrimitive(true));
            hi.assert(hi.isPrimitive(1000));
            hi.assertNot(hi.isPrimitive([1, 2, 3]));
            hi.assertNot(hi.isPrimitive({hello: "world"}));
        },
        "undefinedInput": hi => {
            hi.assert(hi.isPrimitive(undefined));
        },
        "booleanInputs": hi => {
            hi.assert(hi.isPrimitive(true));
            hi.assert(hi.isPrimitive(false));
        },
        "numericInputs": hi => {
            hi.assert(hi.isPrimitive(0));
            hi.assert(hi.isPrimitive(+1));
            hi.assert(hi.isPrimitive(-1));
            hi.assert(hi.isPrimitive(2.5));
            hi.assert(hi.isPrimitive(+Infinity));
            hi.assert(hi.isPrimitive(-Infinity));
            hi.assert(hi.isPrimitive(NaN));
        },
        "symbolInputs": hi => {
            hi.assert(hi.isPrimitive(Symbol.iterator));
            hi.assert(hi.isPrimitive(Symbol.replace));
        },
        "functionInputs": hi => {
            hi.assertNot(hi.isPrimitive(i => i));
            hi.assertNot(hi.isPrimitive(hi.identity));
            hi.assertNot(hi.isPrimitive(hi.range));
        },
        "newPrimitiveInput": hi => {
            hi.assert(hi.isPrimitive(new Boolean(true)));
            hi.assert(hi.isPrimitive(new Number(1)));
        },
    },
});

export const isObject = lightWrap({
    summary: "Get whether an input is any object.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether the input is any object, that is, any value that is
            not a [primitive](isPrimitive).
        `),
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was any object and
            false otherwise.
        `),
        examples: [
            "basicUsage", "basicUsageArray", "basicUsageFunction",
        ],
        links: {
            "description": "JavaScript data types and data structures",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Primitive_values"
        },
    },
    implementation: function isObject(value){
        if(
            value === null || value === undefined || value instanceof Boolean ||
            value instanceof Number || value instanceof String
        ){
            return false;
        }
        const type = typeof(value);
        return type !== "boolean" && type !== "number" && type !== "string" && type !== "symbol";
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isObject({x: 0, y: 1}));
        },
        "basicUsageArray": hi => {
            hi.assert(hi.isObject([1, 2, 3, 4, 5]));
        },
        "basicUsageFunction": hi => {
            const square = i => i * i;
            hi.assert(hi.isObject(square));
        },
        "emptyObjectInput": hi => {
            hi.assert(hi.isObject({}));
        },
        "arrayInput": hi => {
            hi.assert(hi.isObject([]));
            hi.assert(hi.isObject([1, 2, 3]));
        },
        "functionInput": hi => {
            hi.assert(hi.isObject(i => i));
            hi.assert(hi.isObject(hi.identity));
            hi.assert(hi.isObject(hi.range));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isObject(null));
            hi.assertNot(hi.isObject(undefined));
        },
        "newPrimitiveInput": hi => {
            hi.assertNot(hi.isObject(new Boolean(true)));
            hi.assertNot(hi.isObject(new Number(1)));
        },
    },
});

export const isPlainObject = lightWrap({
    summary: "Get whether an input is a plain object.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether the input is an object, that is, any value that inherits
            the @Object prototype or that does not have any prototype.
        `),
        expects: (`
            The function expects a single argument of any type as input.
        `),
        returns: (`
            The function returns true when the input value was a plain object and
            false otherwise.
        `),
        examples: [
            "basicUsage"
        ],
    },
    implementation: function isPlainObject(value){
        if(!value) return false;
        const prototype = Object.getPrototypeOf(value);
        return !prototype || prototype.constructor === Object;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.isPlainObject({x: 0, y: 1}));
        },
        "basicUsageArray": hi => {
            hi.assertNot(hi.isPlainObject([1, 2, 3, 4, 5]));
        },
        "basicUsageFunction": hi => {
            const square = i => i * i;
            hi.assertNot(hi.isPlainObject(square));
        },
        "emptyObjectInput": hi => {
            hi.assert(hi.isPlainObject({}));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isPlainObject(null));
            hi.assertNot(hi.isPlainObject(undefined));
        },
        "primitiveInputs": hi => {
            hi.assertNot(hi.isPlainObject(0));
            hi.assertNot(hi.isPlainObject(10));
            hi.assertNot(hi.isPlainObject(true));
            hi.assertNot(hi.isPlainObject("hello"));
        },
        "newPrimitiveInput": hi => {
            hi.assertNot(hi.isPlainObject(new Boolean(true)));
            hi.assertNot(hi.isPlainObject(new Number(1)));
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
