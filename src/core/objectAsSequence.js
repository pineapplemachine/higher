import {Sequence} from "./sequence";
import {isArray, isObject} from "../core/types";
import {wrap} from "../core/wrap";

export const ObjectSequence = Sequence.extend({
    summary: "Enumerate the key, value pairs of an object.",
    supportsWith: [],
    supportsAlways: [
        "length", "left", "has", "get", "copy", "reset"
    ],
    overrides: [
        "object", "newObject"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        methods: {
            "keys": {
                introduced: "higher@1.0.0",
                summary: "Get a sequence enumerating only the keys of the object.",
                returns: (`
                    This function returns a sequence enumerating the keys of
                    the object that the ObjectSequence was created from in the
                    same order that the sequence would have enumerated those
                    keys as part of key, value pairs.
                `),
            },
            "values": {
                introduced: "higher@1.0.0",
                summary: "Get a sequence enumerating only the values of the object.",
                returns: (`
                    This function returns a sequence enumerating the values of
                    the object that the ObjectSequence was created from in the
                    same order that the sequence would have enumerated those
                    values as part of key, value pairs.
                `),
            },
        },
    },
    constructor: function ObjectSequence(
        source, objectKeys = undefined
    ){
        this.source = source;
        this.keyIndex = 0;
        if(objectKeys){
            this.objectKeys = objectKeys;
        }else{
            this.objectKeys = [];
            for(const key in source) this.objectKeys.push(key);
        }
    },
    object: function(){
        return this.source;
    },
    newObject: function(){
        const result = {};
        for(const key of this.objectKeys){
            result[key] = this.source[key];
        }
        return result;
    },
    keys: function(){
        // TODO: It might be cleaner to return a more specialized sequence type
        return new ArraySequence(this.keys);
    },
    values: function(){
        return new ObjectValuesSequence(this.source, this.objectKeys);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.keyIndex >= this.objectKeys.length;
    },
    length: function(){
        return this.objectKeys.length;
    },
    left: function(){
        return this.objectKeys.length - this.keyIndex;
    },
    front: function(){
        const key = this.objectKeys[this.keyIndex];
        return {key: key, value: this.source[key]};
    },
    popFront: function(){
        return this.keyIndex++;
    },
    // These operations are technically possible but conceptually dodgy
    // TODO: Should they be supported anyway?
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: function(i){
        return i in this.source;
    },
    get: function(i){
        return this.source[i];
    },
    copy: function(){
        const copy = new ObjectSequence(this.source, this.objectKeys);
        copy.keyIndex = this.keyIndex;
        return copy;
    },
    reset: function(){
        this.keyIndex = 0;
        return this;
    },
    rebase: null,
});

export const ObjectValuesSequence = Sequence.extend({
    summary: "Enumerate the values of an object.",
    supportsWith: [],
    supportsAlways: [
        "length", "left", "has", "get", "copy", "reset"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        methods: {},
    },
    constructor: function ObjectValuesSequence(
        source, objectKeys = undefined
    ){
        this.source = source;
        this.objectKeys = objectKeys || Object.objectKeys(source);
        this.keyIndex = 0;
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.keyIndex >= this.objectKeys.length;
    },
    length: function(){
        return this.objectKeys.length;
    },
    left: function(){
        return this.objectKeys.length - this.keyIndex;
    },
    front: function(){
        return this.source[this.objectKeys[this.keyIndex]];
    },
    popFront: function(){
        return this.keyIndex++;
    },
    // These operations are technically possible but conceptually dodgy
    // TODO: Should they be supported anyway?
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: function(i){
        return i in this.source;
    },
    get: function(i){
        return this.source[i];
    },
    copy: function(){
        const copy = new ObjectSequence(this.source, this.objectKeys);
        copy.keyIndex = this.keyIndex;
        return copy;
    },
    reset: function(){
        this.keyIndex = 0;
        return this;
    },
    rebase: null,
});

export const objectAsSequence = wrap({
    name: "objectAsSequence",
    summary: "Get a sequence enumerating the key, value pairs of an object.",
    attachSequence: false,
    async: false,
    asSequence: {
        // Extremely low priority converter due to how generic it is.
        // Last priority of all core converters.
        implicit: false,
        priority: 1000,
        predicate: isObject,
        bounded: () => true,
        unbounded: () => false,
    },
    arguments: {
        one: wrap.expecting.object
    },
    implementation: (source) => {
        return new ObjectSequence(source);
    },
});

export default objectAsSequence;
