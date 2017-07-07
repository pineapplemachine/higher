import {validAsBoundedSequence} from "../core/asSequence";
import {wrap} from "../core/wrap";

export const partition = wrap({
    name: "partition",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (predicate, source) => {
        if(!validAsBoundedSequence(source)){
            throw "Failed to partition sequence: Can't partition an unbounded sequence.";
        }
        const a = [];
        const b = [];
        for(const element of source){
            if(predicate(element)) a.push(element);
            else b.push(element);
        }
        return [a, b];
    },
});

export default partition;
