import {asSequence} from "../core/asSequence";
import {wrap} from "../core/wrap";

// Get the lexicographic ordering of two sequences.
// Returns +1 when the first input follows the second.
// Returns 0 when the inputs are equal.
// Returns -1 when the first input precedes the second.
export const lexOrder = wrap({
    name: "lexOrder",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2,
            allowIterables: true
        }
    },
    implementation: (order, sequences) => {
        const orderFunc = order || hi.defaultOrderingFunction;
        const a = asSequence(sequences[0]);
        const b = sequences[1];
        for(const element of b){
            if(a.done()) return -1;
            const cmp = orderFunc(a.nextFront(), element);
            if(cmp != 0) return cmp;
        }
        return a.done() ? 0 : 1;
    }
});

export default lexOrder;
