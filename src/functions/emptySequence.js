import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

// A chronically empty sequence.
export const EmptySequence = Sequence.extend({
    summary: "An absolutely empty sequence",
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new EmptySequence(),
    ],
    constructor: function EmptySequence(){},
    repeat: function(repetitions){
        return this;
    },
    reverse: function(){
        return this;
    },
    bounded: () => true,
    unbounded: () => false,
    done: () => true,
    length: () => 0,
    left: () => 0,
    front: () => undefined,
    popFront: () => {},
    back: () => undefined,
    popBack: () => {},
    index: (i) => undefined,
    has: (i) => false,
    get: (i) => undefined,
    slice: function(i, j){
        return this;
    },
    copy: function(){
        return this;
    },
    reset: function(){
        return this;
    },
    rebase: null,
});

export const emptySequence = wrap({
    name: "emptySequence",
    summary: "Get an empty sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        returns: (`
            The function returns an empty sequence.
        `),
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        none: true
    },
    sequences: [
        EmptySequence
    ],
    implementation: () => {
        return new EmptySequence();
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.emptySequence();
            hi.assert(seq.bounded());
            hi.assert(seq.done());
            hi.assert(seq.length() === 0);
            hi.assert(seq.left() === 0);
        },
    },
});

export default emptySequence;
