const hi = function(source){
    return hi.asSequence(source);
};

Object.assign(hi, {
    version: "0.1.0",
    
    internal: {},
    
    registeredFunctions: [],
    register: function(name, expected, implementation){
        let register = {
            name: name,
            expected: expected,
            implementation: implementation,
            fancy: this.internal.wrap.fancy(name, expected, implementation),
        };
        this[name] = register.fancy;
        register.fancy.raw = implementation;
        if(!hi.args.expectNone(expected.sequences)){
            prototypeMethod = this.internal.wrap.sequenceMethod(
                name, expected, implementation
            );
            this.Sequence.prototype[name] = prototypeMethod;
            register.prototypeMethod = prototypeMethod;
        }
        if(expected.async){
            const fancyAsync = this.internal.wrap.async(
                (caller, args) => fancy.apply(caller, args)
            );
            this[name + "Async"] = fancyAsync;
            register.fancyAsync = fancyAsync;
        }
        if(expected.async && register.prototypeMethod){
            const protoAsync = this.internal.wrap.async(
                (caller, args) => prototypeMethod.apply(caller, args)
            );
            this.Sequence.prototype[name + "Async"] = protoAsync;
            register.prototypeMethodAsync = protoAsync;
        }
        this.registeredFunctions.push(register);
        return register.fancy;
    },
    alias: function(name, alias){
        if(name in this){
            this[alias] = this[name];
        }
        if(name + "Async" in this){
            this[alias + "Async"] = this[name + "Async"];
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

export default hi;