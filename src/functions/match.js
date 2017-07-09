import {isArray, isFunction, isObject} from "../core/types";
import {wrap} from "../core/wrap";

export const match = wrap({
    name: "match",
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [] // + ...args
    },
    implementation: (value, ...patterns) => {
        const matchValue = (value, pattern) => {
            if(isFunction(pattern)){
                return pattern(value);
            }else if(isObject(pattern)){
                for(const key in pattern){
                    if(!(key in value) || !matchValue(value[key], pattern[key])){
                        return false;
                    }
                }
                return true;
            }else{
                return pattern === value;
            }
        };
        let defaultValue = undefined;
        for(const pattern of patterns){
            if(!isArray(pattern) || pattern.length < 1){
                throw "Object is not a pattern."; // TODO: Better error
            }else if(pattern.length < 2){
                defaultValue = pattern[0];
            }else if(matchValue(value, pattern[0])){
                return pattern[1];
            }
        }
        return defaultValue;
    },
});

export default match;
