import {asImplicitSequence} from "../core/asSequence";
import {isArray, isObject} from "../core/types";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

import {asObject, ObjectError} from "./object";

export const newObject = wrap({
    name: "newObject",
    summary: "Get a new object from key, value pairs.",
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
            If the input was itself an object, the function returns a shallow
            copy of that object.
        `),
        examples: [
            "basicUsage", "objectInput"
        ],
        related: [
            "object"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.anything // TODO: Be more specific
    },
    implementation: (source) => {
        const pairs = asImplicitSequence(source);
        if(pairs){
            // Throws an error if the sequence is unbounded
            return asObject(pairs);
        }else if(isObject(source)){
            const result = {};
            for(const key in source) result[key] = source[key];
            return result;
        }else{
            throw ObjectError(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.range(0, 10).map(i => ({key: i, value: i * i}));
            const obj = seq.newObject();
            hi.assert(obj["0"] === 0);
            hi.assert(obj["2"] === 4);
            hi.assert(obj["9"] === 81);
        },
        "objectInput": hi => {
            const obj = {a: 0, b:1};
            hi.assert(hi.newObject(obj) !== obj);
        },
        "unboundedInput": hi => {
            hi.assertFail(
                () => hi.newObject(hi.repeatElement({key: "hello", value: "world"}))
            );
        },
    },
});

export default newObject;
