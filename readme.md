# higher

<img src="media/icon-text-256.png" width="180" height="180" align="right" hspace=24 vspace=6 style="margin-top: 6px; margin-bottom: 8px; margin-left: 40px; margin-right: 18px;"/>

Higher is a functional programming library for JavaScript with a focus on providing implementations for various _higher_-order functions, in lazy and async variants where ever possible and applicable. Call it hi for short.

Higher is released under a [zlib/libpng license](https://github.com/pineapplemachine/higher/blob/master/license). In summary, you may do anything you like with this software except misrepresent its origin.

_Please be aware that this repo is still under construction!_

## What hi does

Higher can be used in the same places that you might be using [lodash](https://lodash.com/) or [Ramda](http://ramdajs.com/) or [lazy.js](http://danieltao.com/lazy.js/), though it's not a drop-in replacement for any of these. It aims to be memory-efficient, performant, and as sane and pleasant to work with as possible.

## What makes hi different

Higher is different from most functional programming tools in that it is focused on lazy sequences and easy asynchronous consumption thereof. A [lazy sequence](https://en.wikipedia.org/wiki/Lazy_evaluation) is one whose elements are never held fully in-memory; elements are requested from the sequence one at a time until the sequence indicates that it's been fully consumed. [ES6 iterators](https://strongloop.com/strongblog/introduction-to-es6-iterators/) are an example of lazy sequences, though higher's sequences have a broader range of functionality. Things that higher sequences can do that ES6 iterators can't include, where possible, bidirectionality, random access, and copying.

Where higher knows how, it will return lazy sequences and will use them in intermediate computations. (Where higher doesn't know how, and where possible, it will fall back on using in-memory sequences.)

In higher, if you were to do something like this, you would get a lazy sequence in return:

``` js
let seq = hi.filter(myArray, n => n % 2).map(n => n * n)
```

If you called `seq.array()`, then you would get the result of the computation in a new array, not modifying the old one, and not making any arrays in between. If you called `seq.collapse()`, then `myArray` would be made to contain the result of the computation, also without making any arrays in between.

You could also do so asyncronously:

``` js
seq.arrayAsync().then(myCallback)
```

``` js
seq.collapseAsync().then(myCallback)
```

...Or you could use `seq.write(to)` or `seq.writeAsync(to)` to write to an existing array other than the one you used to create the sequence. Or you could use `seq.object()` or `seq.objectAsync()` to create an object from a sequence of key, value pairs. Or you could use `seq.each(callback)` or `seq.eachAsync(callback)` if you wanted to perform a function on each element of the sequence without needing to store it fully in-memory.

This is in contrast to many other similar tools for JavaScript which are designed primarily for synchronous computation, which provide different tools for in-place and out-of-place results, and which have to store the result of every intermediate step fully in memory before they can progress to the next step.

## Examples of using hi

TODO: Code examples

## How to use hi in your project

TODO: Setup/usage guide

## How to extend hi

Higher provides quite a few higher-order functions, but sometimes you'll need to do something that just isn't natively supported.

TODO: Registering functions

Sometimes, implementing such a function might entail also implementing a new sequence type. As long as you follow higher's rules for how sequences work, higher's own functions and sequences will know how to interact with it, meaning you'll be able to use higher's normal functions for writing sequences to arrays or consuming them asynchronously.

Sequences in higher meet a strict specification. They inherit from the `hi.Sequence` prototype. They implement, at bare minimum, their own `bounded`, `done`, `front`, and `popFront` methods. In your code, you can rely on these rules always being followed. You can also write your own sequences and higher-order functions that will be fully compatible with higher's own tools, provided they follow the same pattern.

TODO: Put specification in another md and link to it here

A sequence, being defined as an object whose prototype chain ends with `hi.Sequence`, must implement these methods:

- `bounded`: When it returns a truthy value, it means that the sequence is known to have a definite end. When it returns a falsey value, it either may potentially go on boundlessly, or is known certainly to do so. Higher uses the result of this method to know when it's okay to fully consume a sequence, and when doing so might produce an infinite loop.

- `done`: When it returns a truthy value, the sequence has been fully consumed. When it returns a falsey value, the sequence has yet to be fully consumed.

- `front`: Returns the front element of the sequence. Its behavior is undefined if `sequence.done()` is truthy.

- `popFront`: Progresses to the next element in the sequence. Its behavior is also undefined if `sequence.done()` is truthy.

Any sequence has, at minimum, all of these attributes. They will either be functions or null; a null value indicates that the operation isn't supported:

`bounded`: Get whether the sequence is known to have a definite end.
`done`: Get whether the sequence has been fully consumed.
`length`: Get the total number of items in the sequence.
`left`: Get the number of elements left in the sequence before it's fully consumed.
`front`: Get the front element of the sequence.
`popFront`: Progress to the next element at the front of the sequence.
`nextFront`: Get the front element, and also progress to the next one.
`back`: Get the back element of the sequence.
`popBack`: Go to the prior element at the back of the sequence.
`nextBack`: Get the back element and progress to the prior one.
`next`: Get an object with `value` and `done` attributes; `value` is the same as a call to `nextFront` and `done` the same as a following call to `done`. (This makes the sequence an iterator.)
`index`: Get the element at an index.
`slice`: Get a sequence that will enumerate the elements from an inclusive low until an exclusive high index.
`copy`: Get a sequence that is a copy of this one; changing the state of either the original or the copy won't affect the state of the other.
`reset`: Rewind the sequence back to the state it was in when it was first created.
`array`: Get a new array from the contents of the sequence.
`write`: Write the contents of the sequence to an existing array. (But not an array that the sequence was created using.)
`collapse`: Write the contents of the sequence to the array that is at its root.
`object`: Get a new object from the contents of the sequence, where each element is interpreted as a key, value pair.
`consume`: Fully consume the sequence. This might be useful if consuming a sequence will have side-effects.
