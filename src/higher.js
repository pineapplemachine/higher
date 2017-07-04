import wrap from "./core/wrappers";
import Sequence from "./core/sequence";
import {asSequence} from "./core/asSequence";

// function imports
import {registration as array} from "./functions/array";
import {registration as assumeBounded} from "./functions/assumeBounded";
import benchmark from "./functions/benchmark"; // non-registered
import {registration as concat} from "./functions/concat";
import {registration as consume} from "./functions/consume";
import containsElement from "./functions/containsElement"; // non-registered
import {registration as count} from "./functions/count";
import {registration as distinct} from "./functions/distinct";
import {registration as dropHead} from "./functions/dropHead";
import {registration as dropSlice} from "./functions/dropSlice";
import {registration as dropTail} from "./functions/dropTail";
import {registration as each} from "./functions/each";
import {registration as empty} from "./functions/empty";
import {registration as endsWith} from "./functions/endsWith";
import {registration as enumerate} from "./functions/enumerate";
import {registration as equals} from "./functions/equals";
import {registration as filter} from "./functions/filter";
import {registration as findAll} from "./functions/findAll";
import {registration as findFirst} from "./functions/findFirst";
import {registration as findLast} from "./functions/findLast";
import {registration as first} from "./functions/first";
import {registration as firstAsync} from "./functions/firstAsync";
import {registration as flatten} from "./functions/flatten";
import {registration as flattenDeep} from "./functions/flattenDeep";
import {registration as from} from "./functions/from";
import {registration as head} from "./functions/head";
import {registration as homogenous} from "./functions/homogenous";
import {registration as last} from "./functions/last";
import {registration as lastAsync} from "./functions/lastAsync";
import {registration as lexOrder} from "./functions/lexOrder";
import {registrationAny as any, registrationAll as all, registrationNone as none} from "./functions/logical";
import {registration as map} from "./functions/map";
import {registration as max} from "./functions/max";
import {registration as min} from "./functions/min";
import {registration as newArray} from "./functions/newArray";
import {registrationNgrams as ngrams, registrationBigrams as bigrams, registrationTrigrams as trigrams} from "./functions/ngrams";
// import {registration as object} from "./functions/object";
import once from "./functions/once"; // non-registered
import one from "./functions/one"; // non-registered
import {registration as pad} from "./functions/pad";
import partial from "./functions/partial";
import {registration as partition} from "./functions/partition";
import pipe from "./functions/pipe";
import {registration as product} from "./functions/product";
import {registration as range} from "./functions/range";
import {registration as reduce} from "./functions/reduce";
import recur from "./functions/recur";
// import repeat from "./functions/repeat"; // circular dependency with empty
import {registration as reverse} from "./functions/reverse";
import {registration as sample} from "./functions/sample";
import {registration as shuffle} from "./functions/shuffle";
import {registration as startsWith} from "./functions/startsWith";
import {registration as stride} from "./functions/stride";
import {registration as string} from "./functions/string";
import {registrationSumLinear as sumLinear, registrationSumKahan as sumKahan, registrationSumShew as sumShew} from "./functions/sum";
import {registration as tail} from "./functions/tail";
import {registration as tap} from "./functions/tap";
import time from "./functions/time"; // non-registered
import {registration as until} from "./functions/until";
import {registration as write} from "./functions/write";
import zip from "./functions/zip";

const hi = function(source){
    return asSequence(source);
};

// TODO: Verify if we need to really set these here since non are registered
hi.Sequence = Sequence;
hi.once = once;
hi.one = one;
hi.partial = partial;
hi.pipe = pipe;
hi.recur = recur;
hi.time = time.time;
hi.timeAsync = time.timeAsync;
hi.zip = zip;

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

    register: function(module){
        const wrapped = wrap(module.expected, module.implementation);
        this.registeredFunctions.push(wrapped);
        this[module.name] = wrapped.fancy;
        if(wrapped.method){
            this.Sequence.prototype[module.name] = wrapped.method;
        }
        if(wrapped.fancyAsync){
            this[module.name + "Async"] = wrapped.fancyAsync;
        }
        if(wrapped.methodAsync){
            this.Sequence.prototype[module.name + "Async"] = wrapped.methodAsync;
        }

        // register any aliases that exist for this function
        if (module.aliases){
            for (const alias in module.aliases){
                if (module.aliases.hasOwnProperty(alias)){
                    const aliasName = module.aliases[alias];

                    if(wrapped.method){
                        this.Sequence.prototype[aliasName] = wrapped.method;
                    }

                    if(wrapped.fancyAsync){
                        this[aliasName + "Async"] = wrapped.fancyAsync;
                    }

                    if (wrapped.methodAsync){
                        this.Sequence.prototype[aliasName + "Async"] = wrapped.methodAsync;
                    }
                }
            }
        }

        return wrapped;
    },
});

hi.register(all);
hi.register(any);
hi.register(array);
hi.register(assumeBounded);
hi.register(concat);
hi.register(consume);
hi.register(count);
hi.register(distinct);
hi.register(dropHead);
hi.register(dropSlice);
hi.register(dropTail);
hi.register(each);
hi.register(empty);
hi.register(endsWith);
hi.register(enumerate);
hi.register(equals);
hi.register(filter);
hi.register(findAll);
hi.register(findFirst);
hi.register(findLast);
hi.register(first);
hi.register(firstAsync);
hi.register(flatten);
hi.register(flattenDeep);
hi.register(from);
hi.register(head);
hi.register(homogenous);
hi.register(last);
hi.register(lastAsync);
hi.register(lexOrder);
hi.register(map);
hi.register(max);
hi.register(min);
hi.register(newArray);
hi.register(none);

// ngrams
hi.register(ngrams);
hi.register(bigrams);
hi.register(trigrams);

// hi.register(object);
hi.register(pad);
hi.register(partition);
hi.register(product);
hi.register(range);
// hi.register(repeat);
hi.register(reduce);
hi.register(reverse);
hi.register(sample);
hi.register(shuffle);
hi.register(startsWith);
hi.register(stride);
hi.register(string);

// sum
hi.register(sumLinear);
hi.register(sumKahan);
hi.register(sumShew);

hi.register(tail);
hi.register(tap);
hi.register(until);
hi.register(write);

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
