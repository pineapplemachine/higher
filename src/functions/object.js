import {sequenceBoundsError} from "../core/internal/errors";
import {isObject} from "../core/types";

/**
 *
 * @param {*} limit
 * @param {*} source
 */
const object = (limit, source) => {
    function pushKeyValuePair(result, element){
        if(hi.isArray(element)){
            if(element.length){
                result[element[0]] = element.length > 1 ? element[1] : null;
            }
        }else if(isObject(element) && "key" in element){
            result[element.key] = "value" in element ? element.value : null;
        }else{
            result[element] = null;
        }
    }
    if(limit <= 0){
        return {};
    }else if(!limit){
        if(!source.bounded()){
            throw hi.internal.unboundedError("write", "object");
        }
        const result = {};
        for(const element of source){
            pushKeyValuePair(result, element);
        }
        return result;
    }else{
        const result = {};
        let i = 0;
        for(const element of source){
            if(i++ >= limit) break;
            pushKeyValuePair(result, element);
        }
        return result;
    }
};

export const registration = {
    name: "object",
    expected: {
        numbers: "?",
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: object,
};

export default object;
