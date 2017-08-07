import {addSequenceConverter, asSequence, validAsSequence} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {expecting, Expecting} from "./expecting";
import {validateOne, validateOrdered, categorizeUnordered} from "./expecting";
import {validateUnordered, toUnorderedArguments} from "./expecting";
import {lightWrap, wrappedTestRunner} from "./lightWrap";
import {attachSequenceMethods} from "./sequence";
import {isFunction, isIterable, isObject, isString} from "./types";

import {cleanDocs} from "../docs/cleanString";

const normalizeArguments = (args) => {
    if(args && args.unordered){
        const unordered = args.unordered;
        for(const type of ["numbers", "functions", "sequences"]){
            if(unordered[type] && !unordered[type].amount){
                if(unordered[type].one){
                    unordered[type].amount = 1;
                    unordered[type].order = [unordered[type].one];
                }else if(unordered[type].optional){
                    unordered[type].amount = "?";
                    unordered[type].order = [unordered[type].optional];
                }else if(unordered[type].anyNumberOf){
                    unordered[type].amount = "*";
                    unordered[type].all = unordered[type].anyNumberOf;
                }else if(unordered[type].atLeastOne){
                    unordered[type].amount = "+";
                    unordered[type].all = unordered[type].atLeastOne;
                }else if(unordered[type].order){
                    unordered[type].amount = unordered[type].order.length;
                }else{
                    unordered[type] = {amount: unordered[type]};
                }
            }
            if(unordered[type]){
                const places = [
                    "first", "second", "third", "fourth", "fifth", "sixth"
                ];
                for(let i = 0; i < places.length; i++){
                    if(places[i] in unordered[type]){
                        if(!unordered[type].order) unordered[type].order = [];
                        unordered[type].order[i] = unordered[type][places[i]];
                        unordered[type].order.length = Math.max(
                            i + 1, unordered[type].order.length
                        );
                    }
                }
            }
        }
    }
    return args;
};

export const wrap = lightWrap({
    summary: "Get a wrapped function from a function descriptor.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function wrap(info){
        if(process.env.NODE_ENV === "development"){
            if(!info.implementation) throw new Error(
                "Missing implementation for wrapped function."
            );
            if(!info.arguments) throw new Error(
                "Missing arguments information for wrapped function."
            );
            if(!info.name && !info.names) throw new Error(
                "Missing name or names for wrapped function."
            );
        }
        info.arguments = normalizeArguments(info.arguments);
        const fancy = getWrappedFunction(info);
        fancy.names = info.names || [info.name];
        Object.defineProperty(fancy, "name", {
            value: info.name || info.names[0], writable: false
        });
        fancy.sequences = info.sequences;
        fancy.errors = info.errors;
        fancy.expects = info.arguments;
        fancy.implementation = info.implementation;
        fancy.summary = info.summary;
        if(info.async){
            fancy.async = getWrappedFunctionAsync(fancy);
        }
        if(info.attachSequence){
            fancy.method = getWrappedMethod(info);
            fancy.method.implementation = info.methodImplementation || info.implementation;
            if(info.async) fancy.method.async = getWrappedMethodAsync(fancy.method);
            attachSequenceMethods(fancy);
        }
        if(info.asSequence){
            const converter = Object.assign(
                {transform: info.implementation}, info.asSequence
            );
            addSequenceConverter(converter);
        }
        if(process.env.NODE_ENV === "development"){
            fancy.docs = cleanDocs(info.docs);
            fancy.tests = info.tests;
            fancy.test = wrappedTestRunner(fancy, info.tests);
        }
        return fancy;
    },
});

wrap.expecting = expecting;
wrap.Expecting = Expecting;

export const getWrappedFunction = function(info){
    if(process.env.NODE_ENV !== "development"){
        if(info.arguments.unordered){
            return getWrappedUnordered(info);
        }else{
            return info.implementation;
        }
    }
    if(process.env.NODE_ENV === "development"){
        if(info.arguments.none || info.arguments.anything){
            return info.implementation;
        }else if(info.arguments.one){
            return getWrappedFunctionOne(info);
        }else if(info.arguments.ordered){
            return getWrappedFunctionOrdered(info);
        }else if(info.arguments.unordered){
            return getWrappedFunctionUnordered(info);
        }else{
            throw new Error("Invalid arguments information for wrapped function.");
        }
    }
};

export const getWrappedFunctionOne = function(info){
    if(process.env.NODE_ENV !== "development"){
        return info.implementation;
    }
    if(process.env.NODE_ENV === "development"){
        return arg => info.implementation(
            validateOne(arg, info.arguments)
        );
    }
};

