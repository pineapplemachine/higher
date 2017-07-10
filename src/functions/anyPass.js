import {wrap} from "../core/wrap";

// Get a predicate that passes when at least one of the given predicates pass.
export const anyPass = wrap({
    name: "anyPass",
    attachSequence: false,
    async: false,
    arguments: {
        unordered: {
            functions: "*"
        }
    },
    implementation: (predicates) => {
        if(predicates.length === 0){
            return () => false;
        }else if(predicates.length === 1){
            return predicates[0];
        }else if(predicates.length === 2){
            const a = predicates[0];
            const b = predicates[1];
            return (...args) => (a(...args) || b(...args));
        }else{
            return (...args) => {
                for(const predicate of predicates){
                    if(predicate(...args)) return true;
                }
                return false;
            };
        }
    },
});

export default anyPass;
