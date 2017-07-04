/**
 * Separate async implementation to handle reject callback when there
 * is no first element.
 * @param {*} predicate
 * @param {*} source
 */
const firstAsync = (predicate, source) => {
    return new hi.Promise((resolve, reject) => {
        hi.callAsync(() => {
            if(predicate){
                for(const element of source){
                    if(predicate(element)) resolve(element);
                }
            }else{
                for(const element of source) resolve(element);
            }
            reject();
        });
    });
};

export const registration = {
    name: "firstAsync",
    expected: {
        functions: "?",
        sequences: 1,
        isAsync: true,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
    },
    implementation: firstAsync,
};

export default firstAsync;
