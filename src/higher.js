import {isSequence} from "./core/types";

const hi = function(source){
    return hi.asSequence(source);
};

Object.assign(hi, {
    version: "0.1.0",

    Promise: Promise,

    internal: {},

    registeredFunctions: [],

    register: function(name, expected, implementation){
        const wrapped = hi.wrap(expected, implementation);
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
        if(target in hi.Sequence.prototype){
            hi.Sequence.prototype[alias] = hi.Sequence.prototype[target];
        }
        const async = target + "Async";
        if(async + "Async" in this){
            this[alias + "Async"] = this[async];
        }
        if(async in hi.Sequence.prototype){
            hi.Sequence.prototype[alias + "Async"] = hi.Sequence.prototype[async];
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
