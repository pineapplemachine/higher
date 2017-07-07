import {wrap} from "../core/wrap";

// Get whether any element in a sequence matches a predicate or,
// if no predicate is provided, whether any of the elements are truthy.
// With no predicate, returns the first truthy element, or false if there
// is no truthy element.
// Returns false when the input is an empty sequence.
export const any = wrap({
    name: "any",
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
                if(predicate(element)) return true;
            }
        }else{
            for(const element of source){
                if(element) return element;
            }
        }
        return false;
    },
});

export default any;
