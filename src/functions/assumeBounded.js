import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const AssumeBoundedSequence = Sequence.extend({
    summary: "A known-bounded sequence enumerating the elements of a not-known-bounded sequence.",
    supportsWith: [
        "length", "left", "back", "index", "slice", "has", "get", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single input sequence.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new AssumeBoundedSequence(hi.emptySequence()),
        hi => new AssumeBoundedSequence(hi([0])),
        hi => new AssumeBoundedSequence(hi([0, 1, 2])),
        hi => new AssumeBoundedSequence(hi.range(10)),
        hi => new AssumeBoundedSequence(hi.counter().until(i => i >= 10)),
        hi => new AssumeBoundedSequence(hi.repeat("hello").until(i => i === "o")),
    ],
    constructor: function AssumeBoundedSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        this.source.popBack();
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return new AssumeBoundedSequence(this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new AssumeBoundedSequence(this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// An AssumeBoundedSequence can be used to assure higher that a potentially
// unbounded sequence is in fact bounded.
// This may be helpful if you're sure a sequence that you want to fully
// consume will eventually end, even if higher can't tell for itself.
export const assumeBounded = wrap({
    name: "assumeBounded",
    summary: "Get a known-bounded sequence enumerating the elements of a not-known-bounded sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Given any sequence, such as one that higher does not know to be
            bounded, get a sequence which higher assumes to be bounded, and
            which enumerates the elements of that input sequence.
        `),
        expects: (`
            The function expects a single input sequence.
        `),
        returns: (`
            The function returns a known-bounded sequence enumerating the
            elements of the input sequence.
            If the input sequence was already known to be bounded, then that
            sequence is itself returned.
        `),
        warnings: (`
            It is legal but strongly inadvisable to call the function with a
            known-unbounded sequence as input, or any not-known-bounded
            sequence that you are not absolutely certain must in fact be
            bounded.
            To do otherwise is to eliminate many of the safety and functionality
            guarantees that higher is able to provide.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "limit", "assumeUnbounded",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return source.bounded() ? source : new AssumeBoundedSequence(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Higher is not able to infer that this sequence is bounded!
            const notKnownBounded = hi.recur(n => n + 2).seed(0).until(n => n >= 10);
            hi.assertNot(notKnownBounded.bounded());
            // Operations that require fully consuming the sequence will fail.
            hi.assertFail(() => notKnownBounded.sum());
            // Using assumeBounded assures higher that the sequence will indeed end.
            const knownBounded = hi.recur(n => n + 2).seed(0).until(n => n >= 10).assumeBounded();
            hi.assert(knownBounded.bounded());
            // Now operations that require fully consuming the sequence will succeed.
            hi.assert(knownBounded.sum() === 20); // 0 + 2 + 4 + 6 + 8
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().assumeBounded());
        },
    },
});

export default assumeBounded;
