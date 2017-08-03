import {wrap} from "../core/wrap";

import {SingularMapSequence} from "./map";

export const pluck = wrap({
    name: "pluck",
    summary: "Get a sequence of the plucked attributes of each element in an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an input sequence and the attribute to be
            plucked from each element of that sequence.
        `),
        returns: (`
            The function returns a sequence enumerating the given attribute of
            each element in the input sequence.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "map",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [wrap.expecting.sequence, wrap.expecting.anything],
    },
    implementation: (source, attribute) => {
        return new SingularMapSequence(element => element[attribute], source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["hello", "how", "goes", "it"];
            hi.assertEqual(hi.pluck(strings, "length"), [5, 3, 4, 2]);
            const arrays = [[0, 1], [2, 3], [10, 11]];
            hi.assertEqual(hi.pluck(arrays, 0), [0, 2, 10]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().pluck(0));
        },
        "undefinedAttribute": hi => {
            hi.assertEqual(hi.pluck(["a", "b", "c"], 1), [
                undefined, undefined, undefined
            ]);
        },
    },
});

export default pluck;
