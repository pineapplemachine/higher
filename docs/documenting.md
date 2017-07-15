# Documenting higher

Here is an exhaustive specification of what information is expected for
documentation and tests for various higher objects.

## Documentation strings

With the exception of summaries which are meant, in general, to be no longer than 100 characters, in documentation strings higher replaces any uninterrupted series of whitespace that includes a newline character with one space.

For example, this `returns` documentation string:

``` js
export const filter = wrap({
    name: "filter",
    summary: "Get a sequence enumerating only those elements satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        returns: (`
            The function returns a sequence enumerating only those elements of
            the input which satisfy the predicate.
        `),
    },
});
```

Will be processed and replaced with this result as far as anyone interfacing with the wrapped function's documentation is concerned:

``` js
export const filter = wrap({
    name: "filter",
    summary: "Get a sequence enumerating only those elements satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        returns: "The function returns a sequence enumerating only those elements of the input which satisfy the predicate.",
    },
});
```

To force a newline to be present in the outputted documentation, begin the first line of a new paragraph with the `/` character.

For example, this `developers` documentation string:

``` js
export const collapse = wrap({
    name: "collapse",
    summary: "Write the contents of a sequence to the array at its root.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        developers: (`
            Sequence types with a collapseBreak method necessitate writing their
            contents fully to the array before continuing up the sequence chain,
            and may cause a substantial performance impact for very long
            sequences. For long sequences or sequences with many breaks in their
            chain, it may be preferable to produce an out-of-place array.
            /Collapsing is not possible if any sequence in the chain that follows
            one with a collapseBreak method does not support a rebase operation,
            or if a sequence itself having a collapseBreak method does not
            support a rebase operation.
            /Note that this failure would indicate an issue with a sequence
            implementation, not a usage error.
        `),
    },
});
```

Will be processed and replaced with this result:

``` js
export const collapse = wrap({
    name: "collapse",
    summary: "Write the contents of a sequence to the array at its root.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        developers: "Sequence types with a collapseBreak method necessitate writing their contents fully to the array before continuing up the sequence chain, and may cause a substantial performance impact for very long sequences. For long sequences or sequences with many breaks in their chain, it may be preferable to produce an out-of-place array.\nCollapsing is not possible if any sequence in the chain that follows one with a collapseBreak method does not support a rebase operation, or if a sequence itself having a collapseBreak method does not support a rebase operation.\nNote that this failure would indicate an issue with a sequence implementation, not a usage error.",
    },
});
```

## Links

A link is a string of the format `@target`, `[target]`, or `[alias](target)` which may appear within documentation strings. A link indicates that the text is referring to some specific symbol or glossary term that higher defines. The `@target` syntax must be used to refer to identifiers such as function names or sequence type names. The `[target]` syntax must be used for things such as glossary terms that are not necessarily identifiers, and which may contain punctuation. The `[alias](target)` syntax must be used if the text appearing in the documentation string is not exactly identical to the glossary term being linked to, or if it is desireable to name an identifier but in a plural form, for example `[FilterSequences](FilterSequence)`.

The `[alias](target)` syntax may also be used to represent a hyperlink, i.e. the target is a URL rather than an identifier or a glossary term. However, placing the link in a documentation object's `links` attribute with an explanatory description should be preferred over this usage.

## Documenting wrapped functions

A wrapped function has `summary`, `docs`, and `tests` attributes.
The `docs` and `tests` attributes must be assigned to `undefined` when `process.env.NODE_ENV !== "development"` so that they will be omitted from minified production builds.

`summary` is a string briefly describing the function. It should be no longer than 100 characters, though this is a guideline and not a strict limit.

`tests` is an object associating keys with test functions, where every test function must accept a single parameter passing a complete `hi` object. When a test function throws any error it indicates a failure, otherwise it indicates that the test has passed. Test functions do not return a value or, if they do, that value is ignored.

`docs` is an object having these attributes:

