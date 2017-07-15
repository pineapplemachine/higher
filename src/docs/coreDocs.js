// Document functions defined in the src/core/ directory or by the hi object.
// Every attribute assigned to the hi object in higher.js should be documented
// here.
export const coreDocs = {
    "register": {
        location: "higher",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Register a wrapped function with the global @hi object.",
    },
    "test": {
        location: "higher",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        type: "function",
        summary: "Run all tests registered with the global @hi object.",
    },
    "functions": {
        location: "higher",
        introduced: "higher@1.0.0",
        type: "array",
        summary: "Array of all wrapped functions registered with the global @hi object.",
    },
    "errors": {
        location: "higher",
        introduced: "higher@1.0.0",
        type: "object",
        summary: "Dictionary of error types registered with the global @hi object.",
    },
    "sequences": {
        location: "higher",
        introduced: "higher@1.0.0",
        type: "object",
        summary: "Dictionary of sequence types registered with the global @hi object.",
    },
    "contracts": {
        location: "higher",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        type: "array",
        summary: "Array of all sequence contracts registered with the global @hi object.",
    },
    "args": {
        location: "core/arguments",
        internal: true,
        type: "object",
        summary: "An object containing argument validation functions.",
    },
    "asSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get a @Sequence for enumerating the elements of some input.",
        expects: (`
            The function expects one argument of any type.
        `),
        returns: (`
            The function returns a @Sequence object when there was any applicable
            converter, such as if the input was an array, string, object, or
            other iterable. If no sequence could be acquired for the input, then
            the function returns undefined.
        `),
        developers: (`
            Note that every converter that is registered slightly increases the
            performance impact of calling the function. For low numbers of
            converters the impact is negligible, but registering a great number
            of converters may have an undesirable impact.
        `),
        examples: [
            "basicUsageArray", "basicUsageString",
            "basicUsageObject", "basicUsageIterator",
        ],
        related: [
            "asImplicitSequence", "validAsSequence"
        ],
        attributes: {
            "converters": {
                location: "core/asSequence",
                introduced: "higher@1.0.0",
                internal: true,
                type: "array",
                summary: "Contains registered sequence converters in order of descending priority.",
            },
            "addConverter": {
                location: "core/asSequence",
                introduced: "higher@1.0.0",
                internal: true,
                type: "function",
                summary: "Register a new sequence converter.",
                detail: (`
                    The function adds the given converter object to the list
                    of converters, and does so in a way that preserves the
                    converter's list sorted order.
                `),
                expects: (`
                    The function expects a converter object as its single
                    argument.
                `),
                returns: (`
                    The function returns its input.
                `),
            },
        },
    },
    "asImplicitSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        type: "function",
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
        type: "function",
        summary: "Get whether an input is valid as a @Sequence and itself describes some sequence.",
    },
    "validAsBoundedSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is valid as a known-bounded @Sequence.",
    },
    "validAsUnboundedSequence": {
        location: "core/asSequence",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is valid as a known-unbounded @Sequence.",
    },
    "assert": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when a condition isn't met.",
    },
    "assertNot": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when a condition is met.",
    },
    "assertUndefined": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when a value is not undefined.",
    },
    "assertEqual": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when some values are not equal.",
    },
    "assertNotEqual": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when some values are all equal.",
    },
    "assertEmpty": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when a sequence is not empty.",
    },
    "assertFail": {
        location: "core/assert",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Throw an @AssertError when a call doesn't throw an error satisfying a predicate.",
    },
    "callAsync": {
        location: "core/callAsync",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Invoke a function asynchronously.",
    },
    "constants": {
        location: "core/constants",
        introduced: "higher@1.0.0",
        type: "function",
    },
    "error": {
        location: "core/error",
        introduced: "higher@1.0.0",
        type: "function",
    },
    "isEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Compare objects, sequences, or other values for deep equality.",
    },
    "sequencesEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        type: "function",
        internal: true,
    },
    "objectsEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        type: "function",
        internal: true,
    },
    "valuesEqual": {
        location: "core/isEqual",
        introduced: "higher@1.0.0",
        type: "function",
        internal: true,
    },
    "isSequence": {
        location: "core/sequence",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Determine whether an input is of some @Sequence type.",
    },
    "Sequence": {
        location: "core/sequence",
        introduced: "higher@1.0.0",
        type: "constructor",
        constructor: true,
    },
    "isUndefined": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is undefined.",
    },
    "isBoolean": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is a boolean.",
    },
    "isNumber": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is a number.",
    },
    "isInteger": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is an integer.",
    },
    "isString": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is a string.",
    },
    "isArray": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is an array.",
    },
    "isObject": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is an object.",
    },
    "isFunction": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is callable.",
    },
    "isIterable": {
        location: "core/types",
        introduced: "higher@1.0.0",
        type: "function",
        summary: "Get whether an input is iterable.",
    },
    "wrap": {
        location: "core/wrap",
        introduced: "higher@1.0.0",
        type: "function",
    },
    "coreDocs": {
        location: "docs/coreDocs",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        type: "object",
        summary: "Documents higher's core modules.",
    },
    "glossary": {
        location: "docs/glossary",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        type: "array",
    },
    "contract": {
        location: "test/contracts",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        type: "function",
    },
    "coreTests": {
        location: "test/coreTests",
        introduced: "higher@1.0.0",
        developmentOnly: true,
        type: "object",
    },
    "coreTestRunner": {
        location: "test/coreTests",
        introduced: "higher@1.0.0",
        internal: true,
        developmentOnly: true,
        type: "function",
    },
};

export default coreDocs;
