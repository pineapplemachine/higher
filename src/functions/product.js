import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

// Get the product of the numbers in a sequence.
// Returns 1 when the input was empty.
export const product = wrap({
    name: "product",
    summary: "Get the product of the numbers in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        expects: (`
            The function expects as input a single known-bounded sequence
            containing numbers.
        `),
        returns: (`
            The function returns the product of the values in the input
            sequence. If the sequence was empty, the function returns 1.
            If there were any values in the sequence that weren't numbers, then
            the function returns NaN.
        `),
        throws: (`
            The function throws a @NotBoundedError when the input sequence was
            not known to be bounded.
        `),
        related: [
            "sumLinear", "sumKahan", "sumShew"
        ],
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to compute product",
        });
        let product = 1;
        for(const value of source) product *= value;
        return product;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.product([2, 3, 4]) === 24);
            hi.assert(hi.product([8, 8]) === 64);
        },
        "variousInputs": hi => {
            hi.assert(hi.product([3, 2, 1, 0]) === 0);
            hi.assert(hi.product([10, 20]) === 200);
            hi.assert(hi.product([6, 1, 1, 1, 1, 1]) === 6);
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().product() === 1);
        },
        "singleLengthInput": hi => {
            hi.assert(hi.product([0]) === 0);
            hi.assert(hi.product([1]) === 1);
            hi.assert(hi.product([2]) === 2);
            hi.assert(hi.product([50]) === 50);
        },
        "numericStringInput": hi => {
            // Weird case but it's more work to invalidate than to just accept it
            hi.assert(hi.product([2, "3"]) === 6);
            hi.assert(hi.product(["5", "6"]) === 30);
        },
        "nanInput": hi => {
            hi.assertNaN(hi.product(["not a number"]));
            hi.assertNaN(hi.product([1, 2, 3, "?"]));
        },
        "notKnownBoundedInput": hi => {
            hi.assertFail(
                (error) => (error.type === "NotBoundedError"),
                () => hi.recur(i => i + 1).seed(0).until(i => i === 10).product()
            );
        },
        "unboundedInput": hi => {
            hi.assertFail(
                (error) => (error.type === "NotBoundedError"),
                () => hi.counter().product()
            );
        },
    },
});

export default product;
