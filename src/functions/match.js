import {isArray, isFunction, isObject} from "../core/types";
import {wrap} from "../core/wrap";

import {wherePattern} from "./where";

export const match = wrap({
    name: "match",
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [] // + ...args
    },
    implementation: (value, ...patterns) => {
        let defaultValue = undefined;
        for(const pattern of patterns){
            if(!isArray(pattern) || pattern.length < 1){
                throw "Object is not a pattern."; // TODO: Better error
            }else if(pattern.length < 2){
                defaultValue = pattern[0];
            }else if(wherePattern(value, pattern[0])){
                return pattern[1];
            }
        }
        return defaultValue;
    },
});

export default match;
