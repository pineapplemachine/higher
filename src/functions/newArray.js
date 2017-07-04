import {isArray} from "../core/types";
import {unboundedError} from "../core/internal/errors";

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
        if(hi.isArray(source)) return source.slice(
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

/**
 * This function is guaranteed to return a different object from the one
 * passed to it. This might be important if the output will later be modified,
 * and the input could potentially be already an array that must not be modified.
 * When the input is an array, returns a copy of that array.
 * @param {*} limit
 * @param {*} source
 */
const newArray = (limit, source)=> {
    if(limit <= 0){
        return [];
    }else if(isArray(source)){
        return (!limit || limit >= source.length ?
            source.slice() : source.slice(limit)
        );
    }else{
        return asArray(limit, source);
    }
};

export const registration = {
    name: "newArray",
    expected: {
        numbers: "?",
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: newArray,
};

export default newArray;
