import {isFunction, isString} from "./types";

export const canGetLength = (source) => {
    return isString(source) || "length" in source;
};

export const getLength = (source) => {
    if(isFunction(source.length)) return source.length();
    else return source.length;
};

export default {canGetLength, getLength};
