import {defineSequence} from "../core/defineSequence";
import {isPlainObject} from "../core/types";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";

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

export const ObjectSequence = defineSequence({
    summary: "Enumerate the key, value pairs of an object.",
    supportsAlways: [
        "length", "back", "index", "slice", "has", "get", "copy",
    ],
    overrides: {
        object: {none: true},
        newObject: {none: true},
        keys: {none: true},
        values: {none: true},
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an object as input.
        `),
        developers: (`
            Sequences produced from different objects having the same keys will
            always enumerate the keys of their key, value pairs in the same
            order.
        `),
        methods: {
            "keys": {
                introduced: "higher@1.0.0",
                summary: "Get a sequence enumerating only the keys of the object.",
                expects: "The function accepts no arguments.",
                returns: (`
                    The function returns a sequence enumerating the keys of
                    the object that the ObjectSequence was created from in the
                    same order that the sequence would have enumerated those
                    keys as part of key, value pairs.
                `),
                returnType: "sequence",
                examples: ["keysBasicUsage"],
            },
            "values": {
                introduced: "higher@1.0.0",
                summary: "Get a sequence enumerating only the values of the object.",
                expects: "The function accepts no arguments.",
                returns: (`
                    The function returns a sequence enumerating the values of
                    the object that the ObjectSequence was created from in the
                    same order that the sequence would have enumerated those
                    values as part of key, value pairs.
                `),
                returnType: "sequence",
                examples: ["valuesBasicUsage"],
            },
        },
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "keysBasicUsage": hi => {
            const object = {hello: 100, world: 300};
            const seq = new hi.sequence.ObjectSequence(object);
            hi.assertEqual(seq.keys(), ["hello", "world"]);
        },
        "valuesBasicUsage": hi => {
            const object = {hello: 100, world: 300};
            const seq = new hi.sequence.ObjectSequence(object);
            hi.assertEqual(seq.values(), [100, 300]);
        },
        "objectOverload": hi => {
            const object = {hello: 100, world: 300};
            const seq = new hi.sequence.ObjectSequence(object);
            hi.assert(seq.object() === object);
        },
        "newObjectOverload": hi => {
            const object = {hello: 100, world: 300};
            const seq = new hi.sequence.ObjectSequence(object);
            const newObject = seq.newObject();
            hi.assert(newObject !== object);
            hi.assertEqual(newObject, object);
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ObjectSequence({}),
        hi => new ObjectSequence({a: 0}),
        hi => new ObjectSequence({a: 0, b: 1}),
        hi => new ObjectSequence({x: "hello", y: "world", z: "how", w: "do"}),
    ],
    converter: {
        implicit: false,
        after: {
            arrayAsSequence: true,
            stringAsSequence: true,
            iterableAsSequence: true,
        },
        predicate: isPlainObject,
        bounded: () => true,
        unbounded: () => false,
    },
    constructor: function ObjectSequence(
        source, objectKeys = undefined, lowIndex = undefined,
        highIndex = undefined, frontIndex = undefined, backIndex = undefined
    ){
        this.source = source;
        if(objectKeys){
            this.objectKeys = objectKeys;
        }else{
            this.objectKeys = [];
            for(const key in source) pushSorted(key, this.objectKeys);
        }
        this.lowIndex = lowIndex || 0;
        this.highIndex = highIndex === undefined ? this.objectKeys.length : highIndex;
        this.frontIndex = frontIndex === undefined ? this.lowIndex : frontIndex;
        this.backIndex = backIndex === undefined ? this.highIndex : backIndex;
    },
    object: function(){
        if(this.lowIndex === 0 && this.highIndex === this.objectKeys.length){
            return this.source;
        }else{
            const result = {};
            for(let i = this.lowIndex; i < this.highIndex; i++){
                result[this.objectKeys[i]] = this.source[this.objectKeys[i]];
            }
            return result;
        }
    },
    newObject: function(){
        const result = {};
        for(let i = this.lowIndex; i < this.highIndex; i++){
            result[this.objectKeys[i]] = this.source[this.objectKeys[i]];
        }
        return result;
    },
    keys: function(){
        // TODO: It might be cleaner to return a more specialized sequence type
        return new ArraySequence(this.objectKeys, this.lowIndex, this.highIndex);
    },
    values: function(){
        return new ObjectValuesSequence(this.source, this.objectKeys);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    front: function(){
        const key = this.objectKeys[this.frontIndex];
        return {key: key, value: this.source[key]};
    },
    popFront: function(){
        return this.frontIndex++;
    },
    back: function(){
        const key = this.objectKeys[this.backIndex - 1];
        return {key: key, value: this.source[key]};
    },
    popBack: function(){
        return this.backIndex--;
    },
    index: function(i){
        const key = this.objectKeys[i + this.lowIndex];
        return {key: key, value: this.source[key]};
    },
    slice: function(i, j){
        const sequence = new ObjectSequence(
            this.source, this.objectKeys, this.lowIndex + i, this.lowIndex + j
        );
        sequence.has = undefined;
        sequence.get = undefined;
        return sequence;
    },
    has: function(i){
        return i in this.source;
    },
    get: function(i){
        return this.source[i];
    },
    copy: function(){
        return new ObjectSequence(
            this.source, this.objectKeys, this.lowIndex,
            this.highIndex, this.frontIndex, this.backIndex
        );
    },
});

export const ObjectValuesSequence = defineSequence({
    summary: "Enumerate the values of an object.",
    supportsAlways: [
        "length", "back", "index", "slice", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an object as input.
        `),
        developers: (`
            Sequences produced from different objects having the same keys will
            always enumerate the keys of their key, value pairs in the same
            order.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ObjectValuesSequence({}),
        hi => new ObjectValuesSequence({a: 0}),
        hi => new ObjectValuesSequence({a: 0, b: 1}),
        hi => new ObjectValuesSequence({x: "hello", y: "world", z: "how", w: "do"}),
    ],
    constructor: function ObjectValuesSequence(
        source, objectKeys = undefined, lowIndex = undefined,
        highIndex = undefined, frontIndex = undefined, backIndex = undefined
    ){
        this.source = source;
        if(objectKeys){
            this.objectKeys = objectKeys;
        }else{
            this.objectKeys = [];
            for(const key in source) pushSorted(key, this.objectKeys);
        }
        this.lowIndex = lowIndex || 0;
        this.highIndex = highIndex === undefined ? this.objectKeys.length : highIndex;
        this.frontIndex = frontIndex === undefined ? this.lowIndex : frontIndex;
        this.backIndex = backIndex === undefined ? this.highIndex : backIndex;
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    front: function(){
        return this.source[this.objectKeys[this.frontIndex]];
    },
    popFront: function(){
        return this.frontIndex++;
    },
    back: function(){
        return this.source[this.objectKeys[this.backIndex - 1]];
    },
    popBack: function(){
        return this.backIndex--;
    },
    index: function(i){
        return this.source[this.objectKeys[i + this.lowIndex]];
    },
    slice: function(i, j){
        return new ObjectValuesSequence(
            this.source, this.objectKeys, this.lowIndex + i, this.lowIndex + j
        );
    },
    copy: function(){
        return new ObjectValuesSequence(
            this.source, this.objectKeys, this.lowIndex,
            this.highIndex, this.frontIndex, this.backIndex
        );
    },
});

export const objectAsSequence = wrap({
    name: "objectAsSequence",
    summary: "Get a sequence enumerating the key, value pairs of an object.",
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.object
    },
    implementation: (source) => {
        return new ObjectSequence(source);
    },
});

export default objectAsSequence;
