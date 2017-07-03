import wrap from "./core/wrappers";
import Sequence from "./core/sequence";
import {asSequence} from "./core/asSequence";

// function imports
import array from "./functions/array";
import assumeBounded from "./functions/assumeBounded";
import benchmark from "./functions/benchmark"; // non-registered
import concat from "./functions/concat";
import consume from "./functions/consume";
import containsElement from "./functions/containsElement"; // non-registered
import count from "./functions/count";
import distinct from "./functions/distinct";
import dropHead from "./functions/dropHead";
import dropSlice from "./functions/dropSlice";
import dropTail from "./functions/dropTail";
import empty from "./functions/empty";
import endsWith from "./functions/endsWith";
import enumerate from "./functions/enumerate";
import equals from "./functions/equals";
import filter from "./functions/filter";
import findAll from "./functions/findAll";
// import repeat from "./functions/repeat"; // circular dependency with empty
import time from "./functions/time"; // non-registered

const hi = function(source){
    return asSequence(source);
};

// TODO: Verify if we need to really set these
hi.Sequence = Sequence;
hi.time = time.time;
hi.timeAsync = time.timeAsync;

Object.assign(hi, {
    version: "0.1.0",

    Promise: Promise,

    internal: {},

    registeredFunctions: [],

    defaultComparisonFunction: (a, b) => (a === b),
    defaultOrderingFunction: (a, b) => (a < b ? -1 : (a > b) ? +1 : 0),
    defaultPredicateFunction: (a) => (a),
    defaultRelationalFunction: (a, b) => (a < b),
    defaultTransformationFunction: (a) => (a),

    defaultLimitLength: 1000,

    register: function(name, expected, implementation){
        const wrapped = wrap(expected, implementation);
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

hi.register(array.array.name, array.array.expected, array.array.implementation);
hi.register(array.newArray.name, array.newArray.expected, array.newArray.implementation);
hi.register(assumeBounded.name, assumeBounded.expected, assumeBounded.implementation);
hi.register(concat.name, concat.expected, concat.implementation);
hi.register(consume.name, consume.expected, consume.implementation);
hi.register(count.name, count.expected, count.implementation);
hi.register(distinct.name, distinct.expected, distinct.implementation);
hi.register(dropHead.name, dropHead.expected, dropHead.implementation);
hi.register(dropSlice.name, dropSlice.expected, dropSlice.implementation);
hi.register(dropTail.name, dropTail.expected, dropTail.implementation);
hi.register(empty.name, empty.expected, empty.implementation);
hi.register(endsWith.name, endsWith.expected, endsWith.implementation);
hi.register(enumerate.name, enumerate.expected, enumerate.implementation);
hi.register(equals.name, equals.expected, equals.implementation);
hi.register(filter.name, filter.expected, filter.implementation);
hi.register(findAll.name, findAll.expected, findAll.implementation);

// hi.register(repeat.name, repeat.expected, repeat.implementation);



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
