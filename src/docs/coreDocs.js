// Document functions defined in the src/core/ directory or by the hi object.
// Every attribute assigned to the hi object in higher.js should be documented
// here.
export const coreDocs = {
    "register": {
        location: "higher",
        introduced: "higher@1.0.0",
        summary: "Register a wrapped function with the global @hi object.",
    },
    "test": {
        location: "higher",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        summary: "Run all tests registered with the global @hi object.",
    },
    "functions": {
        location: "higher",
        introduced: "higher@1.0.0",
        summary: "Array of all wrapped functions registered with the global @hi object.",
    },
    "errors": {
        location: "higher",
        introduced: "higher@1.0.0",
        summary: "Dictionary of error types registered with the global @hi object.",
    },
    "sequences": {
        location: "higher",
        introduced: "higher@1.0.0",
        summary: "Dictionary of sequence types registered with the global @hi object.",
    },
    "contracts": {
        location: "higher",
        introduced: "higher@1.0.0",
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
        introduced: "higher@1.0.0",
        summary: "Get a @Sequence for enumerating the elements of some input.",
    },
    "asImplicitSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        summary: "Get a @Sequence for enumerating the elements of an input sequence.",
    },
    "validAsSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        summary: "Get whether a @Sequence may be constructed to enumerate elements of an input.",
    },
    "validAsImplicitSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is valid as a @Sequence and itself describes some sequence.",
    },
    "validAsBoundedSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is valid as a known-bounded @Sequence.",
    },
    "validAsUnboundedSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is valid as a known-unbounded @Sequence.",
    },
    "assert": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when a condition isn't met.",
    },
    "assertNot": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when a condition is met.",
    },
    "assertUndefined": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when a value is not undefined.",
    },
    "assertEqual": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when some values are not equal.",
    },
    "assertNotEqual": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when some values are all equal.",
    },
    "assertEmpty": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when a sequence is not empty.",
    },
    "assertFail": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        summary: "Throw an @AssertError when a call doesn't throw an error satisfying a predicate.",
    },
    "callAsync": {
        location: "core/callAsync",
        introduced: "higher@1.0.0",
        summary: "Invoke a function asynchronously.",
    },
    "constants": {
        location: "core/constants",
        introduced: "higher@1.0.0",
    },
    "error": {
        location: "core/error",
        introduced: "higher@1.0.0",
    },
    "isEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        summary: "Compare objects, sequences, or other values for deep equality.",
    },
    "sequencesEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        internal: true,
    },
    "objectsEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        internal: true,
    },
    "valuesEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        internal: true,
    },
    "isSequence": {
        location: "core/sequence",
        introduced: "higher@1.0.0",
        summary: "Determine whether an input is of some @Sequence type.",
    },
    "Sequence": {
        location: "core/sequence",
        introduced: "higher@1.0.0",
        constructor: true,
    },
    "isUndefined": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is undefined.",
    },
    "isBoolean": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is a boolean.",
    },
    "isNumber": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is a number.",
    },
    "isInteger": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is an integer.",
    },
    "isString": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is a string.",
    },
    "isArray": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is an array.",
    },
    "isObject": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is an object.",
    },
    "isFunction": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is callable.",
    },
    "isIterable": {
        location: "core/types",
        introduced: "higher@1.0.0",
        summary: "Get whether an input is iterable.",
    },
    "wrap": {
        location: "core/wrap",
        introduced: "higher@1.0.0",
    },
    "arrayAsSequence": {
        location: "core/arrayAsSequence",
        introduced: "higher@1.0.0",
        summary: "Get a @Sequence for enumerating the elements of an array.",
    },
    "stringAsSequence": {
        location: "core/stringAsSequence",
        introduced: "higher@1.0.0",
        summary: "Get a @Sequence for enumerating the characters in a string.",
    },
    "iterableAsSequence": {
        location: "core/iterableAsSequence",
        introduced: "higher@1.0.0",
        summary: "Get a @Sequence for enumerating the elements of an iterable.",
    },
    "objectAsSequence": {
        location: "core/objectAsSequence",
        introduced: "higher@1.0.0",
        summary: "Get a @Sequence for enumerating an object's key, value pairs.",
    },
    "contract": {
        location: "test/contracts",
        introduced: "higher@1.0.0",
        developmentOnly: true,
    },
    "coreDocs": {
        location: "docs/coreDocs",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        summary: "Documents higher's core modules.",
    },
    "glossary": {
        location: "docs/glossary",
        introduced: "higher@1.0.0",
        developmentOnly: true,
    },
};

export default coreDocs;
