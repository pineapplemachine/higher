import {wrap} from "../core/wrap";

// You probably don't REALLY need your sums to be this accurate.
// http://stackoverflow.com/a/2704565/3478907
// http://code.activestate.com/recipes/393090-binary-floating-point-summation-accurate-to-full-p/
export const sumShew = wrap({
    name: "sumShew",
    summary: "Sum the numbers in a sequence using partial sums.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence as input.
            For best results, all the elements in the sequence should
            be numeric.
        `),
        returns: (`
            The function returns the sum of the values in the input sequence
            as computed using Jonathan Shewhuck's summation algorithm.
            The function returns #0 when the input sequence was empty.
            /This function is the only summation function implemented in higher
            which is guaranteed to always return the same output regardless of
            the order of its inputs.
        `),
        developers: (`
            Shewhuck's summation algorithm does not suffer from intermediate
            rounding errors, but the accuracy comes with a performance cost.
            /When accuracy is critically important, firstly write your math logic
            in some language other than JavaScript and secondly, if that's
            not a viable option, then use this function for floating point
            summation.
            /See the [specialCaseInputs](sumKahan.tests.specialCaseInputs)
            test case for an explanation of outputs in case of #NaN or #Infinity
            inputs or intermediate overflow.
        `),
        returnType: "number",
        related: [
            "sumLinear", "sumKahan",
        ],
        examples: [
            "basicUsage",
        ],
        links: [
            {
                description: "Jonathan Shewchuk's paper on floating point summation",
                url: "https://people.eecs.berkeley.edu/~jrs/papers/robustr.pdf",
            },
            {
                description: "Source for cpython's fsum function, based on Shewchuk's paper",
                url: "https://github.com/python/cpython/blob/master/Modules/mathmodule.c#L1301",
            },
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        let infSum = 0; // Handles infinite inputs
        let overflow = 0; // Handles intermediate overflow
        // Accumulate partial sums
        const partials = [];
        for(const value of source){
            if(isNaN(value)){
                return value;
            }else if(!isFinite(value)){
                infSum += value;
            }else if(infSum === 0 && overflow === 0){
                let x = value;
                let i = 0;
                for(const partial of partials){
                    let y = partial;
                    if(Math.abs(x) < Math.abs(y)){
                        const t = x; x = y; y = t;
                    }
                    const high = x + y;
                    const yr = high - x;
                    const low = y - yr;
                    if(low !== 0) partials[i++] = low;
                    x = high;
                }
                partials.splice(i);

                if(x !== 0){
                    if(!isFinite(x)) overflow = x;
                    else partials.push(x);
                }
            }
        }
        // Handle intermediate infinities
        if(infSum !== 0) return infSum;
        else if(overflow !== 0) return overflow;
        // Sum the partials
        let high = 0;
        if(partials.length !== 0){
            let low;
            let n = partials.length;
            high = partials[--n];
            while(n > 0){
                const x = high;
                const y = partials[--n];
                high = x + y;
                const yr = high - x;
                low = y - yr;
                if(low !== 0) break;
            }
            if(n > 0 && (
                (low < 0 && partials[n - 1] < 0) || (low > 0 && partials[n - 1] > 0)
            )){
                const y = low// 2;
                const x = high + y;
                const yr = x - high;
                if(y === yr) high = x;
            }
        }
        // All done, produce the result
        return high;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.sumShew([1, 2, 3, 4]) === 10);
        },
        "noInputs": hi => {
            hi.assert(hi.sumShew([]) === 0);
        },
        "specialCaseInputs": hi => {
            const Max = Number.MAX_VALUE;
            // Any NaN in input produces NaN output
            hi.assertNaN(hi.sumShew([1, 2, 3, NaN]));
            // Different-sign infinities produce NaN output
            hi.assertNaN(hi.sumShew([+Infinity, -Infinity]));
            // When any input is Infinity, without NaN or any opposite-sign Infinity,
            // the output is same-sign Infinity.
            hi.assert(hi.isPositiveInfinity(hi.sumShew([-1, -2, +Infinity, -3])));
            hi.assert(hi.isNegativeInfinity(hi.sumShew([+1, +2, -Infinity, +3])));
            // This is the case even when there was intermediate overflow.
            hi.assert(hi.isPositiveInfinity(hi.sumShew([-Max, -Max, +Infinity])));
            hi.assert(hi.isNegativeInfinity(hi.sumShew([+Max, +Max, -Infinity])));
            // Intermediate overflow in absence of NaN or Infinity produces same-sign Infinity.
            hi.assert(hi.isPositiveInfinity(hi.sumShew([+Max, +Max, -Max])));
            hi.assert(hi.isNegativeInfinity(hi.sumShew([-Max, -Max, +Max])));
        },
    },
});

export default sumShew;
