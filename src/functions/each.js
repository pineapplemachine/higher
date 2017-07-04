/**
 *
 * @param {*} callback
 * @param {*} source
 */
const each = (callback, source) => {
    for(const element of source){
        callback(element);
    }
    return source;
};

export const registration = {
    name: "each",
    aliases: ["forEach"],
    expected: {
        functions: 1,
        sequences: 1,
        // Don't waste time coercing input iterables to sequences
        allowIterables: true,
        // Also generate an async version of this function
        async: true,
    },
    implementation: each,
};

export default each;
