import {wrap} from "../core/wrap";

// Get the first element in a sequence or, if a predicate is passed,
// get the first element meeting that predicate.
export const first = wrap({
    name: "first",
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
                if(predicate(element)) return element;
            }
        }else{
            for(const element of source) return element;
        }
        return undefined;
    },
});

export default first;