- `introduced`: The package which defines this function and the version in
which it was first added. This attribute must be present always. An example of such a package and version string would be `higher@1.0.0`.
- `detail`: For functions whose brief `summary` attribute may not be adequately descriptive, a `detail` attribute may be included which is a more complete description of the function.
- `expects`: For functions that expect arguments, a statement such as "The function expects..." describing what arguments the function expects and what purpose each of those functions serves. This attribute must be present when the function accepts any arguments and must be absent otherwise.
- `returns`: For functions that return a value, a statement such as "The function returns..." describing what the function returns and under what conditions. This attribute must be present when the function returns any value and must be absent otherwise.
- `throws`: For functions that may throw an error, a statement such as "The function throws..." describing what errors the function may throw and under what conditions. This applies only to errors thrown within the `implementation` of a wrapped function; it does not apply to things like externally-enforced argument validation errors. This attribute must be present when the function would throw an error under any circumstances and must be absent otherwise. Every error type that the function could throw should be identified with a link, for example "The function throws a @NotBoundedError when...".
- `warnings`: For functions that may have dangerous or unexpected behavior in certain cases, a `warnings` attribute must be present describing those cases. An example of dangeous or unexpected behavior would be a function producing an infinite loop for some inputs.
- `developers`: A documentating string stating information that may be important to those who are extending some functionality or interacting with it in an advanced way.
- `examples`: An array of strings where each string is the key associated with some test in the function's `tests` object. These indicate which tests are useful as usage examples for someone trying to learn how and why to use the function. This attribute must be present always, and must refer to at least one existing test.
- `related`: An array of strings where each string is an identifier registered with the global `hi` object. Each identifier must refer to an object that is somehow related to this one. For example, the `first` and `last` functions are both related to each other because they solve conceptually similar problems. This attribute is never absolutely required to be present.
- `links`: An array of objects containing hyperlinks to external resources and brief descriptions of these links. An example of such an object might be `{description: "Map higher-order function on Wikipedia", url: "https://en.wikipedia.org/wiki/Map_(higher-order_function)"}`. This attribute is never absolutely required to be present.

For the sake of readability and consistency, the attributes of the `docs` object must always appear in the order listed here.

Here is an example showing what the `summary`, `docs`, and `tests` attributes may look like for a wrapped function:

