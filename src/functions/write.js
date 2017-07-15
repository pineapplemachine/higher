import {error} from "../core/error";
import {isArray, isFunction, isNumber, isString} from "../core/types";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const WriteTargetError = error({
    summary: "Write failed because the target was not an array.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the write target that was
            required to be an array, but was not.
        `),
    },
    constructor: function WriteTargetError(target){
        this.target = target;
        this.message = (
            "The 'write' function can only target arrays, but the target given " +
            `was of type '${typeof(target)}'.`
        );
        // User probably meant to build a string
        if(isString(target)) this.message += " " + (
            "To produce a string from a sequence, try using the 'string' method."
        );
        // User probably meant to build an object
        else if(
            target && target !== true && !isNumber(target) && !isFunction(target)
        ) this.message += " " + (
            "Try performing an out-of-place write with the or 'object' method, " +
            "or try constructing an object procedurally using the 'each' " +
            "or 'forEach' method."
        );
    },
});

export const write = wrap({
    name: "write",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            numbers: "?",
            sequences: 2,
            allowIterables: true
        }
    },
    implementation: (limit, sequences) => {
        const source = sequences[0];
        const target = sequences[1];
        if(!isArray(target)){
            throw WriteTargetError(target);
        }
        if(isSequence(source) && source.root() === target){
            return source.collapse();
        }
        const iter = source.next ? source : source[Symbol.iterator]();
        let i = 0;
        if(limit === 0){
            // Do nothing
        }else if(!limit){
            NotBoundedError.enforce(target, {
                message: "Failed to write sequence to array",
                limitArgument: true,
            });
            let item = iter.next();
            while(!item.done && i < target.length){
                target[i++] = item.value;
                item = iter.next();
            }
            while(!item.done){
                target.push(item.value);
                item = iter.next();
            }
        }else{
            let item = iter.next();
            const firstLimit = target.length < limit ? target.length : limit;
            while(!item.done && i < firstLimit){
                target[i++] = item.value;
                item = iter.next();
            }
            while(!item.done && i < limit){
                target.push(item.value);
                item = iter.next();
                i++;
            }
        }
        return target;
    },
});

export default write;
