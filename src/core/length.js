import {isSequence} from "./sequence";
import {isArray, isFunction, isString} from "./types";

export const canGetLength = (source) => {
    return (
        isString(source) || isArray(source) || (
            isSequence(source) && source.length
        )
    );
};

export const getLength = (source) => {
    if(isFunction(source.length)) return source.length();
    else return source.length;
};

export default {canGetLength, getLength};
