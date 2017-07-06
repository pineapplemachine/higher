import {wrap} from "../core/wrap";

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
});

export default sumKahan;
