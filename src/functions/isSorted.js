import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

export const isSorted = wrap({
    name: "isSorted",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (relate, source) => {
        const relateFunc = relate || constants.defaults.relationalFunction;
        let last = undefined;
        let first = true;
        for(const element of source){
            if(first){
                first = false;
            }else if(relateFunc(element, last)){
                return false;
            }
            last = element;
        }
        return true;
    },
});

export default isSorted;
