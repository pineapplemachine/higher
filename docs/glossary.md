# Glossary

Because who can remember what all these terms mean?

### Callback Function

Higher defines a callback function as one which does not modify the objects passed to it, but that does modify state outside the function's own scope. Higher will never expect a callback function to be a pure function.

The `each` or `forEach` function is an example of one accepting a callback function. It invokes the passed callback once for every element of an input sequence.

### Combination Function

A combination function is one accepting exactly two argments and reducing them to one return value.
Higher assumes that all combination functions are also pure functions.

The `reduce` higher-order function accepts a combination function; it combines an initial two elements and then combines each element with the combination preceding it. This functionality could be used, for example, to accumulate a sum of the values in a sequence. (Though for that particular case you probably ought to use one of higher's own summation functions.)

``` js
const combine = (a, b) => (a + b);
```

### Comparison Function

A comparison function is one accepting exactly two arguments (here named `a` and `b` for the sake of example) which returns a truthy value when `a` is equivalent to `b` and a falsey value otherwise.
Higher assumes that all comparison functions are also pure functions.

``` js
const compare = (a, b) => (a === b);
```

### Higher-Order Function

[Higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function) are defined as those functions which accept at least one function as their output, or which output another function. Many of the functions that higher provides are higher-order functions.

### Impure Function

An impure function is any function that doesn't qualify as a pure function.

### Iterable

An iterable is any object for which `object[Symbol.iterator]` is a function returning an iterator.

Here is some [further reading](https://strongloop.com/strongblog/introduction-to-es6-iterators/) on iterables and iterators.

### Iterator

An iterator is any object with a `next` method returning an object with `value` and `done` attributes. The `next` method should be called repeatedly until `done` is truthy, and the series of `value`s will have described some sequence of values.

Here is some [further reading](https://strongloop.com/strongblog/introduction-to-es6-iterators/) on iterables and iterators.

### Lazy Sequence

A lazy sequence is one whose contents are, unlike typical sequences such as arrays, not held fully in-memory. A lazy sequence instead computes its elements one at a time until it has been fully consumed.

### Ordering Function

An ordering function is one accepting exactly two arguments (here named `a` and `b` for the sake of example) which returns a negative value when `a` precedes `b`, a positive value when `a` follows `b`, and zero otherwise.
Higher assumes that all ordering functions are also pure functions.

An example of an ordering function would be:

``` js
const order = (a, b) => (a < b ? -1 : (a > b) ? +1 : 0);
```

### Predicate Function

A predicate function is one accepting any number of arguments, depending on where it's used. (Usually one argument.) It returns a truthy or falsey value describing whether the input matched some condition.
Higher assumes that all predicate functions are also pure functions.

The `filter` higher-order function accepts a predicate. Every element of the input sequence being filtered that satisfies the predicate (i.e. the predicate returns a truthy value) is included in the output sequence whereas elements that don't satisfy the predicate are excluded from the output sequence.

An example of a predicate function would be:

``` js
const predicate = (n) => (n % 2 === 0); // Is n even?
```

### Pure Function

A pure function is any function that does not modify objects passed to it, does not read or write state outside the function's own scope, and does not have side effects. Pure functions always return a value; by definition, any call to a pure function that returns no value is a no-op. As a consequence of these constraints, a pure function will always return the same output for a given set of inputs, and the number of times the function is called will have no impact on program state.

The opposite of a pure function is an impure function - that is, one that modifies objects passed to it or that reads or writes global state, and that is not guaranteed to produce the same output for the same inputs across different calls.

The notion of a pure function is important because in many places higher assumes that inputted functions will be pure functions.

### Relational Function

A relational function is one accepting exactly two arguments (here named `a` and `b` for the sake of example) which returns a truthy value when `a` precedes `b` and a falsey value otherwise.
Higher assumes that all relational functions are also pure functions.

When the relational function is used to define a sorting algorithm, it indicates which elements should precede which when sorting in ascending order. (A function returning `a < b` would produce a sorted result like `[0, 1, 2, 3]`.)

When the relational function is used in finding a minimum or maximum of many elements, the relational function must be itself equivalient to `a < b`.
Higher functions which find the maximum element of a sequence must do so by reversing the order of arguments; `b < a` is, of course, complementary to `a > b`.

An example of a relational function would be:

``` js
const relate = (a, b) => (a < b);
```

### Sequence

A sequence is, generally speaking, any linear progression of elements. It may contain no elements, it may contain a bounded number of elements, or it may be endless, containing an unbounded number of elements.

A `Sequence` is, in higher, a specific prototype which all of the sequences that higher may return will inherit from. (Except where otherwise specified.) A `Sequence` and inheriting objects are, in particular, lazy sequences, meaning that they do not necessarily hold their contents in memory and instead compute them only as needed.

### Sequence Chain

The sequence chain is the series of sequences that may be traced by recursively accessing the `source` property of a sequence, and that sequence's source, etc. until a sequence is found that either does not have a source, or whose source is not also a sequence.

``` js
const sequence = hi([1, 2, 3, 4]).filter(n => n % 2).map(n => n * n);
hi.assert(sequence.chainString() === "ArraySequence.FilterSequence.MapSequence");
```

A sequence chain should be thought of as a series traversed from left to right, such that a typical sequence chain might look like `ArraySequence.FilterSequence.MapSequence`, meaning that this is a map sequence produced from a filter sequence itself produced from an array sequence. In this example the `ArraySequence` is the front or leftmost sequence in the chain and the `MapSequence` is the back or rightmost sequence in the chain.

``` js
const sequence = hi([1, 2, 3, 4]).filter(n => n % 2).concat(hi([5, 6, 7, 8]));
hi.assert(sequence.chainString() === "[ArraySequence.FilterSequence, ArraySequence].ConcatSequence");
```

Even when one of the sequences in a chain has multiple sources, the front or leftmost sequence in the chain is still well-defined.

### Sequence Root

The root of a sequence is the array, string, object, iterable, or other collection (or undefined object) that is the source of the leftmost or first sequence in a sequence chain. If a sequence doesn't have a root, this implies that the first sequence in the chain does not refer to any in-memory collection at all but computes its elements from the parameters it was created with.

The sequences produced by calls to `range` or `recur` are examples of rootless sequences.

### Sequence Source

Almost all sequences have one or more sources. A source is an array, string, object, iterable, other collection, or other sequence that was used as the basis of a new sequence.
If there are multiple sources, the first or leftmost source is given special treatment in that the root of the sequence is defined as its first source's root.

### Transformation Function

A transformation function is one accepting any number of arguments, depending on where it's used. (Usually one argument.) It maps the input arguments to some single output value.
Higher assumes that all transformation functions are also pure functions.

Transformation functions are most commonly used by the `map` higher-order function. The number of arguments expected by its transformation function is the same as the number of sequences that were given as input to the function.

The `recur` function also uses a transformation function that is applied repeatedly to a seed to produce a sequence.

An example of a transformation function would be:

``` js
const transform = (n) => (n * n); // Square n
```
