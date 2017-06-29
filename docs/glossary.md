# Glossary

Because who can remember what all these terms mean?

### Comparison function

A comparison function is one accepting exactly two arguments (here named `a` and `b` for the sake of example) which returns a truthy value when `a` is equivalent to `b` and a falsey value otherwise.

### Higher-Order Function

[Higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function) are defined as those functions which accept at least one function as their output, or which output another function. Many of the functions that higher provides are higher-order functions.

### Iterable

An iterable is any object for which `object[Symbol.iterator]` is a function returning an iterator.

Here is some [further reading](https://strongloop.com/strongblog/introduction-to-es6-iterators/) on iterables and iterators.

### Iterator

An iterator is any object with a `next` method returning an object with `value` and `done` attributes. The `next` method should be called repeatedly until `done` is truthy, and the series of `value`s will have described some sequence of values.

Here is some [further reading](https://strongloop.com/strongblog/introduction-to-es6-iterators/) on iterables and iterators.

### Lazy Sequence

A lazy sequence is one whose contents are, unlike typical sequences such as arrays, not held fully in-memory. A lazy sequence instead computes its elements one at a time until it has been fully consumed.

### Ordering function

An ordering function is one accepting exactly two arguments (here named `a` and `b` for the sake of example) which returns a negative value when `a` precedes `b`, a positive value when `a` follows `b`, and zero otherwise.

An example of an ordering function would be:

``` js
const order = (a, b) => (a < b ? -1 : (a > b) ? +1 : 0);
```

### Predicate function

A predicate function is one accepting any number of arguments, depending on where it's used. (Usually one argument.) It returns a truthy or falsey value describing whether the input matched some condition.

The `filter` higher-order function accepts a predicate. Every element of the input sequence being filtered that satisfies the predicate (i.e. the predicate returns a truthy value) is included in the output sequence whereas elements that don't satisfy the predicate are excluded from the output sequence.

An example of a predicate function would be:

``` js
const predicate = (n) => (n % 2 === 0); // Is n even?
```

### Relational Function

A relational function is one accepting exactly two arguments (here named `a` and `b` for the sake of example) which returns a truthy value when `a` precedes `b` and a falsey value otherwise.

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

### Transformation function

A transformation function is one accepting any number of arguments, depending on where it's used. (Usually one argument.) It maps the input arguments to some single output value.

Transformation functions are most commonly used by the `map` higher-order function. The number of arguments expected by its transformation function is the same as the number of sequences that were given as input to the function.

The `recur` function also uses a transformation function that is applied repeatedly to a seed to produce a sequence.

An example of a transformation function would be:

``` js
const transform = (n) => (n * n); // Square n
```
