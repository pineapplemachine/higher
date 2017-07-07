import {args} from "./arguments";
import {asSequence, validAsSequence} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {Sequence} from "./sequence";
import {isFunction, isIterable} from "./types";

export const wrap = function(info){
    const fancy = wrap.fancy(info);
    fancy.names = info.names || [info.name];
    fancy.sequences = info.sequences;
    fancy.errors = info.errors;
    fancy.args = info.arguments;
    fancy.implementation = info.implementation;
    fancy.method = wrap.method(info);
    if(fancy.method){
        fancy.method.implementation = info.methodImplementation || info.implementation;
    }
    if(info.async){
        fancy.async = wrap.fancyAsync(fancy);
        if(fancy.method){
            fancy.method.async = wrap.methodAsync(fancy.method);
        }
    }
    if(info.attachSequence){
        Sequence.attach(fancy);
    }
    return fancy;
};

Object.assign(wrap, {
    expecting: {
        anything: (value) => value,
        number: (value) => {
            if(isNaN(value)){
                throw "Expecting a number."; // TODO: Better error messages
            }else{
                return +value;
            }
        },
        function: (value) => {
            if(!isFunction(value)){
                throw "Expecting a function.";
            }else{
                return value;
            }
        },
        iterable: (value) => {
            if(!isIterable(value)){
                throw "Expecting an iterable.";
            }else{
                return value;
            }
        },
        sequence: (value) => {
            if(!validAsSequence(value)){
                throw "Expecting a sequence.";
            }else{
                return asSequence(value);
            }
        },
    },
    fancy: function(info){
        if(info.arguments.none){
            return info.implementation;
        }else if(info.arguments.one){
            return wrap.fancyOne(info);
        }else if(info.arguments.ordered){
            return wrap.fancyOrdered(info);
        }else if(info.arguments.unordered){
            return wrap.fancyUnordered(info);
        }else{
            // TODO: More descriptive error message
            throw "Function has no arguments information.";
        }
    },
    fancyOne: function(info){
        const implementation = info.implementation;
        const validate = info.arguments.one;
        if(info.one === wrap.expecting.anything){
            return implementation;
        }else{
            return (arg) => {
                return implementation(validate(arg));
            };
        }
    },
    fancyOrdered: function(info){
        const implementation = info.implementation;
        return (...callArgs) => {
            const argsCount = Math.min(
                callArgs.length, info.arguments.ordered.length
            );
            for(let i = 0; i < argsCount; i++){
                callArgs[i] = info.arguments.ordered[i](callArgs[i]);
            }
            return implementation(...callArgs);
        };
    },
    fancyUnordered: function(info){
        const implementation = info.implementation;
        const expected = info.arguments.unordered;
        const numbers = args.expectCount(expected.numbers);
        const functions = args.expectCount(expected.functions);
        const sequences = args.expectCount(expected.sequences);
        const validate = function(callArgs){
            const found = args.countTypes(callArgs);
            const counts = args.countSeparated(found);
            if(!args.satisfied(expected, counts)){
                const error = args.describe.discrepancy(expected, counts);
                throw `Error calling function: ${error}`;
            }
        };
        // Function accepts exactly one argument?
        const oneArgument = numbers + functions + sequences === 1;
        // Function accepts arguments of only one type?
        const oneType = (
            (numbers + functions === 0) ||
            (functions + sequences === 0) ||
            (sequences + numbers === 0)
        );
        if(oneArgument){
            if(sequences === 1 && !expected.allowIterables){
                return function(...callArgs){
                    validate(callArgs);
                    return implementation(asSequence(callArgs[0]));
                };
            }else{
                return function(...callArgs){
                    validate(callArgs);
                    return implementation(callArgs[0]);
                };
            }
        }else if(oneType){
            if(sequences > 0 && !expected.allowIterables){
                return function(...callArgs){
                    validate(callArgs);
                    const sequences = [];
                    for(const arg of callArgs) sequences.push(asSequence(arg));
                    return implementation(sequences);
                };
            }else{
                return function(...callArgs){
                    validate(callArgs);
                    return implementation(callArgs);
                };
            }
        }else{
            return function(...callArgs){
                return args.validate(
                    expected, callArgs, implementation, function(error){
                        throw `Error calling function: ${error}`;
                    }
                );
            };
        }
    },
    method: function(info, implementation){
        if(info.arguments.none){
            return null; // Not applicable
        }else if(info.arguments.one){
            return wrap.methodOne(info);
        }else if(info.arguments.ordered){
            return wrap.methodOrdered(info);
        }else if(info.arguments.unordered){
            return wrap.methodUnordered(info);
        }else{
            throw "Function has no arguments information.";
        }
    },
    methodOne: function(info){
        if(!(
            info.arguments.one === wrap.expecting.iterable ||
            info.arguments.one === wrap.expecting.sequence ||
            info.arguments.one === wrap.expecting.anything
        )){
            return null;
        }
        const implementation = info.methodImplementation || info.implementation;
        return function(){
            return implementation(this);
        }
    },
    methodOrdered: function(info){
        if(!(
            info.arguments.ordered[0] === wrap.expecting.iterable ||
            info.arguments.ordered[0] === wrap.expecting.sequence ||
            info.arguments.ordered[0] === wrap.expecting.anything
        )){
            // Not applicable as a method in this case
            return null;
        }
        const implementation = info.methodImplementation || info.implementation;
        return function(...callArgs){
            const argsCount = Math.min(
                callArgs.length, info.arguments.ordered.length - 1
            );
            for(let i = 0; i < argsCount; i++){
                callArgs[i] = info.arguments.ordered[i + 1](callArgs[i]);
            }
            return implementation(this, ...callArgs);
        };
    },
    methodUnordered: function(info){
        const implementation = info.methodImplementation || info.implementation;
        const expected = info.arguments.unordered;
        if(args.expectNone(expected.sequences)){
            return null;
        }else if(args.expectSingular(expected.sequences)){
            const numbers = args.expectCount(expected.numbers);
            const functions = args.expectCount(expected.functions);
            if(numbers === 0 && functions === 0){
                return function(){
                    return implementation(this);
                };
            }else if(numbers === 0 || functions === 0){
                const validate = function(argz){
                    const found = args.countTypes(argz);
                    const counts = args.countSeparated(found);
                    counts.sequences++;
                    if(!args.satisfied(expected, counts)){
                        const error = args.describe.discrepancy(
                            expected, counts
                        );
                        throw `Error calling function: ${error}`;
                    }
                };
                if(numbers === 1 || functions === 1){
                    return function(...callArgs){
                        validate(callArgs);
                        return implementation(callArgs[0], this);
                    };
                }else{
                    return function(...callArgs){
                        validate(callArgs);
                        return implementation(callArgs, this);
                    };
                }
            }
        }else{
            return function(...callArgs){
                Array.prototype.splice.call(callArgs, 0, 0, this);
                return args.validate(
                    expected, callArgs, implementation, function(error){
                        throw `Error calling ${name}: ${error}`;
                    }
                );
            };
        }
    },
    fancyAsync: function(fancy){
        return wrap.async((caller, callArgs) => fancy.apply(caller, callArgs));
    },
    methodAsync: function(method){
        return wrap.async((caller, callArgs) => method.apply(caller, callArgs));
    },
    async: function(callback){
        return function(...callArgs){
            return new constants.Promise((resolve, reject) => {
                callAsync(() => resolve(callback(this, callArgs)));
            });
        };
    },
});

export default wrap;
