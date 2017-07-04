import {asSequence, canGetLength, getLength} from "../core/asSequence";

/**
 * Determine equality of one or more sequences given a comparison function.
 * When only one sequence is given as input, the output is always true.
 * When no comparison function is given, (a, b) => (a == b) is used as a default.
 * @param {*} compare
 * @param {*} sources
 */
const startsWith = (compare, sources) => {
    const source = sources[0];
    const search = sources[1];
    if(canGetLength(source) && canGetLength(search)){
        // Can't start with a sequence longer than the sequence itself.
        if(getLength(source) < getLength(search)) return false;
    }
    const sequence = asSequence(source);
    const compareFunc = compare || hi.defaultComparisonFunction;
    for(const element of search){
        if(sequence.done() || !compareFunc(sequence.nextFront(), element)){
            return false;
        }
    }
    return true;
};

export const registration = {
    name: "startsWith",
    expected: {
        functions: "?",
        sequences: 2,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: startsWith,
};

export default startsWith;
