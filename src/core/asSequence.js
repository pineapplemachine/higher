import {constants} from "./constants";
import {isIterable, isObject} from "./types";
import {isSequence} from "./sequence";

// True when asSequence(value) could return a sequence.
export const validAsSequence = (value) => {
    // Easy short-circuit for core sequence converters
    if(isIterable(value) || isObject(value)) return true;
    for(const converter of asSequence.converters){
        if(converter.predicate(value)) return true;
    }
    return false;
};

export const validAsImplicitSequence = (value) => {
    if(isSequence(value)) return true;
    for(const converter of asSequence.converters){
        if(converter.predicate(value)) return converter.implicit;
    }
    return false;
};

// True when asSequence(value) would return a known-bounded sequence.
export const validAsBoundedSequence = (value) => {
    if(isSequence(value)) return value.bounded();
    for(const converter of asSequence.converters){
        if(converter.predicate(value)) return converter.bounded(value);
    }
    return false;
};

// True when asSequence(value) would return a known-unbounded sequence.
export const validAsUnboundedSequence = (value) => {
    if(isSequence(value)) return value.unbounded();
    for(const converter of asSequence.converters){
        if(converter.predicate(value)) return converter.unbounded(value);
    }
    return false;
};

// Get a sequence from an arbitrary input if it is possible to convert.
// Returns undefined when the input is not valid as a sequence.
export const asSequence = (value) => {
    if(isSequence(value)) return value;
    for(const converter of asSequence.converters){
        if(converter.predicate(value)) return converter.transform(value);
    }
    return undefined;
};

export const asImplicitSequence = (value) => {
    if(isSequence(value)) return value;
    for(const converter of asSequence.converters){
        if(converter.implicit && converter.predicate(value)){
            return converter.transform(value);
        }
    }
    return undefined;
};

// Logic for adding new converters for getting values as sequences.
asSequence.converters = [];
asSequence.addConverter = (converter) => {
    // Insert new converters in ascending order of priority,
    // i.e. first priority is given the first position in the list.
    let i = 0;
    for(; i < asSequence.converters.length; i++){
        if(asSequence.converters[i].priority > converter.priority) break;
    }
    asSequence.converters.splice(i, 0, converter);
    return converter;
};

export default asSequence;
