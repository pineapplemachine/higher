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

// Compute a sum of numbers using the Kahan summation algorithm.
// https://en.wikipedia.org/wiki/Kahan_summation_algorithm
// More accurate than linear summation, but slower.
// Less accurate than Shewchuk's summation algorithm, but faster.
// If any input is NaN, returns the first NaN input.
// If any input is +inf and no inputs are -inf, returns +inf.
// If any input is -inf and no inputs are +inf, returns -inf.
// If any input is +inf and any input is -inf, returns NaN.
// In case of intermediate positive overflow, returns +inf.
// In case of intermediate negative overflow, returns -inf.
export const sumKahan = wrap({
    name: "sumKahan",
    attachSequence: true,
    async: true,
    arguments: {
        one: expecting.iterable
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
});

// Compute a sum of numbers using Shewchuk's summation algorithm.
// http://stackoverflow.com/a/2704565/3478907
// http://code.activestate.com/recipes/393090-binary-floating-point-summation-accurate-to-full-p/
// https://github.com/python/cpython/blob/master/Modules/mathmodule.c#L1301
// More accurate than either Kahan or linear summation, but slower.
// Guarantees associativity, i.e. ordering of values in the input doesn't matter.
// You probably don't REALLY need your sums to be this accurate.
// If any input is NaN, returns the first NaN input.
// If any input is +inf and no inputs are -inf, returns +inf.
// If any input is -inf and no inputs are +inf, returns -inf.
// If any input is +inf and any input is -inf, returns NaN.
// In case of intermediate positive overflow, returns +inf.
// In case of intermediate negative overflow, returns -inf.
export const sumShew = wrap({
    name: "sumShew",
    attachSequence: true,
    async: true,
    arguments: {
        one: expecting.iterable
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
});

export default sumLinear;
