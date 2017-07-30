import {isSequence} from "../core/sequence";
import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

import {newArray} from "./newArray";

import {NotBoundedError} from "../errors/NotBoundedError";

export const newArrayDeep = wrap({
    name: "newArrayDeep",
    summary: "Recursively acquire an in-memory array from a sequence potentially containing more sequences.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single known-bounded sequence as input.
        `),
        returns: (`
            The function returns an array containing the elements of the input
            sequence. Elements of that input sequence that were known-bounded
            arrays also recursively have the operation applied to them, such
            that a sequence of sequences becomes an array of arrays, and so on.
            /Sequences which directly represent the contents of an in-memory
            array will have a copy of that array given as output.
            If it is not necessary to preserve the original arrays in case of
            modification, or if the output of this function will not be
            modified, then it will be more efficient to call @arrayDeep instead.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "array", "newArray", "arrayDeep",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: (source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to create array from sequence.",
        });
        const result = newArray(source);
        for(let i = 0; i < result.length; i++){
            if(isSequence(result[i]) && result[i].bounded()){
                result[i] = newArrayDeep(result[i]);
            }else if(isArray(result[i])){
                result[i] = result[i].slice();
            }
        }
        return result;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // This is a sequence of sequences.
            const seq = hi.mapIndex(i => hi.range(i + 1)).head(3);
            hi.assert(hi.isSequence(seq));
            hi.assert(hi.isSequence(seq.index(0)));
            // And from it is created an array of arrays.
            const array = seq.newArrayDeep();
            hi.assert(hi.isArray(array));
            hi.assert(hi.isArray(array[0]));
            // Which contains these numbers:
            hi.assertEqual(array, [[0], [0, 1], [0, 1, 2]]);
        },
        "emptyInput": hi => {
            const array = hi.emptySequence().newArrayDeep();
            hi.assert(hi.isArray(array));
            hi.assert(array.length === 0);
        },
        "unboundedElementInInput": hi => {
            const array = hi([0, hi.range(3), hi.counter()]).newArrayDeep();
            hi.assert(array[0] === 0);
            hi.assertEqual(array[1], [0, 1, 2]);
            hi.assert(hi.isArray(array[1]));
            hi.assert(hi.isSequence(array[2]));
        },
        "modifyOutput": hi => {
            const array = [[0, 1, 2]];
            const output = hi.newArrayDeep(array);
            output[0][0] = 10;
            hi.assertEqual(output, [[10, 1, 2]]);
            // Input is not modified
            hi.assertEqual(array, [[0, 1, 2]]);
        },
    },
});

export default newArrayDeep;
