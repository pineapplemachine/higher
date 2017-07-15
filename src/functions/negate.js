import {wrap} from "../core/wrap";

export const negate = wrap({
    name: "negate",
    summary: "Get the logical negation of a predicate function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        expects: (`
            The function expects a single predicate function as its input.
        `),
        returns: (`
            The function builds and returns a function returning true for
            which inputs producing a falsey value when passed to the
            inputted predicate and returning false for all inputs producing
            a truthy value when passed to that predicate.
        `),
        related: [
            "allPass", "anyPass", "nonePass"
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function
    },
    implementation: (predicate) => {
        return (...args) => (!predicate(...args));
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = (i) => (i % 2 === 0);
            const odd = hi.negate(even);
            hi.assert(even(2));
            hi.assert(odd(3));
        },
    },
});

export default negate;
