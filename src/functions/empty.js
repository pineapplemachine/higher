import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

// A chronically empty sequence.
export const EmptySequence = Sequence.extend({
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

export const empty = wrap({
    name: "empty",
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
});

export default empty;
