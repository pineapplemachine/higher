import {asSequence} from "../core/asSequence";
import {wrap} from "../core/wrap";

export const equals = wrap({
    name: "equals",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: "+",
            allowIterables: true
        }
    },
    implementation: (compare, sources) => {
        const compareFunc = compare || hi.defaultComparisonFunction;
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
    },
});

export default equals;
