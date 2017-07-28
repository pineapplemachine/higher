import {wrap} from "../core/wrap";

import {CounterSequence} from "./counter";
import {SingularMapSequence} from "./map";

// TODO: Possibly implement a new MapIndexSequence type rather than returning
// a CounterSequence.SingularMapSequence. A single new sequence type ought to be
// slightly more performant than this sequence type chain.
export const mapIndex = wrap({
    name: "mapIndex",
    summary: "Produce a sequence with a transformation upon the natural numbers.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single [transformation function] as input.
        `),
        returns: (`
            The function returns a sequence produced by applying the received
            transformation function to the integers in order, beginning with and
            including zero.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "map", "range", "counter",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function,
    },
    implementation: (transform) => {
        return new SingularMapSequence(transform, new CounterSequence());
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const squares = hi.mapIndex(i => i * i);
            hi.assert(squares.startsWith([0, 1, 4, 9, 16, 25]));
            hi.assert(squares.index(10) === 100);
        },
        "identityFunctionInput": hi => {
            hi.assert(hi.mapIndex(hi.identity).startsWith([0, 1, 2, 3, 4, 5]));
        },
        "produceSequenceOfSequences": hi => {
            const seq = hi.mapIndex(i => hi.range(i)).head(4);
            hi.assertEqual(seq, [[], [0], [0, 1], [0, 1, 2]]);
        },
    },
});

export default mapIndex;
