const hi = function(source){
    return hi.asSequence(source);
};

Object.assign(hi, {
    version: "0.1.0",
    
    internal: {},
    
    registeredFunctions: [],
    
    register: function(name, expected, implementation){
        let wrapped = hi.wrap(expected, implementation);
        this.registeredFunctions.push(wrapped);
        this[name] = wrapped.fancy;
        if(wrapped.method){
            this.Sequence.prototype[name] = wrapped.method;
        }
        if(wrapped.fancyAsync){
            this[name + "Async"] = wrapped.fancyAsync;
        }
        if(wrapped.methodAsync){
            this.Sequence.prototype[name + "Async"] = wrapped.methodAsync;
        }
        return wrapped;
    },
    alias: function(alias, target){
        if(target in this){
            this[alias] = this[target];
        }
        if(target + "Async" in this){
            this[alias + "Async"] = this[target + "Async"];
        }
    },
});

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
