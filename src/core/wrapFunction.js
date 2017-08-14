import {asSequence} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {lightWrap} from "./lightWrap";
import {isSequence} from "./sequence";
import {validateOne, validateOrdered, validateUnordered} from "./validateExpecting";
import {categorizeUnordered, toUnorderedArguments} from "./validateExpecting";

const testWrappedFunction = process.env.NODE_ENV !== "development" ? undefined : (info, test) => {
    test(getWrappedFunction(info, false));
    test(getWrappedFunction(info, true));
};

export const getWrappedFunction = lightWrap({
    internal: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function getWrappedFunction(info, isMethod){
        if(info.arguments.none || info.arguments.anything){
            return info.implementation;
        }else if(info.arguments.one){
            return getWrappedFunctionOne(info, isMethod);
        }else if(info.arguments.ordered){
            return getWrappedFunctionOrdered(info, isMethod);
        }else if(info.arguments.unordered){
            return getWrappedFunctionUnordered(info, isMethod);
        }else{
            throw new Error("Invalid arguments information for wrapped function.");
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "noArguments": hi => {
            testWrappedFunction({
                arguments: {none: true},
                implementation: () => "!",
            }, func => {
                hi.assert(func() === "!");
            });
        },
        "oneArgument": hi => {
            testWrappedFunction({
                arguments: {one: hi.expecting.number},
                implementation: n => n,
            }, (func, dev) => {
                hi.assert(func(0) === 0);
                hi.assertFailWith(hi.error.ArgumentsError,
                    () => func("not a number")
                );
            });
        },
        "orderedArguments": hi => {
            testWrappedFunction({
                arguments: {ordered: 
                    {order: [hi.expecting.string, hi.expecting.number]},
                },
                implementation: (str, n) => `${str}(${n})`,
            }, func => {
                hi.assert(func("ok", 0) === "ok(0)");
                hi.assert(func("", 100) === "(100)");
                hi.assertFailWith(hi.error.ArgumentsError,
                    () => func("", "")
                );
                hi.assertFailWith(hi.error.ArgumentsError,
                    () => func("", undefined)
                );
            });
        },
    },
});

export const getWrappedFunctionOne = function(info, isMethod){
    if(isMethod){
        return function(arg){
            return info.implementation.call(this, validateOne(arg, info.arguments));
        };
    }else{
        return function(arg){
            const one = validateOne(arg, info.arguments);
            if(isSequence(one) && one.overrides[info.name]){
                return one[info.name]();
            }else{
                return info.implementation.call(this, one);
            }
        };
    }
};

export const getWrappedFunctionOrdered = function(info, isMethod){
    if(isMethod){
        return function(...args){
            const validatedArgs = validateOrdered(args, info.arguments);
            return info.implementation.apply(this, validatedArgs);
        };
    }else{
        return function(...args){
            if(args[0] && info.arguments.ordered.order[0].sequence){
                args[0] = asSequence(args[0]);
                if(args[0] && args[0].overrides[info.name]){
                    const sequence = args[0];
                    args.splice(0, 1);
                    return sequence[info.name](args);
                }
            }
            return info.implementation.apply(
                this, validateOrdered(args, info.arguments)
            );
        };
    }
};

export const getWrappedFunctionUnordered = function(info, isMethod, forceProd){
    if(process.env.NODE_ENV !== "development" || forceProd){
        // TODO: These optimizations really need to be checked by automated tests
        const unordered = info.arguments.unordered;
        if(!unordered.sequences && (!unordered.numbers || !unordered.functions)){
            if(isMethod){
                return function(...args){
                    for(let i = 0; i < args.length; i++) args[i] = asSequence(args[i]);
                    return info.implementation.call(this, args);
                };
            }else{
                return function(...args){
                    for(let i = 0; i < args.length; i++) args[i] = asSequence(args[i]);
                    if(args[0] && args[0].overrides[info.name]){
                        const sequence = args[0];
                        args.splice(0, 1);
                        return sequence[info.name].call(this, args);
                    }else{
                        return info.implementation.call(this, args);
                    }
                };
            }
        }else if(!unordered.numbers && !unordered.functions){
            return function(...args){
                return info.implementation.call(this, args);
            };
        }
    }
    if(isMethod){
        return function(...args){
            const foundArgs = validateUnordered(args, info.arguments);
            const passArgs = toUnorderedArguments(foundArgs, info.arguments);
            return info.implementation.apply(this, passArgs);
        };
    }else{
        return function(...args){
            const found = categorizeUnordered(args);
            if(found.sequences[0] && found.sequences[0].overrides[info.name]){
                const sequence = found.sequences[0];
                found.sequences.splice(0, 1);
                const validated = validateUnordered(
                    undefined, sequence[info.name].expects, undefined, found
                );
                const passArgs = toUnorderedArguments(
                    validated, sequence[info.name].expects
                );
                sequence[info.name].implementation.apply(this, passArgs);
            }else{
                const validated = validateUnordered(
                    undefined, info.arguments, undefined, found
                );
                const passArgs = toUnorderedArguments(validated, info.arguments);
                return info.implementation.apply(this, passArgs);
            }
        };
    }
};

export const getWrappedMethod = function(info){
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
};

export const getWrappedMethodAnything = function(info){
    const implementation = info.methodImplementation || info.implementation;
    return function(...args){
        return implementation(this, ...args);
    };
};

export const getWrappedMethodOne = function(info){
    const implementation = info.methodImplementation || info.implementation;
    return function(){
        return implementation(validateOne(this, info.arguments));
    };
};

export const getWrappedMethodOrdered = function(info){
    const implementation = info.methodImplementation || info.implementation;
    return function(...args){
        args.splice(0, 0, this);
        return implementation.apply(this, validateOrdered(args, info.arguments));
    };
};

export const getWrappedMethodUnordered = function(info, forceProd){
    const implementation = info.methodImplementation || info.implementation;
    // TODO: This branch really needs to be checked by automated tests
    if(process.env.NODE_ENV !== "development" || forceProd){
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
            callAsync(() => resolve(wrapped.apply(this, args)));
        });
    };
};
