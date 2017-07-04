import {asSequence} from "../core/asSequence";

/**
 * Determine equality of one or more sequences given a comparison function.
 * When only one sequence is given as input, the output is always true.
 * When no comparison function is given, (a, b) => (a == b) is used as a default.
 * @param {*} compare
 * @param {*} sources
 */
const equals = (compare, sources) => {
    const compareFunc = compare || ((a, b) => (a == b));
    if(sources.length <= 1){
        return true;
    }else if(sources.length === 2){
        const sequence = asSequence(sources[0]);
        for(const element of sources[1]){
            if(sequence.done()) return false;
            if(!compareFunc(sequence.nextFront(), element)) return false;
        }
        return sequence.done();
    }else{
        const sequences = [];
        for(const source of sources) sequences.push(asSequence(source));
        while(!sequences[0].done()){
            const element = sequences[0].nextFront();
            for(let i = 1; i < sequences.length; i++){
                if(sequences[i].done()) return false;
                if(!compareFunc(element, sequences[i].nextFront())) return false;
            }
        }
        for(const sequence of sequences){
            if(!sequence.done()) return false;
        }
        return true;
    }
};

export const registration = {
    name: "equals",
    expected: {
        functions: "?",
        sequences: "+",
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: equals,
};

export default equals;
