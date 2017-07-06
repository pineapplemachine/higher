import {wrap} from "../core/wrap";

// Get the last element in a sequence or, if a predicate is passed,
// get the last element meeting that predicate.
export const last = wrap({
    name: "last",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        if(predicate){
            let back = null;
            while(!source.done()){
                back = source.back();
                if(predicate(back)) return back;
                source.popBack();
            }
        }else if(!source.done()){
            return source.back();
        }
        return undefined;
    },
});

export default last;
