import {wrap} from "../core/wrap";

export const identity = wrap({
    name: "identity",
    summary: "A function accepting a single argument that always returns its input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        expects: (`
            The function expects a single argument of any kind.
        `),
        returns: (`
            The function returns the argument it was called with.
        `),
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        anything: true
    },
    implementation: (value) => {
        return value;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.identity(0) === 0);
            hi.assert(hi.identity("hello") === "hello");
        },
        "objectInput": hi => {
            const a = {"hello": "world"};
            hi.assert(hi.identity(a) === a); // Doesn't copy the object
        },
        "sequenceMethod": hi => {
            const seq = hi([0, 1, 2]);
            hi.assert(seq.identity() === seq);
        },
    },
});

export default identity;
