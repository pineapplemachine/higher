import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

export const array = wrap({
    name: "array",
    summary: "Get an in-memory array of the elements in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single known-bounded sequence as input.
        `),
        returns: (`
            The function returns an array containing the elements of the
            input sequence or other iterable.
            If the input was already an array, the function returns that array.
        `),
        returnType: "array",
        examples: [
            "basicUsage", "arrayInput",
        ],
        related: [
            "newArray", "arrayDeep",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.either(
            wrap.expecting.array,
            wrap.expecting.boundedSequence,
        ),
    },
    implementation: (source) => {
        if(isArray(source)) return source;
        const array = [];
        for(const element of source) array.push(element);
        return array;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const odd = i => i % 2 !== 0;
            const square = i => i * i;
            const seq = hi.filter(odd, [1, 2, 3, 4, 5, 6, 7]).map(square);
            const array = seq.array();
            hi.assert(hi.isArray(array));
            hi.assertEqual(array, [1, 9, 25, 49]);
        },
        "arrayInput": hi => {
            const numbers = [1, 2, 3, 4];
            // Function returns the input array.
            hi.assert(hi.array(numbers) === numbers);
        },
        "emptyInput": hi => {
            const array = hi.emptySequence().array();
            hi.assert(hi.isArray(array));
            hi.assert(array.length === 0);
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().array());
        },
    },
});

export default array;
