import {wrap} from "../core/wrap";

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
        const source = sources[0];
        const search = sources[1];
        if(source.length && search.length){
            // Can't end with a sequence longer than the sequence itself.
            if(source.length() < search.length()) return false;
        }
        // If either input isn't bidirectional, it needs to be fully in memory.
        if(!source.back) source.forceEager();
        if(!search.back) search.forceEager();
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
