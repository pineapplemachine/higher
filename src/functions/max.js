import {wrap} from "../core/wrap";

// Get the maximum value in a sequence as judged by a relational function.
// If no relational function is provided, then (a, b) => (a < b) is used.
export const max = wrap({
    name: "max",
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
        let max = undefined;
        let first = true;
        for(const element of source){
            if(first){
                max = element;
                first = false;
            }else if(relateFunc(max, element)){
                max = element;
            }
        }
        return max;
    },
});

export default max;
