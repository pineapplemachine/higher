import {isSequence} from "../core/sequence";
import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

import {newArray} from "./newArray";

export const arrayDeep = wrap({
    name: "arrayDeep",
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
            The function always returns new arrays, never existing array objects.
        `),
        returnType: "array",
        examples: [
            "basicUsage",
        ],
        related: [
            "array", "newArray",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.boundedSequence,
    },
    implementation: (source) => {
        // TODO: Handle cyclic references
        const array = [];
        for(const element of source){
            if(isArray(element) || (isSequence(element) && element.bounded())){
                array.push(arrayDeep(element));
            }else{
                array.push(element);
            }
        }
        return array;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // This is a sequence of sequences.
            const seq = hi.mapIndex(i => hi.range(i + 1)).head(3);
            hi.assert(hi.isSequence(seq));
            hi.assert(hi.isSequence(seq.index(0)));
            // And from it is created an array of arrays.
            const array = seq.arrayDeep();
            hi.assert(hi.isArray(array));
            hi.assert(hi.isArray(array[0]));
            // Which contains these numbers:
            hi.assertEqual(array, [[0], [0, 1], [0, 1, 2]]);
        },
        "emptyInput": hi => {
            const array = hi.emptySequence().arrayDeep();
            hi.assert(hi.isArray(array));
            hi.assert(array.length === 0);
        },
        "unboundedElementInInput": hi => {
            const array = hi([0, hi.range(3), hi.counter()]).arrayDeep();
            hi.assert(array[0] === 0);
            hi.assertEqual(array[1], [0, 1, 2]);
            hi.assert(hi.isArray(array[1]));
            hi.assert(hi.isSequence(array[2]));
        },
        "modifyOutput": hi => {
            const array = [[0, 1, 2]];
            const output = hi.arrayDeep(array);
            output[0][0] = 10;
            hi.assertEqual(output, [[10, 1, 2]]);
            // Input is not modified
            hi.assertEqual(array, [[0, 1, 2]]);
        },
    },
});

export default arrayDeep;
