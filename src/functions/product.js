import {expecting, wrap} from "../core/wrap";

// Get the product of the numbers in a sequence.
// Returns 1 when the input was empty.
export const product = wrap({
    name: "product",
    attachSequence: true,
    async: true,
    arguments: {
        one: expecting.iterable
    },
    implementation: (source) => {
        let product = 1;
        for(const value of source) product *= value;
        return product;
    },
});

export default product;
