# higher

``` js
// Function returning a sequence enumerating the numbers of a Collatz sequence
const collatz = n => hi.recur(i => i % 2 ? i * 3 + 1 : i / 2)
    .seed(n)
    .until(i => i <= 1)
    .inclusive()
    .assumeBounded();

// Sequence enumerating the numbers of the Fibonacci sequence
const fib = hi.recur(i => [i[1], i[0] + i[1] || 1])
    .seed([0, 0])
    .pluck(1);
```

<img src="media/icon-text-256.png" width="180" height="180" align="right" hspace=24 vspace=6 style="margin-top: 6px; margin-bottom: 8px; margin-left: 40px; margin-right: 18px;"/>

Higher is a functional programming library for JavaScript with a focus on providing implementations for various _higher_-order functions, in lazy and async variants where ever applicable. Call it hi for short.

Higher is released under a [zlib/libpng license](https://github.com/pineapplemachine/higher/blob/master/license). In summary, you may do anything you like with this software except misrepresent its origin.

![Build status](https://travis-ci.org/pineapplemachine/higher.svg?branch=master)

_Please be aware that this repo is still under construction!_

## When to use hi

Higher can be used in the same places that you might be using [lodash](https://lodash.com/) or [Ramda](http://ramdajs.com/) or [lazy.js](http://danieltao.com/lazy.js/), though it's not a drop-in replacement for any of these. It is focused on functions which operate upon or return other functions, and functions which operate upon sequences such as arrays and strings.

``` js
// Sequence enumerating the prime numbers
const primes = hi.concat([2, 3], hi.counter(1)
    .map(i => Math.ceil(i / 2) * 6 + (i % 2 ? +1 : -1))
    .reject(i => i < 2 || hi.range(2, 1 + Math.sqrt(i)).any(j => i % j === 0)))
```

## Why to use hi

Higher's design privileges [lazy sequences](https://en.wikipedia.org/wiki/Lazy_evaluation) and asynchronous consumption. The library is flexible and extensible. It has excellent performance characteristics. Higher allows you to express in-place and out-of-place and synchronous and asynchronous operations with no difference in syntax except for the final method in a chain.

- To produce an array out-of-place:
`hi.map(someArray, someTransformation).array()`

- To perform the operation in-place, modifying the input:
`hi.map(someArray, someTransformation).collapse()`

- To produce an array out-of-place, asynchronously:
`hi.map(someArray, someTransformation).arrayAsync()`

- To perform the operation in-place, asynchronously:
`hi.map(someArray, someTransformation).collapseAsync()`

TODO: Benchmark comparisons

``` js
// String containing the lyrics to "99 bottles"
const bottles = hi.range(1, 100)
    .reverse()
    .map(i => `${i} bottle${i === 1 ? "" : "s"} of beer on the wall, ` +
        `${i} bottle${i === 1 ? "" : "s"} of beer.\n` +
        `Take one down, pass it around, ` +
        `${(i - 1) || "no more"} bottle${i === 2 ? "" : "s"} of beer on the wall.\n`)
    .concat("No more bottles of beer on the wall, " +
        "no more bottles of beer.\n" +
        "Go to the store and buy some more, " +
        "99 bottles of beer on the wall.\n")
    .string();
```

## How to use hi in your project

TODO: Setup/usage guide

## How to contribute to hi

Please feel welcome to help make higher more usable and more accessible for everyone!

Higher can always use more, better tests and clearer and more thorough documentation. And people who use higher will always need help and answers to their [questions](https://github.com/pineapplemachine/higher/labels/issue%3A%20question). You can also contribute by working on [bugfixes](https://github.com/pineapplemachine/higher/labels/type%3A%20bug), [polish tasks](https://github.com/pineapplemachine/higher/labels/type%3A%20polish), and [new features](https://github.com/pineapplemachine/higher/labels/type%3A%20feature).

Before making contributions to higher, you should read the [code of conduct](docs/conduct.md) and the [style guide](docs/style.md).
