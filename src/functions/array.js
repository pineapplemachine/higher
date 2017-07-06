import {isArray} from "../core/types";
import {unboundedError} from "../core/internal/errors";
import {wrap} from "../core/wrap";

// Base implementation for array and newArray functions.
const asArray = function(limit, source){
    if(!limit){
        if(!source.bounded()){
            throw unboundedError("write", "array");
        }
        const result = [];
        for(const element of source){
            result.push(element);
        }
        return result;
    }else{
        if(isArray(source)) return source.slice(
            0, limit < source.length ? limit : source.length
        );
        const result = [];
        let i = 0;
        for(const element of source){
            if(i++ >= limit) break;
            result.push(element);
        }
        return result;
    }
};

export const array = wrap({
    name: "array",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            allowIterables: true
            numbers: "?",
            sequences: 1,
        }
    },
    implementation: (limit, source) => {
        if(limit <= 0){
            return [];
        }else if(isArray(source)){
            return (!limit || limit >= source.length ?
                source : source.slice(limit)
            );
        }else{
            return asArray(limit, source);
        }
    },
});

export const newArray = wrap({
    name: "newArray",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            allowIterables: true
            numbers: "?",
            sequences: 1,
        }
    },
    implementation: (limit, source) => {
        if(limit <= 0){
            return [];
        }else if(isArray(source)){
            return (!limit || limit >= source.length ?
                source.slice() : source.slice(limit)
            );
        }else{
            return asArray(limit, source);
        }
    },
});

export default array;
