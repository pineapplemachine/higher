import {wrap} from "../core/wrap";

// Get whether all elements in a sequence match a predicate or,
// if no predicate is provided, whether all the elements are truthy.
// Returns true when the input is an empty sequence.
export const all = wrap({
    name: "all",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (predicate, source) => {
        if(predicate){
            for(const element of source){
                if(!predicate(element)) return false;
            }
        }else{
            for(const element of source){
                if(element) return element;
            }
        }
        return true;
    },
});

export default all;
