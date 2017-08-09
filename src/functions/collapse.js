import {error} from "../core/error";
import {isSequence} from "../core/sequence";
import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";
import {OperationError} from "../errors/OperationError";

import {ArraySequence} from "./arrayAsSequence";

// Used internally by collapse function to write a sequence to an array.
const write = function(sequence, root){
    if(!sequence.bounded()) throw NotBoundedError(sequence, {
        message: "Failure handling intermediate sequence during collapse",
    });
    let i = 0;
    while(!sequence.done()){
        const value = sequence.nextFront();
        if(i < root.length) root[i] = value;
        else root.push(value);
        i++;
    }
    return i;
};

// Used internally by collapse function to collapse out-of-place, i.e. when
// there simply is no way to do the operation entirely in-place.
const collapseOutOfPlace = function(sequence, traverse){
    const root = traverse.root();
    if(!isArray(root)) throw CollapseRootError(sequence);
    const array = [];
    for(const element of sequence) array.push(element);
    root.length = array.length;
    for(let i = 0; i < root.length; i++) root[i] = array[i];
    return root;
};

export const CollapseRootError = error({
    summary: "Failed to collapse a sequence due to not having an array at its root.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence for which
            collapsing failed.
        `),
    },
    constructor: function CollapseRootError(sequence){
        this.sequence = sequence;
        this.message = (
            "Only sequences which have an array at their root may be " +
            `collapsed, but this is not true of the ${sequence.typeChainString()} ` +
            "input sequence. To acquire other sequences in-memory, try the " +
            "'array', 'write', 'string', and 'object' methods."
        );
    },
});

export const collapse = wrap({
    name: "collapse",
    summary: "Write the contents of a sequence to the array at its root.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Given a sequence with an array at its root, the function consumes
            that sequence and writes its contents to that array.
            Except for in a small subset of cases, no intermediate arrays will
            be created.
        `),
        expects: (`
            The function expects one sequence with an array at its root and an
            optional numeric limit specifying the maximum number of elements to
            write to that array.
            Either the input sequence must be bounded or a maximum number of
            elements to consume must be provided.
        `),
        returns: (`
            The function returns the root array that was written to.
        `),
        warnings: (`
            Some sequence types implement a collapseBreak method because they
            must be specially handled when being collapsed. Every such sequence
            in the chain of the sequence that is being collapsed entails a
            performance penalty; for smaller sequences or chains with few breaks
            this should be negligible, but if the sequence is long or the chain
            contains many breaks, it may be more efficient to produce a new
            array out-of-place instead using the @array function.
        `),
        developers: (`
            Sequence types with a collapseBreak method necessitate writing their
            contents fully to the array before continuing up the sequence chain,
            and may cause a substantial performance impact for very long
            sequences. For long sequences or sequences with many breaks in their
            chain, it may be preferable to produce an out-of-place array.
            /Collapsing is not possible if any sequence in the chain that follows
            one with a collapseBreak method does not support a rebase operation,
            or if a sequence itself having a collapseBreak method does not
            support a rebase operation.
            /Note that this failure would indicate an issue with a sequence
            implementation, not a usage error.
        `),
        examples: [
            "basicUsage"
        ],
        related: [
            "write", "array", "newArray"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            sequences: {one: wrap.expecting.boundedSequence},
        },
    },
    implementation: (sequence) => {
        // Get the sequence chain and keep track of any breaks found therein
        let traverse = sequence;
        const stack = [];
        const breaks = [];
        let i = 0;
        while(traverse && isSequence(traverse)){
            if(traverse.collapseBreak) breaks.push(stack.length);
            if(traverse.collapseOutOfPlace) return collapseOutOfPlace(sequence, traverse);
            stack.push(traverse);
            traverse = traverse.source;
        }
        // Found the root; error out if the root is undefined or not an array
        const root = traverse;
        if(!isArray(root)) throw CollapseRootError(sequence);
        // If no breaks were found in the chain, write all at once and be done with it
        if(!breaks.length){
            root.length = write(sequence, root);
            return root;
        }
        // Get an ArraySequence with the root as its source
        const frontSequence = stack[stack.length - 1]; // Front of sequence chain
        const arraySequence = (frontSequence instanceof ArraySequence ?
            frontSequence : new ArraySequence(root)
        );
        // For every breaking sequence in the chain...
        for(let j = breaks.length - 1; j >= 0; j--){
            // Get a reference to the sequence responsible
            const breakIndex = breaks[j];
            const breaking = stack[breakIndex];
            // Get references to the preceding and following sequences
            const prev = stack[breakIndex + 1];
            const next = stack[breakIndex - 1];
            // If this isn't the very first sequence in the chain...
            if(prev){
                // This error really shouldn't happen!
                if(!breaking.rebase) throw OperationError(breaking, "rebase", {
                    message: "Failure collapsing sequence",
                });
                // Collapse the sequence up to the breaking sequence
                i = write(prev, root);
                // Rebase the breaking sequence
                arraySequence.backIndex = i;
                breaking.rebase(arraySequence);
            }else{
                // If this is the first sequence, the next step still needs to
                // know how many elements of the array to read
                i = root.length;
            }
            // Do the break! This might involve reversing, repeating, shuffling...
            i = breaking.collapseBreak(root, i);
            // If there's a following sequence in the chain, rebase it so that
            // it refers to the collapsed-thus-far array.
            if(next){
                // This error really shouldn't happen either!
                if(!next.rebase) throw OperationError(next, "rebase", {
                    message: "Failure collapsing sequence",
                });
                // Rebase the next sequence in the chain
                arraySequence.backIndex = i;
                next.rebase(arraySequence);
            }
        }
        // If the last break isn't also the last sequence in the chain,
        // collapse everything following it.
        if(breaks[0] !== 0){
            i = write(stack[0], root);
        }
        // Set the final length of the array to however many elements ended
        // up being written there
        root.length = i;
        // All done!
        return root;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5];
            hi.map(array, i => i * i).collapse();
            hi.assertEqual(array, [1, 4, 9, 16, 25]);
        },
        "returnsRoot": hi => {
            const array = [0, 1, 2];
            const returned = hi.map(array, i => i + 1).collapse();
            hi.assert(array === returned);
            hi.assertEqual(array, [1, 2, 3]);
        },
        "emptyOutput": hi => {
            const array = [1, 2, 3, 4, 5];
            hi.filter(array, i => false).collapse();
            hi.assertEmpty(array);
        },
        "collapseDistinct": hi => {
            // Invovles collapseOutOfPlace
            const array = [1, 2, 4, 3, 2, 4, 1, 6, 8, 7, 3, 4, 5];
            hi.map(array, i => -i).distinct().map(array, i => -i).collapse();
            hi.assertEqual(array, [1, 2, 4, 3, 6, 8, 7, 5]);
        },
        "collapseFiniteRepeat": hi => {
            // Invovles collapseBreak
            const array = [1, 2, 3];
            hi.repeat(2, array).enumerate().map(i => i.index + i.value).collapse();
            hi.assertEqual(array[1 + 0, 2 + 1, 3 + 2, 1 + 3, 2 + 4, 3 + 5]);
        },
        "collapseInfiniteRepeat": hi => {
            // Invovles collapseBreak
            const array = [1, 2, 3];
            hi.repeat(array).enumerate().head(6).map(i => i.index + i.value).collapse();
            hi.assertEqual(array[1 + 0, 2 + 1, 3 + 2, 1 + 3, 2 + 4, 3 + 5]);
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.repeat([1, 2, 3]).collapse());
        },
        "noArrayRoot": hi => {
            hi.assertFailWith(CollapseRootError, () => hi.range(10).collapse());
            hi.assertFailWith(CollapseRootError, () => hi.head("string", 3).collapse());
        },
    },
});

export default collapse;
