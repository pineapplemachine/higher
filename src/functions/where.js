import {isArray, isFunction, isObject} from "../core/types";
import {wrap} from "../core/wrap";

export const wherePattern = (value, pattern) => {
    if(isFunction(pattern)){
        return pattern(value);
    }else if(isObject(pattern)){
        for(const key in pattern){
            if(!wherePattern(value[key], pattern[key])){
                return false;
            }
        }
        return true;
    }else{
        return pattern === value;
    }
};

// Returns a predicate function checking an input object properties against
// an object mapping keys to patterns.
export const where = wrap({
    name: "where",
    attachSequence: false,
    async: false,
    arguments: {
        ordered: [wrap.expecting.object]
    },
    implementation: (pattern) => {
        return (value) => wherePattern(value, pattern);
    },
});

export default where;