``` js
export const negate = wrap({
    name: "negate",
    summary: "Get the logical negation of a predicate function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single predicate function as its input.
        `),
        returns: (`
            The function builds and returns a function returning true for
            which inputs producing a falsey value when passed to the
            inputted predicate and returning false for all inputs producing
            a truthy value when passed to that predicate.
        `),
        examples: [
            "basicUsage"
        ],
        related: [
            "allPass", "anyPass", "nonePass"
        ],
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = (i) => (i % 2 === 0);
            const odd = hi.negate(even);
            hi.assert(even(2));
            hi.assert(odd(3));
        },
    },
});
```

## Documenting sequences

A `Sequence` type has `summary`, `docs`, and `getSequence` attributes.
The `docs` and `getSequence` attributes must be assigned to `undefined` when `process.env.NODE_ENV !== "development"` so that they will be omitted from minified production builds.

`summary` is a string briefly describing the sequence type. It should be no longer than 100 characters, though this is a guideline and not a strict limit.

`getSequence` is a list of functions where each function accepts a complete `hi` object as its single argument and returns a sequence of the type the attribute belongs to. An example of such a function might be `hi => new FilterSequence(i => i % 2, hi.range(0, 10))`. Every function in the list is used to test the sample sequences against sequence contracts; sequence contracts enforce the correctness of properties such as bidirectionality and random access.

`docs` is an object having these attributes:

- `introduced`: The package which defines this function and the version in
which it was first added. This attribute must be present always. An example of such a package and version string would be `higher@1.0.0`.
- `detail`: For sequence types whose brief `summary` attribute may not be adequately descriptive, a `detail` attribute may be included which is a more complete description of the sequence type.
- `warnings`: For sequences that may have dangerous or unexpected behavior in certain cases, a `warnings` attribute must be present describing those cases. An example of dangeous or unexpected behavior would be a sequence's `front` or `popFront` entering an infinite loop in some cases.
- `developers`: A documentating string stating information that may be important to those who are extending some functionality or interacting with it in an advanced way.
- `methods`: An object where each key corresponds to a nonstandard method that the sequence type exposes; the contents of every object mapped to such a key must be as though describing a wrapped function, with the addition of a `summary` attribute following the `introduced` attribute serving the same purpose as a normal function summary.

Here is an example showing what the `summary`, `docs`, and `tests` attributes may look like for a sequence type:

``` js
export const ObjectSequence = Sequence.extend({
    summary: "Enumerate the key, value pairs of an object.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Enumerate the key, value pairs of an object in a deterministic order.
            Sequences produced from different objects having the same keys will
            always have the keys in their key, value pairs appear in the same
            order.
        `),
        methods: {
            "keys": {
                introduced: "higher@1.0.0",
                summary: "Get a sequence enumerating only the keys of the object.",
                returns: (`
                    This function returns a sequence enumerating the keys of
                    the object that the ObjectSequence was created from in the
                    same order that the sequence would have enumerated those
                    keys as part of key, value pairs.
                `),
            },
            "values": {
                introduced: "higher@1.0.0",
                summary: "Get a sequence enumerating only the values of the object.",
                returns: (`
                    This function returns a sequence enumerating the values of
                    the object that the ObjectSequence was created from in the
                    same order that the sequence would have enumerated those
                    values as part of key, value pairs.
                `),
            },
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ObjectSequence({}),
        hi => new ObjectSequence({a: 0}),
        hi => new ObjectSequence({a: 0, b: 1}),
        hi => new ObjectSequence({x: "hello", y: "world", z: "how", w: "do"}),
    ],
});
```

## Documenting error types

An error type has `summary` and `docs` attributes.
The `docs` attribute must be assigned to `undefined` when `process.env.NODE_ENV !== "development"` so that it will be omitted from minified production builds.

`summary` is a string briefly describing the sequence type. It should be no longer than 100 characters, though this is a guideline and not a strict limit.

`docs` is an object having the same attributes as a wrapped function except that the `returns` attribute must always be omitted; it is assumed that an error function returns an error object of the specified type.
Note that rather than associating functions that may throw the error type via a `related` attribute it is preferable to relate them by indicating that the function may throw an error of this type in that function's own `throws` documentation.

Here is an example showing what the `summary` and `docs` attributes may look like for an error type:

``` js
export const BoundsUnknownError = error({
    summary: "Failed because a sequence must be known to be bounded or unbounded.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence which was
            required to be known to be bounded or unbounded, but was not.
            The function also accepts an options object which may have a message
            attribute providing additional error information.
        `),
    },
});
```

## Documenting sequence contracts

A sequence contract has `summary` and `docs` attributes.

`summary` is a string briefly describing the sequence type. It should be no longer than 100 characters, though this is a guideline and not a strict limit.

`docs` is an object having these attributes in this order:

- `introduced`: The package which defines this function and the version in
which it was first added. This attribute must be present always. An example of such a package and version string would be `higher@1.0.0`.
- `detail`: For contracts whose brief `summary` attribute may not be adequately descriptive, a `detail` attribute may be included which is a more complete description of the contract.
- `warnings`: Same as for wrapped functions.
- `developers`: Same as for wrapped functions.
- `links`: Same as for wrapped functions.

Here is an example what a sequence contract's `summary` and `docs` attributes might look like:

``` js
export const CopyingContract = contract({
    summary: "The sequence must produce correct and independent copies.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            The contract verifies that copying a sequence produces correct
            copies that are not affected by changing the state of the sequence
            it was copied from, or a sequence that was produced by copying it.
            Empty sequences always satisfy the contract.
            The contract is tested even for sequences not known to be bounded;
            in no case are no more than the first forty elements of the input
            sequence consumed.
        `),
    },
});
```

## Documenting core functions

Core functions must be documented in `src/docs/coreDocs.js` and must be tested in `src/test/coreTests.js`. The `coreDocs` module exports a dictionary where every externally-exposed attribute of the `hi` object implemented in the `src/core/` directory is associated by name with an object which documents it. It has the same attributes as a wrapped function with a few added.

Every such object is one having these attributes in this order:

- `location`: The path to the JavaScript module, relative to the `src/` directory, where the smybol is implemented.
- `introduced`: The package which defines this function and the version in
which it was first added. This attribute must be present always. An example of such a package and version string would be `higher@1.0.0`.
- `deprecated`: If the function has been deprecated, it must be indicated with a version string describing which version the function was deprecated in. For example, `higher@1.1.0`.
- `internal`: Symbols that are not part of the `hi` object may optionally be documented in `coreDocs` as well, but they must be marked as intended only for internal use by including an `internal: true` attribute. It is preferred that internal functions be documented in `coreDocs` as well as externally-exposed ones.
- `developmentOnly`: Symbols of the `hi` object which are defined only in development environments and not in production builds must be marked as such with a `developmentOnly: true` attribute.
- `type`: A string such as `array`, `object`, `function`, `constructor`, `number`, `string`, etc. describing for documentation purposes the type of the attribute.
- `summary`: A string briefly describing the function. It should be no longer than 100 characters, though this is a guideline and not a strict limit.
- `detail`: Same as for wrapped functions.
- `expects`: Same as for wrapped functions. If the symbol is not a function, it should not have an `expects` attribute.
- `returns`: Same as for wrapped functions. If the symbol is not a function, it should not have a `returns` attribute.
- `throws`: Same as for wrapped functions. If the symbol is not a function, it should not have a `throws` attribute.
- `warnings`: Same as for wrapped functions.
- `developers`: Same as for wrapped functions.
- `examples`: Same as for wrapped functions. Refers to tests defined in the `coreTests` module.
- `related`: Same as for wrapped functions. Core functions should never be related to functions defined outside core.
- `links`: Same as for wrapped functions.
- `attributes`: Documents the attributes of an object. The object associated with an `attributes` field must be an array mapping property names to documentation objects following the same pattern as all other `coreDocs` documentation objects.

Here is an example showing what a `coreDocs` entry might look like:

``` js
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
```

Core tests must be implemented in `test/coreTests.js`. The module exports a `coreTests` object which associates symbol keys with an object containing tests. Just like the tests of a wrapped function, the tests must be named so that they may can be identified, for example when indicating which tests should be given as usage examples, and they must accept a complete `hi` object as their single argument. Test functions do not return values; if they do return a value, that value is ignored.

Here is an example showing what a core function test might look like:

``` js
"asSequence": {
    "basicUsageArray": hi => {
        const seq = hi.asSequence([1, 2, 3]);
        hi.assert(seq.nextFront() == 1);
        hi.assert(seq.nextFront() == 2);
        hi.assert(seq.nextFront() == 3);
        hi.assert(seq.done());
    },
    "basicUsageString": hi => {
        const seq = hi.asSequence("hi!");
        hi.assert(seq.nextFront() == "h");
        hi.assert(seq.nextFront() == "i");
        hi.assert(seq.nextFront() == "!");
        hi.assert(seq.done());
    },
    "basicUsageObject": hi => {
        const obj = {hello: "world"};
        const seq = hi.asSequence(obj);
        hi.assertEqual(seq.nextFront(), {
            key: "hello", value: "world"
        });
        hi.assert(seq.done());
    },
    "basicUsageIterable": hi => {
        const countdown = function*(n){
            while(n > 0) yield n--;
            yield 0;
        };
        const seq = hi.asSequence(countdown(3));
        hi.assert(seq.nextFront() == 3);
        hi.assert(seq.nextFront() == 2);
        hi.assert(seq.nextFront() == 1);
        hi.assert(seq.nextFront() == 0);
        hi.assert(seq.done());
    },
},
```

## Other topics

A good docstring:

- Uses clear and unambiguous language to the greatest extent possible.
- Uses links to help readers quickly navigate to and understand the role of objects or terms that are related to the function.
- Uses a minimum of jargon and obscure terms and, when such terms are necessary to make the explanation, are elaborated by links to the glossary.

A good usage example:

- Does not waste a reader's attention establishing details that are important only in a small subset of use cases.
- Does not waste a reader's attention with examples that are longer or more complicated than they need to be in order to aid comprehension of the use case.

A good set of unit tests:

- Has coverage for as many different kinds of inputs as can be imagined.
- Does not have redundant tests; every test should pertain to a case that is conceptually different from the others or that involves a different code path in the implementation.
- Verifies that the function fails gracefully with inputs that may be allowed by external arguments validation but would produce errors in the function's own implementation.