export const getWrappedFunctionOrdered = function(info){
    if(process.env.NODE_ENV !== "development"){
        return info.implementation;
    }
    if(process.env.NODE_ENV === "development"){
        return (...args) => info.implementation(
            ...validateOrdered(args, info.arguments)
        );
    }
};

export const getWrappedFunctionUnordered = function(info){
    // TODO: This branch really needs to be checked by automated tests
    if(process.env.NODE_ENV !== "development"){
        // Function accepts only numbers or only functions
        if(
            (!info.unordered.numbers && !info.unordered.sequences) ||
            (!info.unordered.functions && !info.unordered.sequences)
        ){
            return (...args) => info.implementation(args);
        // Function accepts only sequences
        }else if(!info.unordered.numbers && !info.unordered.functions){
            return (...args) => {
                for(let i = 0; i < args.length; i++) args[i] = asSequence(args[i]);
                return info.implementation(args);
            };
        // Function returns a combination of types
        }else{
            return (...args) => info.implementation(...toUnorderedArguments(
                categorizeUnordered(args, info.arguments), info.arguments
            ));
        }
    }
    if(process.env.NODE_ENV === "development"){
        return (...args) => info.implementation(...toUnorderedArguments(
            validateUnordered(args, info.arguments), info.arguments
        ));
    }
};

export const getWrappedMethod = function(info){
    if(process.env.NODE_ENV !== "development"){
        if(info.arguments.unordered){
            return getWrappedMethodUnordered(info);
        }else if(info.arguments.one){
            const implementation = info.methodImplementation || info.implementation;
            return function(){
                return implementation(this);
            };
        }else{
            const implementation = info.methodImplementation || info.implementation;
            return function(...args){
                return implementation(this, ...args);
            };
        }
    }
    if(process.env.NODE_ENV === "development"){
        if(info.arguments.anything){
            return getWrappedMethodAnything(info);
        }else if(info.arguments.one){
            return getWrappedMethodOne(info);
        }else if(info.arguments.ordered){
            return getWrappedMethodOrdered(info);
        }else if(info.arguments.unordered){
            return getWrappedMethodUnordered(info);
        }else{
            return undefined;
        }
    }
};

export const getWrappedMethodAnything = function(info){
    const implementation = info.methodImplementation || info.implementation;
    return function(...args){
        return implementation(this, ...args);
    };
};

export const getWrappedMethodOne = function(info){
    const implementation = info.methodImplementation || info.implementation;
    if(process.env.NODE_ENV !== "development"){
        return function(){
            return implementation(this);
        };
    }
    if(process.env.NODE_ENV === "development"){
        return function(){
            return implementation(validateOne(this, info.arguments));
        };
    }
};

export const getWrappedMethodOrdered = function(info){
    const implementation = info.methodImplementation || info.implementation;
    if(process.env.NODE_ENV !== "development"){
        return function(...args){
            return implementation(this, ...args);
        };
    }
    if(process.env.NODE_ENV === "development"){
        return function(...args){
            args.splice(0, 0, this);
            return implementation(
                ...validateOrdered(args, info.arguments)
            );
        };
    }
};

export const getWrappedMethodUnordered = function(info){
    const implementation = info.methodImplementation || info.implementation;
    // TODO: This branch really needs to be checked by automated tests
    if(process.env.NODE_ENV !== "development"){
        // Function accepts only sequences
        if(!info.unordered.numbers && !info.unordered.functions){
            return function(...args){
                for(let i = 0; i < args.length; i++) args[i] = asSequence(args[i]);
                args.splice(0, 0, this);
                return implementation(args);
            };
        }
        // Function accepts one sequence and only numbers or only functions
        else if((
            info.unordered.sequences.amount === 1 || info.unordered.sequences.amount === "?"
        ) && (
            !info.unordered.numbers || !info.unordered.functions
        )){
            return function(...args){
                return implementation(this, args);
            }
        // Function returns another combination of types
        }else{
            return function(...args){
                const found = categorizeUnordered(args, info.arguments);
                found.sequences.splice(0, 0, this);
                return info.implementation(...toUnorderedArguments(
                    found, info.arguments
                ));
            };
        }
    }
    if(process.env.NODE_ENV === "development"){
        return function(...args){
            return info.implementation(...toUnorderedArguments(
                validateUnordered(args, info.arguments, this), info.arguments
            ));
        };
    }
};

export const getWrappedFunctionAsync = function(wrapped){
    return function(...args){
        return new constants.Promise((resolve, reject) => {
            callAsync(() => resolve(wrapped(...args)));
        });
    };
};

export const getWrappedMethodAsync = function(method){
    return function(...args){
        return new constants.Promise((resolve, reject) => {
            callAsync(() => resolve(method.apply(this, args)));
        });
    };
};

export default wrap;
