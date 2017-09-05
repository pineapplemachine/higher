import {asSequence} from "../core/asSequence";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const FlattenDeepSequence = defineSequence({
    summary: "Enumerate recursively and in series the elements of a sequence's subsequences.",
    collapseOutOfPlace: true,
    constructor: function FlattenDeepSequence(source){
        this.source = source;
        this.sourceStack = [source];
        this.frontSource = source;
        this.initializedFront = undefined;
    },
    // Used internally to handle progression to the next element.
    // Dive into the lowest possible sequence.
    diveStack: function(){
        while(!this.frontSource.done()){
            const front = this.frontSource.front();
            const source = asSequence(front);
            if(!source) break;
            this.frontSource.popFront();
            this.sourceStack.push(source);
            this.frontSource = source;
        }
    },
    // Used internally to handle progression to the next element.
    // Resurface from empty sequences (and those containing only empties)
    bubbleStack: function(){
        while(this.sourceStack.length > 1 && this.frontSource.done()){
            this.sourceStack.pop();
            this.frontSource = this.sourceStack[this.sourceStack.length - 1];
        }
        if(!this.frontSource.done()){
            this.diveStack();
            if(this.frontSource.done()) this.bubbleStack();
        }
    },
    initializeFront: function(){
        this.initializedFront = true;
        this.diveStack();
        if(this.frontSource.done()) this.bubbleStack();
    },
    bounded: () => false,
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.frontSource.done() && this.sourceStack[0].done();
    },
    front: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.frontSource.front();
    },
    popFront: function(){
        if(!this.initializedFront) this.initializeFront();
        this.frontSource.popFront();
        this.diveStack();
        if(this.frontSource.done()) this.bubbleStack();
    },
    rebase: function(source){
        this.source = source;
        this.sourceStack = [source];
        this.frontSource = source;
        return this;
    },
});

// Flatten recursively.
// Flattens arrays, iterables except strings, and sequences.
export const flattenDeep = wrap({
    name: "flattenDeep",
    summary: "Recursively get the elements of a sequence of sequences as one flat sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single sequence as input.
        `),
        returns: (`
            The function returns a sequence which enumerates in series the
            elements of the input that are not themselves sequences, and the
            elements of those that are sequences, and their elements, and so on.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "flatten", "concat",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: (source) => {
        return new FlattenDeepSequence(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const numbers = [0, [1], [2, [3, 4]], [], [[5]]];
            hi.assertEqual(hi.flattenDeep(numbers), [0, 1, 2, 3, 4, 5]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().flattenDeep());
        },
        "emptySequenceElements": hi => {
            hi.assertEmpty(hi([[]]).flattenDeep());
            hi.assertEmpty(hi([[], []]).flattenDeep());
            hi.assertEmpty(hi([[], [[], [[]]], [[]], []]).flattenDeep());
            hi.assertEqual(hi([[], [1, 2, 3]]).flattenDeep(), [1, 2, 3]);
        },
    },
});

export default flattenDeep;
