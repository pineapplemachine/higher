import {wrap} from "../core/wrap";

// Get the minimum value in a sequence as judged by a relational function.
// If no relational function is provided, then (a, b) => (a < b) is used.
export const min = wrap({
    name: "min",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (relate, source) => {
        const relateFunc = relate || hi.defaultRelationalFunction;
        let min = undefined;
        let first = true;
        for(const element of source){
            if(first){
                min = element;
                first = false;
            }else if(relateFunc(element, min)){
                min = element;
            }
        }
        return min;
    },
});

export default min;
