import {asSequence} from "../core/asSequence";
import {constants} from "../core/constants";
import {canGetLength, getLength} from "../core/length";
import {wrap} from "../core/wrap";

// Determine equality of one or more sequences given a comparison function.
// When only one sequence is given as input, the output is always true.
export const startsWith = wrap({
    name: "startsWith",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2,
            allowIterables: true
        }
    },
    implementation: (compare, sources) => {
        const source = sources[0];
        const search = sources[1];
        if(canGetLength(source) && canGetLength(search)){
            // Can't start with a sequence longer than the sequence itself.
            if(getLength(source) < getLength(search)) return false;
        }
        const sequence = asSequence(source);
        const compareFunc = compare || constants.defaults.comparisonFunction;
        for(const element of search){
            if(sequence.done() || !compareFunc(sequence.nextFront(), element)){
                return false;
            }
        }
        return true;
    },
});

export default startsWith;
