import {defineSequence} from "../core/defineSequence";
import {asSequence, validAsSequence} from "../core/asSequence";
import {wrap} from "../core/wrap";

export const FlattenSequence = defineSequence({
    summary: "Enumerate in series the elements of a sequence's subsequences.",
    collapseOutOfPlace: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single sequence as input.
        `),
    },
    constructor: function FlattenSequence(
        source, frontSource = undefined
    ){
        this.source = source;
        this.frontSource = frontSource;
    },
    initializeFront: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            this.frontSource = asSequence(this.source.nextFront());
        }
    },
    bounded: () => false,
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.frontSource) this.initializeFront();
        return !this.frontSource || this.frontSource.done();
    },
    front: function(){
        if(!this.frontSource) this.initializeFront();
        return this.frontSource.front();
    },
    popFront: function(){
        if(!this.frontSource) this.initializeFront();
        this.frontSource.popFront();
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            this.frontSource = asSequence(this.source.nextFront());
        }
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Flatten a single level deep.
export const flatten = wrap({
    name: "flatten",
    summary: "Get the elements of a sequence of sequences as one flat sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single sequence as input.
        `),
        returns: (`
            The function returns a sequence which enumerates in series the
            elements of every subsequence which is an element of the input
            sequence.
        `),
        developers: (`
            Note that elements of the input sequence that are not themselves
            sequences are ignored completely.
            /The output sequence, perhaps unintuitively, is never known-bounded
            and supports only a minimum of sequence operations.
            This is because the sequence cannot know in advance whether any of
            the subsequences are themselves known-bounded or known-unbounded,
            or if they support a given operation.
            One alternative to this function when it is very useful to have
            known boundedness and better support for sequence operations is
            to use @array to produce an array of sequences and then @concat to
            concatenate the sequences in that array.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "flattenDeep", "concat",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: (source) => {
        return new ForwardFlattenSequence(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const arrays = [[1, 2, 3], [4, 5], [6, 7, 8], [9]];
            hi.assertEqual(hi.flatten(arrays), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().flatten());
        },
        "emptySequenceElements": hi => {
            hi.assertEmpty(hi([[]]).flatten());
            hi.assertEmpty(hi([[], []]).flatten());
            hi.assertEmpty(hi([[], [], [], []]).flatten());
            hi.assertEqual(hi([[], [1, 2, 3]]).flatten(), [1, 2, 3]);
        },
        "nonSequenceElements": hi => {
            hi.assertEmpty(hi([1, 2, 3]).flatten());
            hi.assertEmpty(hi([[], 1, 2]).flatten());
            hi.assertEqual(hi([null, [1, 2], null]).flatten(), [1, 2]);
            hi.assertEqual(hi([1, hi.range(3), 2, [3, 4]]).flatten(), [0, 1, 2, 3, 4]);
        },
    },
});

export default flatten;
