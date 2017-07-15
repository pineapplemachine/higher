// Define jargony terms used throughout higher and its documentation.
export const glossary = process.env.NODE_ENV !== "development" ? undefined : [
    // Types of functions
    {
        term: "higher-order function",
        category: "functions",
        definition: (`
            A higher-order function is any function which accepts at least one
            function as input, or which itself outputs a function.
        `),
        examples: [
            'const negate = (f) => ((i) => (!f(i)));',
            'const add = (i) => ((j) => (i + j));',
        ],
        links: [
            "https://en.wikipedia.org/wiki/Higher-order_function",
        ],
    },
    {
        term: "pure function",
        category: "functions",
        definition: (`
            A pure function is any function that does not modify its inputs and
            that does not read or write state outside the function's own scope.
            It must consequently always return the same output for the same
            inputs, and it must never have side effects.
        `),
        examples: [
            'const isEven = (i) => (i % 2 === 0);',
            'const square = (i) => (i * i);',
        ],
        relatedTerms: [
            "impure function"
        ],
    },
    {
        term: "impure function",
        category: "functions",
        definition: (`
            An impure function is any function that doesn't qualify as a pure
            function. That is, it modifies its inputs or it reads or writes
            state outside the function's own scope. There is no guarantee that
            the same input to an impure function will always produce the same
            output, and there is no guarantee against side effects.
        `),
        examples: [
            'const log = (i) => {alert("Callback with value " + i);}',
            'const counter = (i) => ++someGlobalVariable;',
        ],
        relatedTerms: [
            "pure function"
        ],
    },
    {
        term: "predicate function",
        category: "functions",
        definition: (`
            A predicate function is any [pure function] accepting any number of
            arguments. (But usually only one argument.)
            It returns a truthy or falsey value describing whether the input
            satisfied some condition.
            It is said that an input matches or satisfies a predicate when
            the input produces a truthy output.
        `),
        examples: [
            'const isEven = (i) => (i % 2 === 0);',
            'const isString = (i) => (typeof(i) === "string");',
        ],
        relatedTerms: [
            "transformation function", "pure function"
        ],
        relatedFunctions: [
            "filter", "reject"
        ],
    },
    {
        term: "transformation function",
        category: "functions",
        definition: (`
            A predicate function is any [pure function] accepting any number of
            arguments, most often only one argument.
            It maps its input to some transformed output.
        `),
        examples: [
            'const double = (i) => (i + i);',
            'const square = (i) => (i * i);',
        ],
        relatedTerms: [
            "predicate function", "combination function", "pure function"
        ],
        relatedFunctions: [
            "map"
        ],
    },
    {
        term: "comparison function",
        category: "functions",
        definition: (`
            A comparison function is a [pure function] accepting two arguments.
            It returns a truthy value when the inputs are equivalent and a
            falsey value otherwise.
            It has the property that if A is equivalent to B and B is
            equivalent to C, then it must also assert that C is equivalent to A.
        `),
        examples: [
            'const equal = (a, b) => (a === b);',
            'const asciiCaseInsensitive = (a, b) => (a.toUpperCase() === b.toUpperCase());',
        ],
        relatedTerms: [
            "ordering function", "pure function"
        ],
        relatedFunctions: [
            "equals", "startsWith", "endsWith"
        ],
    },
    {
        term: "relational function",
        category: "functions",
        definition: (`
            A relational function is a [pure function] accepting two arguments.
            It returns a truthy value when the first input precedes or is less
            than the second input and it returns a falsey value otherwise.
            It has the property that if A precedes B and C precedes A according
            to the relational function, then it must also assert that C
            precedes B.
        `),
        examples: [
            'const ascending = (a, b) => (a < b);',
            'const descending = (a, b) => (a > b);',
        ],
        relatedTerms: [
            "ordering function", "pure function"
        ],
        relatedFunctions: [
            "sort", "isSorted", "min", "max"
        ],
    },
    {
        term: "ordering function",
        category: "functions",
        definition: (`
            An ordering function is a [pure function] accepting two arguments.
            It returns a negative number when the first input precedes or is
            less than the second input, a positive number when the second input
            precedes the first input, and zero otherwise.
            It has the property that if A precedes B and C precedes A according
            to the relational function, then it must also assert that C
            precedes B. Additionally that if A is equivalent to B and B is
            equivalent to C, then it must also assert that C is equivalent to A.
        `),
        examples: [
            'const ascending = (a, b) => (a < b ? -1 : (a > b) ? +1 : 0);',
            'const descending = (a, b) => (a < b ? +1 : (a > b) ? -1 : 0);',
        ],
        relatedTerms: [
            "relational function", "comparison function", "pure function"
        ],
        relatedFunctions: [
            "lexOrder"
        ],
    },
    {
        term: "combination function",
        category: "functions",
        definition: (`
            A combination function is a [pure function] accepting two arguments.
            A combination function is so-called because it is invoked repeatedly
            with an accumulator and each value in a sequence as inputs to reach
            a final combined value, where the accumulator is the result of
            combining the prior accumulator with the prior element back to a
            designated seed value.
        `),
        examples: [
            'const sum = (a, b) => (a + b);',
            'const product = (a, b) => (a * b);',
        ],
        relatedTerms: [
            "transformation function", "pure function"
        ],
        relatedFunctions: [
            "reduce"
        ],
    },
    {
        term: "callback function",
        category: "functions",
        definition: (`
            A callback function is an [impure function]. It accepts some input
            and then performs some side-effect operation based on that input.
            Typically, callback functions do not return a value or, if they do,
            that value is ignored by the caller.
        `),
        examples: [
            'const log = (i) => {alert("Callback with value " + i);}',
        ],
        relatedTerms: [
            "impure function"
        ],
        relatedFunctions: [
            "each", "tap"
        ],
    },
    // Sequence-related terms
    {
        term: "sequence",
        category: "sequences",
        definition: (`
            A sequence is an ordered series of zero or more elements, and
            potentially an unbounded number of elements. Arrays are a very
            fundamental and common type of sequence in computer programming.
        `),
        examples: [
            'const array = [0, 1, 2, 3];',
            'const range = hi.range(0, 10);',
        ],
        links: [
            "https://en.wikipedia.org/wiki/Sequence",
        ],
    },
    {
        term: "lazy sequence",
        category: "sequences",
        definition: (`
            A lazy sequence is any [sequence] whose elements are computed as
            they're requested rather than storing them in memory all at once.
            A lazy sequence can be thought of as an abstract description of
            its elements whereas an eager sequence is a concrete representation
            of those elements. Some lazy sequences are built upon the contents
            of an [eager sequence], and some are entirely an abstract description.
        `),
        examples: [
            'const seq = hi.range(0, 10);',
        ],
        relatedTerms: [
            "eager sequence"
        ],
    },
    {
        term: "eager sequence",
        category: "sequences",
        definition: (`
            A eager sequence is any [sequence] whose elements are stored
            entirely in-memory. Arrays are a very fundemantal and common
            type of eager sequence.
        `),
        examples: [
            'const array = [0, 1, 2, 3];',
        ],
        relatedTerms: [
            "lazy sequence"
        ],
    },
    {
        term: "bounded sequence",
        category: "sequences",
        definition: (`
            A bounded sequence is any [sequence] that is known to contain a
            countable number of elements. That is, it is possible for the
            contents of sequence to be fully enumerated in a finite amount
            of time. All [eager sequences](eager sequence) are also bounded
            sequences.
        `),
        examples: [
            'const array = [0, 1, 2, 3];',
        ],
        relatedTerms: [
            "eager sequence", "unbounded sequence"
        ],
    },
    {
        term: "unbounded sequence",
        category: "sequences",
        definition: (`
            An ubounded sequence is any [sequence] that is known to contain an
            uncountable number of elements. That is, it is impossible to fully
            enumerate the sequence. Only [lazy sequences](lazy sequence) may
            be unbounded.
        `),
        examples: [
            'const naturalNumbers = function*(){let n = 0; while(1){yield n++;}}()',
        ],
        relatedTerms: [
            "bounded sequence"
        ],
    },
    {
        term: "sequence source",
        category: "sequences",
        definition: (`
            Many [sequences](sequence) are a transformation applied to one or
            more input sequences.
            The input sequences that a sequence transforms are that sequence's
            sources. Some sequences don't themselves have a source but rather
            describe their contents using other parameters; this lack of source
            implies that a sequence is a [root](sequence root).
            All sequences that have more than one source define one as being the
            [first source](first sequence source); this source is given special
            meaning when determining a [sequence's root](sequence root).
        `),
        relatedTerms: [
            "first sequence source", "sequence source"
        ],
    },
    {
        term: "first sequence source",
        category: "sequences",
        definition: (`
            The first sequence source of a [sequence] having exactly one
            [source](sequence source) is that one source. A sequence without
            any sources does not have a first source, and sequences with more
            than one source must define one of its sources as being its first
            source.
        `),
        relatedTerms: [
            "sequence root"
        ],
    },
    {
        term: "sequence root",
        category: "sequences",
        definition: (`
            A root sequence is any [sequence] that is not itself defined in
            terms of any [sequence source].
            The root of a sequence that is not itself a root is the root of
            it's [first source's](first sequence source) root, or its
            first source if that source is itself a root.
            A sequence that is itself a root does not possess a root.
        `),
        relatedTerms: [
            "sequence source"
        ],
    },
    // Implementation-related terms
    {
        term: "singular map",
        category: "specific function",
        definition: (`
            A singular map [sequence] is produced by calling the @map function
            with a single sequence as input. This is the most common and
            conventional usage of a map function. When there are zero sequences
            or more than one sequence given as input, the resulting map
            sequence is called a [plural map sequence](plural map).
        `),
        relatedTerms: [
            "plural map"
        ],
        links: [
            {
                description: "Map higher-order function on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Map_(higher-order_function)",
            },
        ],
    },
    {
        term: "plural map",
        category: "specific function",
        definition: (`
            A plural map [sequence] is produced by calling the @map function
            with no sequence or more than one sequence as input.
            The [transformation function] given when constructing the map
            sequence is invoked with corresponding elements of the input
            sequences passed as arguments in the same order that those input
            sequences were first provided. When there is exactly one input
            sequence, the resulting map sequence is called a
            [singular map sequence](singular map).
        `),
        relatedTerms: [
            "singular map"
        ],
        links: [
            {
                description: "Clojure's similarly-peculiar map function",
                url: "https://clojuredocs.org/clojure.core/map",
            },
        ],
    },
];

export default glossary;
