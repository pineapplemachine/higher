# Higher's Rulebook

Here are some instructions on what to do and what not to do with higher.

Before we get into it, here are some important terms to recognize:

- **safe** means that you can rely on an operation to always behave in the same way every time and, unless otherwise stated, across different versions of higher.

- **unsafe** means that while something may be valid JavaScript and may behave as you expected in some cases, there is no guarantee that the functionality will be consistent across varying cases and inputs, and no guarantee that it won't behave differently in a future or past release.

## Your rules

These are rules that you should follow when using higher:

### Partially-consumed sequences

It is safe to produce a sequence from a newly-created sequence, i.e. to produce a reversed sequence or a filtered sequence or a mapped sequence from another sequence that was just created or that is newly created to wrap an inputted array or other iterable. However, it is unsafe to produce one sequence from another partially-consumed sequence.

``` js
// This is OK!
const filtered = hi.filter([1, 2, 3, 4, 5], n => n % 2);
const reversed = filtered.reverse();
// This is unsafe!
const filtered = hi.filter([1, 2, 3, 4, 5], n => n % 2);
filtered.popFront();
const reversed = filtered.reverse(); // Unsafe!
```

If you want to create a sequence based on another excepting some elements of the front or back, it is not safe to pop those elements yourself and then to create that sequence. Instead, higher provides functions like `dropHead`, `dropTail`, `from`, and `until` for accomplishing this safely.

TODO: Include links to further reading on these functions

### Sequence invalidation

When an array, object, or sequence is modified in any way, then it becomes unsafe to consume or otherwise interact with any sequence that was created from that source and that was not itself responsible for the modification, or that was created from that now-invalidated sequence, etc.

### Consuming completed sequences

It is unsafe to call `sequence.front()`, `sequence.popFront()`, `sequence.nextFront()`, `sequence.back()`, `sequence.popBack()`, `sequence.nextBack()`, or `sequence.next()` on any sequence for which `sequence.done()` returns a truthy value.

### Consuming unbounded sequences

Before fully consuming any sequence with functions apart from higher's API (such as by using a loop like `for(element of sequence)`), it is prudent to first check whether `sequence.bounded()` returns a truthy value. The method returning a falsey value means that higher does not know for sure that the sequence ever ends. Be careful, and don't ever attempt to fully consume a range that you aren't certain is bounded.

### Out-of-bounds indexes

It is unsafe to call `sequence.index(i)` if `i` is not at least `0` and less than the length of the sequence. It is unsafe to call `sequence.slice(i, j)` if the same is not true of both `i` and `j`, and if `i` is not less than or equal to `j`.

### Undocumented methods

It is unsafe to call undocumented methods, or methods marked explicitly as being intended for internal usage.

### Mutation

It is unsafe to assign a value to any attribute of a sequence.
All operations done with sequences should be done by calling documented methods.

### Function purity

It is unsafe to provide an impure function as input where higher expects a pure function. One of the primary reasons for this lack of safety is that higher does not make any guarantees or assertions about whether or how many times an assumed-pure function will be called for some input.

### Argument modification

It is always unsafe to pass a function as input to higher if that function may modify any objects passed to it as arguments.

## Higher's rules

These are rules that you can rely on higher following:

### Infinite loop avoidance

Higher keeps track of whether sequences are known to be bounded. (Some sequences may never end!) If you tell higher to perform an operation which would involve fully consuming any sequence that isn't known to be bounded, higher will refuse with a thrown error. If you know a sequence is bounded when higher doesn't, you can call `sequence.assumeBounded()` to acquire a new sequence which behaves like the original one except that higher will treat it as though it is guaranteed to eventually end.

### Array and object non-modification

The only time that higher will ever modify any object passed to it as input is if a function intended specifically for that purpose such as `collapse` or `write` is called; note that all higher functions that may modify their inputs are explicitly documented as such.

### Creation isn't modification

Creating a new sequence from another won't ever modify the content or cursors of an input sequence. It _may_ in some cases modify the state, but it will remain possible to interface with the sequence in all the same ways as before, i.e. the modification of state will matter internally but it won't change how you interact with the object.

``` js
const filtered = hi.filter([1, 2, 3, 4, 5], n => n % 2);
// None of the following calls affect the state of the `filtered` sequence.
// You could consume any one of them!
// None of the created sequence will have caused any other to become invalidated.
const reversed = filtered.reverse();
const transformed = filtered.map(n => n * n);
const enumerated = filtered.enumerate();
```

When the state of an input sequence is modified, it will have been because the sequence didn't support methods that were required for an operation to be done lazily. In this case the sequence may be coerced into a fully in-memory one, since fully in-memory sequences support all sequence operations. For example, some sequence operations absolutely must know the length of an input sequence, yet it's not possible to determine the length of all sequences without fully consuming them. The inputted sequence will be modified such that when the operation has to access its length or another attribute, it will be stored fully in-memory.

Typically this will not happen at creation time. There are a few exceptions which are documented as such. Except where otherwise stated, you may assume that the sequence won't be fully consumed until at least one element of the produced sequence is consumed.

TODO: What exceptions are there? Can they be made to no longer be exceptional?

### Creation isn't expensive

Any function that will involve fully consuming an inputted sequence or performing any other expensive operation will have an async variant, such as `array` which synchronously consumes the input to generate an in-memory array and `arrayAsync` which does so asynchronously and returns a Promise.

There may be some exceptional cases, and these are specifically stated in the documentation for every function without an async variant. Unless otherwise stated, functions without an async variant will never involve the consumption of a sequence.

TODO: Actually document this stuff. See what can be done to remove exceptional cases.
