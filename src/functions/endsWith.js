import {isEqual} from "../core/isEqual";
import {wrap} from "../core/wrap";

import {EagerSequence} from "./eager";

// Determine equality of one or more sequences given a comparison function.
// When only one sequence is given as input, the output is always true.
export const endsWith = wrap({
    name: "endsWith",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2,
        }
    },
    implementation: (compare, sources) => {
        let source = sources[0];
        let search = sources[1];
        if(source.length && search.length){
            // Can't end with a sequence longer than the sequence itself.
            if(source.length() < search.length()) return false;
        }
        // Both input sequences must be bidirectional
        source = source.back ? source : new EagerSequence(source);
        search = search.back ? search : new EagerSequence(search);
        const compareFunc = compare || isEqual;
        while(!search.done()){
            if(source.done() || !compareFunc(source.nextBack(), search.nextBack())){
                return false;
            }
        }
        return true;
    },
});

export default endsWith;
