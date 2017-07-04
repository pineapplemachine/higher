/**
 * Separate async implementation to handle reject callback when there
 * is no first element.
 * @param {*} predicate
 * @param {*} source
 */
const lastAsync = (predicate, source) => {
    return new hi.Promise((resolve, reject) => {
        hi.callAsync(() => {
            if(predicate){
                let back = null;
                while(!source.done()){
                    back = source.back();
                    if(predicate(back)) resolve(back);
                    source.popBack();
                }
            }else if(!source.done()){
                resolve(source.back());
            }
            reject();
        });
    });
};

export const registration = {
    name: "lastAsync",
    expected: {
        functions: "?",
        sequences: 1,
        isAsync: true,
    },
    implementation: lastAsync,
};

export default lastAsync;
