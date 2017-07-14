// Document functions defined in the src/core/ directory or by the hi object.
// Every attribute assigned to the hi object in higher.js should be documented
// here.
export const coreDocs = {
    "register": {
        location: "higher",
        introduced: "1.0.0",
        summary: "Register a wrapped function with the global @hi object.",
    },
    "test": {
        location: "higher",
        introduced: "1.0.0",
        developmentOnly: true,
        summary: "Run all tests registered with the global @hi object.",
    },
    "functions": {
        location: "higher",
        introduced: "1.0.0",
        summary: "Array of all wrapped functions registered with the global @hi object.",
    },
    "errors": {
        location: "higher",
        introduced: "1.0.0",
        summary: "Dictionary of error types registered with the global @hi object.",
    },
    "sequences": {
        location: "higher",
        introduced: "1.0.0",
        summary: "Dictionary of sequence types registered with the global @hi object.",
    },
    "contracts": {
        location: "higher",
        introduced: "1.0.0",
        developmentOnly: true,
        summary: "Array of all sequence contracts registered with the global @hi object.",
    },
    "args": {
        location: "core/arguments",
        internal: true,
        summary: "An object containing argument validation functions.",
    },
    "asSequence": {
        location: "core/asSequence",
        introduced: "1.0.0",
        summary: "Get a @Sequence for enumerating the elements of some input.",
    },
    "asImplicitSequence": {
        location: "core/asSequence",
        introduced: "1.0.0",
        summary: "Get a @Sequence for enumerating the elements of an input sequence.",
    },
    "validAsSequence": {
        location: "core/asSequence",
        introduced: "1.0.0",
        summary: "Get whether a @Sequence may be constructed to enumerate elements of an input.",
    },
    "validAsImplicitSequence": {
        location: "core/asSequence",
        introduced: "1.0.0",
        summary: "Get whether an input is valid as a @Sequence and itself describes some sequence.",
    },
    "validAsBoundedSequence": {
        location: "core/asSequence",
        introduced: "1.0.0",
        summary: "Get whether an input is valid as a known-bounded @Sequence.",
    },
    "validAsUnboundedSequence": {
        location: "core/asSequence",
        introduced: "1.0.0",
        summary: "Get whether an input is valid as a known-unbounded @Sequence.",
    },
    "assert": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when a condition isn't met.",
    },
    "assertNot": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when a condition is met.",
    },
    "assertUndefined": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when a value is not undefined.",
    },
    "assertEqual": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when some values are not equal.",
    },
    "assertNotEqual": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when some values are all equal.",
    },
    "assertEmpty": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when a sequence is not empty.",
    },
    "assertFail": {
        location: "core/assert",
        introduced: "1.0.0",
        summary: "Throw an @AssertError when a call doesn't throw an error satisfying a predicate.",
    },
    "callAsync": {
        location: "core/callAsync",
        introduced: "1.0.0",
        summary: "Invoke a function asynchronously.",
    },
    "constants": {
        location: "core/constants",
        introduced: "1.0.0",
    },
    "error": {
        location: "core/error",
        introduced: "1.0.0",
    },
    "isSequence": {
        location: "core/sequence",
        introduced: "1.0.0",
        summary: "Determine whether an input is of some @Sequence type.",
    },
    "Sequence": {
        location: "core/sequence",
        introduced: "1.0.0",
        constructor: true,
    },
    "isUndefined": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is undefined.",
    },
    "isBoolean": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is a boolean.",
    },
    "isNumber": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is a number.",
    },
    "isInteger": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is an integer.",
    },
    "isString": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is a string.",
    },
    "isArray": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is an array.",
    },
    "isObject": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is an object.",
    },
    "isFunction": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is callable.",
    },
    "isIterable": {
        location: "core/types",
        introduced: "1.0.0",
        summary: "Get whether an input is iterable.",
    },
    "wrap": {
        location: "core/wrap",
        introduced: "1.0.0",
    },
    "arrayAsSequence": {
        location: "core/arrayAsSequence",
        introduced: "1.0.0",
        summary: "Get a @Sequence for enumerating the elements of an array.",
    },
    "stringAsSequence": {
        location: "core/stringAsSequence",
        introduced: "1.0.0",
        summary: "Get a @Sequence for enumerating the characters in a string.",
    },
    "iterableAsSequence": {
        location: "core/iterableAsSequence",
        introduced: "1.0.0",
        summary: "Get a @Sequence for enumerating the elements of an iterable.",
    },
    "objectAsSequence": {
        location: "core/objectAsSequence",
        introduced: "1.0.0",
        summary: "Get a @Sequence for enumerating an object's key, value pairs.",
    },
    "contract": {
        location: "test/contracts",
        introduced: "1.0.0",
        developmentOnly: true,
    },
    "coreDocs": {
        location: "docs/coreDocs",
        introduced: "1.0.0",
        developmentOnly: true,
        summary: "Documents higher's core modules.",
    },
    "glossary": {
        location: "docs/glossary",
        introduced: "1.0.0",
        developmentOnly: true,
    },
};

export default coreDocs;
