const hi = {
    version: "0.1.0",
    isSequence: isSequence,
    asSequence: asSequence,
    seq: asSequence,
    register: registerFunction,
};

for(let name in registeredFunctions){
    hi[name] = registeredFunctions[name];
}

if(typeof window === "undefined"){
    hi.callAsync = function(callback){
        process.nextTick(callback);
    };
    exports.hi = hi;
}else{
    hi.callAsync = function(callback){
        setTimeout(callback, 0);
    };
    window.hi = hi;
}
