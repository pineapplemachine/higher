import {Sequence} from "../core/sequence";
import {isArray, isInteger} from "../core/types";
import {wrap} from "../core/wrap";

export const ArraySequence = Sequence.extend({
    summary: "Enumerate the contents of an array.",
    supportsWith: [],
    supportsAlways: [
        "length", "left", "back", "index", "slice", "has", "get", "copy", "reset"
    ],
    overrides: [
        "array", "newArray"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        methods: {},
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ArraySequence([]),
        hi => new ArraySequence([0]),
        hi => new ArraySequence(["hello", "world"]),
        hi => new ArraySequence([0, 1, 2, 3, 4, 5, 6]),
        hi => new ArraySequence([[0, 1], [1, 2]]),
    ],
    constructor: function ArraySequence(
        source, lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.highIndex = highIndex === undefined ? source.length : highIndex;
        this.frontIndex = frontIndex === undefined ? this.lowIndex : frontIndex;
        this.backIndex = backIndex === undefined ? this.highIndex : backIndex;
    },
    [Symbol.iterator]: function(){
        if(this.lowIndex === 0 && this.highIndex === this.source.length){
            return this.source[Symbol.iterator]();
        }else{
            return this;
        }
    },
    array: function(limit){
        if(limit <= 0){
            return [];
        }else if(this.lowIndex !== 0 || this.highIndex !== this.source.length){
            if(!limit){
                return this.source.slice(this.lowIndex, this.highIndex);
            }else{
                const length = this.source.length - this.lowIndex;
                return this.source.slice(this.lowIndex, this.lowIndex + (
                    limit < length ? limit : length
                ));
            }
        }else if(!limit || limit >= this.source.length){
            return this.source;
        }else{
            return this.source.slice(limit);
        }
    },
    arrayAsync: function(limit){
        return new constants.Promise((resolve, reject) => resolve(this.array(limit)));
    },
    newArray: function(limit){
        if(limit <= 0){
            return [];
        }else if(!limit || limit >= this.source.length){
            return this.source.slice();
        }else{
            return this.source.slice(limit);
        }
    },
    newArrayAsync: function(limit){
        return new constants.Promise((resolve, reject) => resolve(this.newArray(limit)));
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.highIndex - this.lowIndex;
    },
    left: function(){
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        return this.source[this.frontIndex];
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.source[this.backIndex - 1];
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        return this.source[this.lowIndex + i];
    },
    slice: function(i, j){
        return new ArraySequence(
            this.source, this.lowIndex + i, this.lowIndex + j
        );
    },
    has: function(i){
        return isInteger(i) && i >= 0 && i < this.length();
    },
    get: function(i){
        return this.source[i - this.lowIndex];
    },
    copy: function(){
        return new ArraySequence(
            this.source, this.lowIndex, this.highIndex,
            this.frontIndex, this.backIndex
        );
    },
    reset: function(){
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        return this;
    },
    rebase: null,
});

export const arrayAsSequence = wrap({
    name: "arrayAsSequence",
    summary: "Get a sequence for enumerating the contents of an array.",
    attachSequence: false,
    async: false,
    asSequence: {
        // First priority core converter
        implicit: true,
        priority: -1000,
        predicate: isArray,
        bounded: () => true,
        unbounded: () => false,
    },
    arguments: {
        one: wrap.expecting.array
    },
    implementation: (source) => {
        return new ArraySequence(source);
    },
});

export default arrayAsSequence;
