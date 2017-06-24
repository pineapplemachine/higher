// Get the last element in a sequence or, if a predicate is passed,
// get the last element meeting that predicate.
// Returns undefined if there was no such element.
const last = registerFunction("last", {
    functions: "?",
    sequences: 1,
}, function(predicate, source){
    if(predicate){
        let back = null;
        while(!source.done()){
            back = source.back();
            if(predicate(back)) return back;
            source.popBack();
        }
    }else{
        if(!source.done()) return source.back();
    }
    return undefined;
});

// Separate async implementation to handle reject callback when there
// is no first element.
last.async = registerFunction("lastAsync", {
    functions: "?",
    sequences: 1,
}, function(predicate, source){
    return new Promise((resolve, reject) => {
        hi.callAsync(() => {
            if(predicate){
                let back = null;
                while(!source.done()){
                    back = source.back();
                    if(predicate(back)) resolve(back);
                    source.popBack();
                }
            }else{
                if(!source.done()) resolve(source.back());
            }
            reject();
        });
    });
});
