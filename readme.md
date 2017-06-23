# higher

Higher is a functional programming library for JavaScript with a focus on providing various **higher**-order functions. Call it hi for short.

_Please be aware that this repo is still under construction!_

## What hi does

Higher can be used in the same places that you might be using [lodash](https://lodash.com/) or [Ramda](http://ramdajs.com/) or [lazy.js](http://danieltao.com/lazy.js/), though it's not a drop-in replacement for any of these. It aims to be memory-efficient, performant, and as sane and pleasant to work with as possible.

## What makes hi different

Higher is different from most functional programming tools in that it is focused on lazy sequences - ones that are held in memory as descriptions instead of as fully in-memory arrays. So where `_.map(array)` will return an array and `_.filter(_.map(array, fn), fn)` will create an intermediate array, and then create a second array and return that one, `hi.map(array, fn).filter(fn)` will return a sequence and only when the `.array()` method is called (or `object()` or `collapse()` or `write(to)` methods - more on those later) will the contents of the sequence be dumped into memory, and it will happen once and only once.

## What the heck is a "sequence"

Every sequence that will be returned by functions in higher meet a strict specification. You can rely on these rules always being followed. You can also write your own sequences or higher-order functions that will be fully compatible with higher's built-in sequences and functions, but it's very important that they follow the same pattern so that higher can correctly interact with them.

By design, sequences are always ES6-compliant iterables _and_ ES6-compliant iterators. They just have some additional functionality piled on top.

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
