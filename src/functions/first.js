/**
 * Get the first element in a sequence or, if a predicate is passed,
 * get the first element meeting that predicate.
 * @param {*} predicate
 * @param {*} source
 * @return Undefined if there was no such element.
 */
const first = (predicate, source) => {
    if(predicate){
        for(const element of source){
            if(predicate(element)) return element;
        }
    }else{
        for(const element of source) return element;
    }
    return undefined;
};

export const registration = {
    name: "first",
    expected: {
        functions: "?",
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
    },
    implementation: first,
};

export default first;
