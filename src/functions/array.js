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

/**
 * Produce a fully in-memory array from the contents of a sequence.
 * Optionally accepts a numeric argument indicating the maximum number of
 * elements to output to the array.
 * Will throw an error if the function receives an unbounded sequence and
 * no length limit.
 * When the input is an array and the limit is either not set or is the
 * at least the length of that array, the array itself is returned.
 * @param {*} limit
 * @param {*} source
 */
const array = (limit, source) => {
    if(limit <= 0){
        return [];
    }else if(isArray(source)){
        return (!limit || limit >= source.length ?
            source : source.slice(limit)
        );
    }else{
        return asArray(limit, source);
    }
};

export const registration = {
    name: "array",
    expected: {
        numbers: "?",
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: array,
};

export default array;
