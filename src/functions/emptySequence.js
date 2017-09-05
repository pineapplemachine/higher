import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const EmptySequence = defineSequence({
    summary: "An absolutely empty sequence",
    supportsAlways: [
        "length", "back", "index", "slice", "has", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor accepts no arguments.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new EmptySequence(),
    ],
    constructor: function EmptySequence(){},
    bounded: () => true,
    unbounded: () => false,
    done: () => true,
    length: () => 0,
    front: () => undefined,
    popFront: () => {},
    back: () => undefined,
    popBack: () => {},
    index: (i) => undefined,
    slice: function(i, j){
        return this;
    },
    has: (i) => false,
    get: (i) => undefined,
    copy: function(){
        return this;
    },
});

export const emptySequence = wrap({
    name: "emptySequence",
    summary: "Get an empty sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        returns: (`
            The function returns an empty sequence.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        none: true,
    },
    implementation: () => {
        return new EmptySequence();
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.emptySequence();
            hi.assert(seq.bounded());
            hi.assert(seq.done());
            hi.assert(seq.length() === 0);
        },
    },
});

export default emptySequence;
