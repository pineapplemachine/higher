import {asImplicitSequence} from "../core/asSequence";
import {error} from "../core/error";
import {isArray, isObject} from "../core/types";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const asObject = (pairs) => {
    if(!pairs.bounded()) throw NotBoundedError(pairs, {
        message: "Failed to create object from sequence"
    });
    const result = {};
    for(const pair of pairs){
        if("key" in pair){
            result[pair.key] = pair.value;
        }else if(pair.length && isArray(pair)){
            result[pair[0]] = pair[1];
        }
    }
    return result;
};

export const ObjectError = error({
    summary: "Failed to create object because the input was not a sequence nor object.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the value which was
            required to be a sequence or an object, but was not.
        `),
    },
    constructor: function ObjectError(source){
        this.source = source;
        this.message = (
            "Failed to create object from key, value pairs because the input was " +
            "not a bounded sequence of key, value pairs nor itself an object."
        );
    },
});

export const object = wrap({
    name: "object",
    summary: "Get an object from key, value pairs.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects either an object or a known-bounded sequence
            of key, value pairs.
            Key, value pairs are objects with a "key" attribute or arrays with
            at least one element.
        `),
        returns: (`
            The function returns an object with the key, value pairs as
            described by the input.
            If the input was itself an object, the function returns its input.
        `),
        examples: [
            "basicUsage", "objectInput"
        ],
        related: [
            "newObject"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.anything // TODO: Be more specific, ditch ObjectError
    },
    implementation: (source) => {
        const pairs = asImplicitSequence(source);
        if(pairs){
            // Throws an error if the sequence is unbounded
            return asObject(pairs);
        }else if(isObject(source)){
            return source;
        }else{
            throw ObjectError(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.range(0, 10).map(i => ({key: i, value: i * i}));
            const obj = seq.object();
            hi.assert(obj["0"] === 0);
            hi.assert(obj["2"] === 4);
            hi.assert(obj["9"] === 81);
        },
        "objectInput": hi => {
            const obj = {a: 0, b:1};
            hi.assert(hi.object(obj) === obj);
        },
        "unboundedInput": hi => {
            hi.assertFail(
                () => hi.object(hi.repeatElement({key: "hello", value: "world"}))
            );
        },
    },
});

export default object;
