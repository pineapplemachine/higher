import {expecting, wrap} from "../core/wrap";

// Perform a linear summation of values in a sequence.
// Suitable for integers and low-accuracy floating point sums.
// Returns 0 for empty inputs.
// For users who really can't be bothered to know how the various
// summation functions are differentiated, stick to the principle of least
// astonishment. Most users are acquainted with linear summation, perhaps
// less so with Kahan and Shewchuk algorithms: alias "sum" to "sumLinear".
export const sumLinear = wrap({
    names: ["sumLinear", "sum"],
    attachSequence: true,
    async: true,
    arguments: {
        one: expecting.iterable
    },
    implementation: (source) => {
        let sum = 0;
        for(const value of source) sum += value;
        return sum;
    },
});

export const sum = sumLinear;

export default sumLinear;
