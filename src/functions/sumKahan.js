import {wrap} from "../core/wrap";

export const sumKahan = wrap({
    name: "sumKahan",
    summary: "Sum the numbers in a sequence in order, keeping an error compensation term.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence as input.
            For best results, all the elements in the sequence should
            be numeric.
        `),
        returns: (`
            The function returns the sum of the values in the input sequence
            as computed using the Kahan summation algorithm. The function
            returns #0 when the input sequence was empty.
        `),
        developers: (`
            The Kahan summation algorithm is more accurate than
            [linear summation](sumLinear) but the accuracy comes with a
            performance cost. Note that the results may still be less than
            completely accurate due to intermediate rounding errors.
            /When accuracy is critically important, firstly write your math logic
            in some language other than JavaScript and secondly, if that's
            not a viable option, then see the @sumShew function for a more
            accurate floating point summation algorithm.
            /See the [specialCaseInputs](sumKahan.tests.specialCaseInputs)
            test case for an explanation of outputs in case of #NaN or #Infinity
            inputs or intermediate overflow.
        `),
        returnType: "number",
        related: [
            "sumLinear", "sumShew",
        ],
        examples: [
            "basicUsage",
        ],
        links: [
            {
                description: "Kahan summation algorithm on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Kahan_summation_algorithm",
            },
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        let sum = 0;
        let compensation = 0; // Error compensation term
        let overflow = false; // Track intermediate overflow
        for(const value of source){
            if(isNaN(value)){
                return value;
            }else if(!isFinite(value)){
                if(overflow || isFinite(sum)){
                    sum = value;
                }else{
                    const n = value + sum;
                    if(isNaN(n)) return n;
                }
            }else if(isFinite(sum)){
                const y = value - compensation;
                const t = sum + y;
                compensation = (t - sum) - y;
                sum = t;
                overflow = !isFinite(sum);
            }
        }
        return sum;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.sumKahan([1, 2, 3, 4]) === 10);
        },
        "noInputs": hi => {
            hi.assert(hi.sumKahan([]) === 0);
        },
        "specialCaseInputs": hi => {
            const Max = Number.MAX_VALUE;
            // Any NaN in input produces NaN output
            hi.assertNaN(hi.sumKahan([1, 2, 3, NaN]));
            // Different-sign infinities produce NaN output
            hi.assertNaN(hi.sumKahan([+Infinity, -Infinity]));
            // When any input is Infinity, without NaN or any opposite-sign Infinity,
            // the output is same-sign Infinity.
            hi.assert(hi.isPositiveInfinity(hi.sumKahan([-1, -2, +Infinity, -3])));
            hi.assert(hi.isNegativeInfinity(hi.sumKahan([+1, +2, -Infinity, +3])));
            // This is the case even when there was intermediate overflow.
            hi.assert(hi.isPositiveInfinity(hi.sumKahan([-Max, -Max, +Infinity])));
            hi.assert(hi.isNegativeInfinity(hi.sumKahan([+Max, +Max, -Infinity])));
            // Intermediate overflow in absence of NaN or Infinity produces same-sign Infinity.
            hi.assert(hi.isPositiveInfinity(hi.sumKahan([+Max, +Max, -Max])));
            hi.assert(hi.isNegativeInfinity(hi.sumKahan([-Max, -Max, +Max])));
        },
    },
});

export default sumKahan;
