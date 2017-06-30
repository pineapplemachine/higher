import args from "./arguments";
import {asSequence} from "./asSequence";

const wrap = function(expected, implementation){
    const fancy = wrap.fancy(expected, implementation);
    const method = wrap.method(expected, implementation);
    return {
        expected: expected,
        raw: implementation,
        fancy: fancy,
        method: method,
        fancyAsync: expected.async ? wrap.fancyAsync(fancy) : null,
        methodAsync: expected.async && method ? wrap.methodAsync(method) : null,
    };
};

Object.assign(wrap, {
    fancy: function(expected, implementation){
        const numbers = args.expectCount(expected.numbers);
        const functions = args.expectCount(expected.functions);
        const sequences = args.expectCount(expected.sequences);
        const validate = function(argz){
            const found = args.countTypes(argz);
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
        let fancy = null;
        if(oneArgument){
            if(sequences === 1 && !expected.allowIterables){
                fancy = function(){
                    validate(arguments);
                    return implementation(asSequence(arguments[0]));
                };
            }else{
                fancy = function(){
                    validate(arguments);
                    return implementation(arguments[0]);
                };
            }
        }else if(oneType){
            if(sequences > 0 && !expected.allowIterables){
                fancy = function(){
                    validate(arguments);
                    const sequences = [];
                    for(const arg of arguments) sequences.push(asSequence(arg));
                    return implementation(sequences);
                };
            }else{
                fancy = function(){
                    validate(arguments);
                    return implementation(arguments);
                };
            }
        }
        fancy = fancy || function(){
            return args.validate(
                expected, arguments, implementation, function(error){
                    throw `Error calling function: ${error}`;
                }
            );
        };
        fancy.expected = expected;
        fancy.raw = implementation;
        return fancy;
    },
    method: function(expected, implementation){
        if(args.expectNone(expected.sequences)){
            return null; // Not applicable
        }
        let method = null;
        if(args.expectSingular(expected.sequences)){
            const numbers = args.expectCount(expected.numbers);
            const functions = args.expectCount(expected.functions);
            if(numbers === 0 && functions === 0){
                method = function(){
                    return implementation(this);
                };
            }else if(numbers === 0 || functions === 0){
                const validate = function(argz){
                    const found = args.countTypes(argz);
                    const counts = args.countSeparated(found);
                    counts.sequences++;
                    if(!args.satisfied(expected, counts)){
                        const error = args.describe.discrepancy(expected, counts);
                        throw `Error calling function: ${error}`;
                    }
                };
                if(numbers === 1 || functions === 1){
                    method = function(){
                        validate(arguments);
                        return implementation(arguments[0], this);
                    };
                }else{
                    method = function(){
                        validate(arguments);
                        return implementation(arguments, this);
                    };
                }
            }
        }
        method = method || function(){
            Array.prototype.splice.call(arguments, 0, 0, this);
            return args.validate(
                expected, arguments, implementation, function(error){
                    throw `Error calling ${name}: ${error}`;
                }
            );
        };
        method.expected = expected;
        method.raw = implementation;
        return method;
    },
    fancyAsync: function(fancy){
        return wrap.async((caller, argz) => fancy.apply(caller, argz));
    },
    methodAsync: function(method){
        return wrap.async((caller, argz) => method.apply(caller, argz));
    },
    async: function(callback){
        return function(){
            return new Promise((resolve, reject) => {
                const argz = arguments;
                hi.callAsync(() => resolve(callback(this, argz)));
            });
        };
    },
});

export default wrap;
