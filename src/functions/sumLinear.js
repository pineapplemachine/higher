import {wrap} from "../core/wrap";

// For users who really can't be bothered to know how the various
// summation functions are differentiated, stick to the principle of least
// astonishment. Most users are acquainted with linear summation, perhaps
// less so with Kahan and Shewchuk algorithms: So alias "sum" to "sumLinear".
export const sumLinear = wrap({
    names: ["sumLinear", "sum"],
    summary: "Sum the numbers in a sequence in order from first to last.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence as input.
            For best results, all the elements in the sequence should
            be numeric.
        `),
        returns: (`
            The function returns the linearly-accumulated sum of the values in
            the input sequence. The function returns #0 when the input sequence
            was empty.
        `),
        developers: (`
            Linear summation is the most performant summation algorithm
            available for summing numbers. It is perfectly adequate for
            summing integers. However, it may suffer from accuracy issues
            due to intermediate rounding errors when summing floating point
            values.
            /When accuracy is very important, firstly write your math logic
            in some language other than JavaScript and secondly, if that's
            not a viable option, then see the @sumKahan and @sumShew functions
            for more accurate floating point summation.
            /See the [specialCaseInputs](sumLinear.tests.specialCaseInputs)
            test case for an explanation of outputs in case of #NaN or #Infinity
            inputs or intermediate overflow.
        `),
        returnType: "number",
        related: [
            "sumKahan", "sumShew",
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
        let sum = 0;
        for(const value of source) sum += value;
        return sum;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.sumLinear([1, 2, 3, 4]) === 10);
        },
        "noInputs": hi => {
            hi.assert(hi.sumLinear([]) === 0);
        },
        "specialCaseInputs": hi => {
            const Max = Number.MAX_VALUE;
            // Any NaN in input produces NaN output
            hi.assertNaN(hi.sumLinear([1, 2, 3, NaN]));
            // Different-sign infinities produce NaN output
            hi.assertNaN(hi.sumLinear([+Infinity, -Infinity]));
            // Overflow followed by opposite-sign infinity produces NaN output
            hi.assertNaN(hi.sumLinear([+Max, +Max, -Infinity]));
            hi.assertNaN(hi.sumLinear([-Max, -Max, +Infinity]));
            // Literal infinity produces Infinity output when not accompanied by NaN
            // or by opposite-sign Infinity.
            hi.assert(hi.isPositiveInfinity(hi.sumLinear([-1, -2, +Infinity, -3])));
            hi.assert(hi.isNegativeInfinity(hi.sumLinear([+1, +2, -Infinity, +3])));
            // Intermediate overflow produces same-sign Infinity.
            hi.assert(hi.isPositiveInfinity(hi.sumLinear([+Max, +Max, -Max])));
            hi.assert(hi.isNegativeInfinity(hi.sumLinear([-Max, -Max, +Max])));
        },
    },
});

export const sum = sumLinear;

export default sumLinear;
