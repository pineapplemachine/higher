import {Sequence} from "../core/sequence";
import {isArray, isObject} from "../core/types";
import {wrap} from "../core/wrap";

// Helper function used to do an out-of-place insertion sort of object keys
const pushSorted = (value, array) => {
    if(array.length < 8){
        // Use linear insertion sort while the array is small
        for(let i = 0; i < array.length; i++){
            if(value < array[i]){
                array.splice(i, 0, value);
                return;
            }
        }
        array.push(value);
    }else{
        // Use binary insertion sort once the array is larger
        let low = 0;
        let high = array.length;
        let mid = Math.floor(high / 2);
        while(true){
            if(array[mid] < value){
                low = mid + 1;
            }else{
                high = mid;
            }
            if(low >= high){
                array.splice(low, 0, value);
                break;
            }
            mid = low + (Math.floor((high - low) / 2));
        }
    }
};

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
        detail: (`
            Enumerate the key, value pairs of an object in a deterministic order.
            Sequences produced from different objects having the same keys will
            always have the keys in their key, value pairs appear in the same
            order.
        `),
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
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ObjectSequence({}),
        hi => new ObjectSequence({a: 0}),
        hi => new ObjectSequence({a: 0, b: 1}),
        hi => new ObjectSequence({x: "hello", y: "world", z: "how", w: "do"}),
    ],
    constructor: function ObjectSequence(
        source, objectKeys = undefined
    ){
        this.source = source;
        this.keyIndex = 0;
        if(objectKeys){
            this.objectKeys = objectKeys;
        }else{
            this.objectKeys = [];
            for(const key in source) pushSorted(key, this.objectKeys);
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
