import {wrap} from "../core/wrap";

import {mustSupport} from "./mustSupport";

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
        source = mustSupport(source, "back");
        search = mustSupport(search, "back");
        const compareFunc = compare || ((a, b) => (a === b));
        while(!search.done()){
            if(source.done() || !compareFunc(source.nextBack(), search.nextBack())){
                return false;
            }
        }
        return true;
    },
});

export default endsWith;
