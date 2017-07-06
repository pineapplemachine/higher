import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

export const homogenous = wrap({
    name: "homogenous",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (compare, source) => {
        const compareFunc = compare || constants.defaults.comparisonFunction;
        let first = true;
        let firstElement = null;
        for(const element of source){
            if(first){
                firstElement = element;
                first = false;
            }else if(!compareFunc(element, firstElement)){
                return false;
            }
        }
        return true;
    },
});

export default homogenous;
