/**
 * Get the last element in a sequence or, if a predicate is passed,
 * get the last element meeting that predicate.
 * Returns undefined if there was no such element.
 * @param {*} predicate
 * @param {*} source
 */
const last = (predicate, source) => {
    if(predicate){
        let back = null;
        while(!source.done()){
            back = source.back();
            if(predicate(back)) return back;
            source.popBack();
        }
    }else if(!source.done()){
        return source.back();
    }
    return undefined;
};

export const registration = {
    name: "last",
    expected: {
        functions: "?",
        sequences: 1,
    },
    implementation: last,
};

export default last;
