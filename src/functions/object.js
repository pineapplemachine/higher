import {NotBoundedError} from "../core/sequence";
import {isArray, isObject} from "../core/types";
import {wrap} from "../core/wrap";

export const object = wrap({
    name: "object",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            numbers: "?",
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (limit, source) => {
        const pushKeyValuePair = (result, element) => {
            if(isArray(element)){
                if(element.length){
                    result[element[0]] = element.length > 1 ? element[1] : null;
                }
            }else if(isObject(element) && "key" in element){
                result[element.key] = "value" in element ? element.value : null;
            }else{
                result[element] = null;
            }
        };
        if(limit <= 0){
            return {};
        }else if(!limit){
            if(!source.bounded()) throw NotBoundedError(source, {
                message: "Failed to create object from sequence",
                limitArgument: true,
            });
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
    },
});

export default object;
