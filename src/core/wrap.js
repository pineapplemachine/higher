import {args} from "./arguments";
import {asSequence, validAsSequence} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {Sequence} from "./sequence";
import {isFunction, isIterable, isObject, isString} from "./types";

import {cleanString} from "../docs/cleanString";

export const wrap = function(info){
    // TODO: Better errors
    if(!info.implementation) throw "No implementation!";
    if(!info.arguments) throw "No argument information!";
    if(!info.name && !info.names) throw "No names!";
    const fancy = wrap.fancy(info);
    fancy.names = info.names || [info.name];
    Object.defineProperty(fancy, "name", {
        value: info.name || info.names[0], writable: false
    });
    fancy.sequences = info.sequences;
    fancy.errors = info.errors;
    fancy.args = info.arguments;
    fancy.implementation = info.implementation;
    fancy.summary = info.summary;
    fancy.docs = wrap.cleanDocs(info);
    fancy.tests = info.tests;
    fancy.test = wrap.testRunner(fancy.name, info);
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
    if(info.asSequence){
        const converter = Object.assign(
            {transform: info.implementation}, info.asSequence
        );
        asSequence.addConverter(converter);
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
        object: (value) => {
            if(!isObject(value)){
                throw "Expecting an object.";
            }else{
                return value;
            }
        },
        array: (value) => {
            if(!isArray(value)){
                throw "Expecting an array.";
            }else{
                return value;
            }
        },
        string: (value) => {
            return value.toString();
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
        oneOf: (options) => ((value) => {
            for(const option of options){
                if(value === option) return option;
            }
            throw `Expecting one of ${options.join(", ")}.`;
        }),
        arrayOf: (each) => ((value) => {
            if(!isArray(value)){
                throw "Expecting an array."
            }
            for(let i = 0; i < value.length; i++){
                value[i] = each(value[i]);
            }
            return value;
        }),
    },
    fancy: function(info){
        if(info.arguments.none || info.arguments.anything){
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
            if(!args.satisfied(expected, found)){
                const error = args.describe.discrepancy(expected, found);
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
        }else if(info.arguments.anything){
            return wrap.methodAnything(info);
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
    methodAnything: function(info){
        const implementation = info.methodImplementation || info.implementation;
        return function(...args){
            return implementation(this, ...args);
        };
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
        };
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
                    found.sequences++;
                    if(!args.satisfied(expected, found)){
                        const error = args.describe.discrepancy(expected, found);
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
    cleanDocs: function(info){
        if(!info.docs) return undefined;
        info.docs.detail = cleanString(info.docs.detail || "");
        info.docs.expects = cleanString(info.docs.expects || "");
        info.docs.returns = cleanString(info.docs.returns || "");
        info.docs.warnings = cleanString(info.docs.warnings || "");
        info.docs.trivia = cleanString(info.docs.trivia || "");
        return info.docs;
    },
    testRunner: function(name, info){
        if(!info.tests) return undefined;
        return hi => {
            const result = {
                pass: [],
                fail: [],
            };
            for(const testName in info.tests){
                const test = info.tests[testName];
                let success = true;
                try{
                    test(hi);
                }catch(error){
                    success = false;
                    result.fail.push({name: testName, error: error});
                }
                if(success){
                    result.pass.push({name: testName});
                }
            }
            return result;
        };
    },
});

export default wrap;
