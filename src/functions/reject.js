import {wrap} from "../core/wrap";

import {FilterSequence} from "./filter";

// Opposite of filter. Enumerate only those elements not matching a predicate.
export const reject = wrap({
    name: "reject",
    attachSequence: true,
    async: false,
    sequences: [
        FilterSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        return new FilterSequence(element => !predicate(element), source);
    },
});

export default reject;
