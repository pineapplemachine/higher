import {asSequence} from "./asSequence";
import {unorderedAmountSingular} from "./expecting";
import {isArray, isFunction, isNumber} from "./types";

import {ArgumentsError} from "../errors/ArgumentsError";

// Validate arguments for a function expecting one argument.
export const validateOne = function(arg, expecting){
    if(process.env.NODE_ENV !== "development"){
        return expecting.one(arg);
    }else{
        try{
            return expecting.one(arg);
        }catch(error){
            throw ArgumentsError({
                expects: expecting, violation: {one: true, wasNot: expecting.one}
            });
        }
    }
}

// Validate arguments for a function expecting ordered arguments.
export const validateOrdered = function(args, expecting){
    const ordered = expecting.ordered;
    if(process.env.NODE_ENV !== "development"){
        for(i = 0; i < ordered.order.length; i++){
            args[i] = ordered.order[i](args[i]);
        }
        if(ordered.plusVariadic && ordered.plusVariadic.type.transforms){
            for(; i < args.length; i++){
                args[i] = ordered.plusVariadic.type(args[i]);
            }
        }
        return args;
    }else{
        let i;
        try{
            for(i = 0; i < ordered.order.length; i++){
                args[i] = ordered.order[i](args[i]);
            }
        }catch(error){
            throw ArgumentsError({
                expects: expecting,
                violation: {index: i, wasNot: ordered.order[i]},
            });
        }
        if(ordered.plusVariadic){
            const foundVariadic = Math.max(0, args.length - ordered.order.length);
            const variadicType = {
                singular: "additional argument", plural: "additional arguments",
            };
            if(!satisfiesUnordered(foundVariadic, ordered.plusVariadic.amount)){
                throw ArgumentsError({
                    expects: expecting,
                    violation: {type: foundVariadic, wrongAmount: foundVariadic}
                });
            }
            try{
                for(; i < args.length; i++){
                    args[i] = ordered.plusVariadic.type(args[i]);
                }
            }catch(error){
                throw ArgumentsError({
                    expects: expecting,
                    violation: {index: i, wasNot: ordered.plusVariadic.type},
                });
            }
        }
        return args;
    }
};

// Validate arguments for a function expecting unordered arguments.
export const validateUnordered = function(
    args, expecting, extraSequence = undefined, alreadyFound = undefined
){
    const found = alreadyFound || categorizeUnordered(args, expecting);
    const expect = expecting.unordered;
    // Prepend a sequence passed by a method wrapper prior to validation.
    if(extraSequence){
        found.sequences.splice(0, 0, extraSequence);
    }
    // Short-circuit remaining validation logic in production builds.
    if(process.env.NODE_ENV !== "development"){
        return found;
    }
    // Check argument counts and apply "any", "all", and "ordered" validators.
    for(const type of ["numbers", "functions", "sequences"]){
        // Validate that there are an acceptable number of arguments of the type.
        if(
            (!expect[type] && found[type].length) ||
            (expect[type] && !satisfiesUnordered(found[type].length, expect[type].amount))
        ){
            throw ArgumentsError({
                expects: expecting,
                violation: {type: type, wrongAmount: found[type].length}
            });
        }
        // Ordered per argument type validation, if given.
        if(expect[type] && expect[type].order){
            for(let i = 0; i < found[type].length; i++){
                try{
                    if(expect[type].order[i]) expect[type].order[i](found[type][i]);
                }catch(error){
                    throw ArgumentsError({
                        expects: expecting,
                        violation: {
                            order: true, type: type, index: i,
                            wasNot: expect[type].order[i],
                        }
                    });
                }
            }
        }
        // Check that all arguments satisfy a validator, if given.
        if(expect[type] && expect[type].all){
            for(let i = 0; i < found[type].length; i++){
                try{
                    expect[type].all(found[type][i]);
                }catch(error){
                    throw ArgumentsError({
                        expects: expecting, 
                        violation: {
                            all: true, type: type, index: i,
                            wasNot: expect[type].all,
                        },
                    });
                }
            }
        }
        // Check that at least one argument satisfies a validator, if given.
        if(expect[type] && expect[type].any){
            let success = false;
            for(let i = 0; i < found[type].length; i++){
                try{
                    expect[type].any(found[type][i]);
                    success = true;
                    break;
                }catch(error){
                    // Do nothing
                }
            }
            if(!success) throw ArgumentsError({
                expects: expecting,
                violation: {any: true, type: type, wasNot: expect[type].any},
            });
        }
    }
    // All done! Return the categorized arguments.
    return found;
};

// Categorize and retrieve arguments for a function expecting unordered arguments.
export const categorizeUnordered = function(args, expecting){
    const found = {
        numbers: [],
        functions: [],
        sequences: [],
    };
    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        if(isNumber(arg)){
            found.numbers.push(arg);
        }else{
            const sequence = asSequence(arg);
            if(sequence) found.sequences.push(sequence);
            else if(isFunction(arg)) found.functions.push(arg);
            else throw ArgumentsError({
                expects: expecting, violation: {invalid: true, index: i}
            });
        }
    }
    return found;
};

// Get whether a number of found unordered arguments of a type satisfies
// a given description of the expected amount.
export const satisfiesUnordered = function(found, amount){
    if(!amount){
        return found === 0;
    }else if(isNumber(amount)){
        return found === amount;
    }else if(isArray(amount)){
        if(amount[1] === "+") return found >= amount[0];
        else return found >= amount[0] && found >= amount[0];
    }else if(amount === "*"){
        return true;
    }else if(amount === "+"){
        return found > 0;
    }else if(amount === "?"){
        return found <= 1;
    }else{
        throw new Error(`Invalid unordered argument amount "${amount}".`);
    }
};

// Get categorized unordered arguments in a form suitable for passing to a function call
// TODO: Investigate performance gains when not concatenating a list, using branches instead
export const toUnorderedArguments = function(found, expecting){
    const args = [];
    if(expecting.unordered.numbers && expecting.unordered.numbers.amount){
        args.push(unorderedAmountSingular(expecting.unordered.numbers.amount) ?
            found.numbers[0] : found.numbers
        );
    }
    if(expecting.unordered.functions && expecting.unordered.functions.amount){
        args.push(unorderedAmountSingular(expecting.unordered.functions.amount) ?
            found.functions[0] : found.functions
        );
    }
    if(expecting.unordered.sequences && expecting.unordered.sequences.amount){
        args.push(unorderedAmountSingular(expecting.unordered.sequences.amount) ?
            found.sequences[0] : found.sequences
        );
    }
    return args;
};
