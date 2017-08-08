import {callAsync} from "./callAsync";
import {validateOne, validateOrdered, validateUnordered} from "./validateExpecting";
import {categorizeUnordered, toUnorderedArguments} from "./validateExpecting";

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
        return function(arg){
            return info.implementation.call(this, validateOne(arg, info.arguments));
        };
    }
};

export const getWrappedFunctionOrdered = function(info){
    if(process.env.NODE_ENV !== "development"){
        return info.implementation;
    }
    if(process.env.NODE_ENV === "development"){
        return function(...args){
            return info.implementation.call(this,
                ...validateOrdered(args, info.arguments)
            );
        };
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
            return function(...args){
                return info.implementation.call(this, args);
            };
        // Function accepts only sequences
        }else if(!info.unordered.numbers && !info.unordered.functions){
            return function(...args){
                for(let i = 0; i < args.length; i++) args[i] = asSequence(args[i]);
                return info.implementation.call(this, args);
            };
        // Function returns a combination of types
        }else{
            return function(...args){
                return info.implementation.call(this, ...toUnorderedArguments(
                    categorizeUnordered(args, info.arguments), info.arguments
                ));
            };
        }
    }
    if(process.env.NODE_ENV === "development"){
        return function(...args){
            return info.implementation.call(this, ...toUnorderedArguments(
                validateUnordered(args, info.arguments), info.arguments
            ));
        };
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
