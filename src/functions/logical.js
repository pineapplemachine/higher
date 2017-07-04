/**
 * Get whether any element in a sequence matches a predicate or,
 * if no predicate is provided, whether any of the elements are truthy.
 * With no predicate, returns the first truthy element, or false if there
 * is no truthy element.
 * @param {*} predicate
 * @param {*} source
 * @returns `false` when the input is an empty sequence.
 */
const any = (predicate, source) => {
    if(predicate){
        for(const element of source){
            if(predicate(element)) return true;
        }
    }else{
        for(const element of source){
            if(element) return element;
        }
    }
    return false;
};

export const registrationAny = {
    name: "any",
    expected: {
        functions: "?",
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: any,
};

/**
 * Get whether all elements in a sequence match a predicate or,
 * if no predicate is provided, whether all the elements are truthy.
 * @param {*} predicate
 * @param {*} source
 * @returns `true` when the input is an empty sequence.
 */
const all = (predicate, source) => {
    if(predicate){
        for(const element of source){
            if(!predicate(element)) return false;
        }
    }else{
        for(const element of source){
            if(!element) return false;
        }
    }
    return true;
};

export const registrationAll = {
    name: "all",
    expected: {
        functions: "?",
        sequences: 1,
        allowIterables: true,
        async: true,
    },
    implementation: all,
};

/**
 * Get whether none of the elements in a sequence match a predicate or,
 * if no predicate is provided, whether all the elements are falsey.
 * @param {*} predicate
 * @param {*} source
 * @returns `true` when the input is an empty sequence.
 */
const none = (predicate, source) => {
    if(predicate){
        for(const element of source){
            if(predicate(element)) return false;
        }
    }else{
        for(const element of source){
            if(element) return false;
        }
    }
    return true;
};

export const registrationNone = {
    name: "none",
    expected: {
        functions: "?",
        sequences: 1,
        allowIterables: true,
        async: true,
    },
    implementation: none,
};

export default {any, all, none};
