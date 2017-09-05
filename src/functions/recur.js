import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const RecurSequence = defineSequence({
    summary: "Enumerate the values produced by repeatedly applying a transformation function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a transformation function and a seed value
            as input.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new RecurSequence(i => i, 0),
        hi => new RecurSequence(i => i + 1, 0),
    ],
    constructor: function RecurSequence(transform, frontValue){
        this.transform = transform;
        this.frontValue = frontValue;
    },
    // Call this to set the initial value of the generator.
    // Necessarily resets the state of the sequence.
    seed: function(value){
        this.frontValue = value;
        return this;
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue = this.transform(this.frontValue);
    },
    copy: function(){
        return new RecurSequence(this.transform, this.frontValue);
    },
});

// Produce a sequence via repeated application of a transformation function
// to some seed value.
export const recur = wrap({
    name: "recur",
    summary: "Get a sequence by repeatedly applying a function to the last value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a transformation function and an optional
            seed value as input.
            When no seed value was given, #undefined is used as a default.
        `),
        returns: (`
            The function returns a sequence which begins with the seed value
            and where every successive element is the value produced by
            applying the given transformation function to the previous element.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.transformation,
            wrap.expecting.anything,
        ],
    },
    implementation: (transform, seedValue) => {
        return new RecurSequence(transform, seedValue);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.recur(i => i * 2).seed(1);
            hi.assert(seq.startsWith([1, 2, 4, 8, 16, 32, 64]));
        },
        "seedInput": hi => {
            const seq = hi.recur(i => i + 1, 0);
            hi.assert(seq.startsWith([0, 1, 2, 3, 4, 5]));
        },
        "unspecifiedSeed": hi => {
            const seq = hi.recur(i => (i || 0) + 1);
            hi.assert(seq.startsWith([undefined, 1, 2, 3, 4, 5, 6, 7]));
        },
    },
});

export default recur;
