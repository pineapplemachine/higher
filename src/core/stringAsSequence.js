import {Sequence} from "./sequence";
import {isInteger, isString} from "../core/types";
import {wrap} from "../core/wrap";

export const StringSequence = Sequence.extend({
    summary: "Enumerate the characters in a string.",
    supportsWith: [],
    supportsAlways: [
        "length", "left", "back", "index", "slice", "has", "get", "copy", "reset"
    ],
    overrides: [
        "string"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        methods: {},
    },
    constructor: function StringSequence(
        source, lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.highIndex = highIndex === undefined ? source.length : highIndex;
        this.frontIndex = frontIndex === undefined ? this.lowIndex : frontIndex;
        this.backIndex = backIndex === undefined ? this.highIndex : backIndex;
    },
    string: function(){
        if(this.lowIndex === 0 && this.highIndex === this.source.length){
            return this.source;
        }else{
            return this.source.slice(this.lowIndex, this.highIndex);
        }
    },
    stringAsync: function(){
        return new constants.Promise((resolve, reject) => resolve(this.string()));
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.backIndex;
    },
    length: function(){
        return this.source.length;
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
        return new StringSequence(
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
        return new StringSequence(
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

export const stringAsSequence = wrap({
    name: "stringAsSequence",
    summary: "Get a sequence for enumerating the characters in a string.",
    attachSequence: false,
    async: false,
    asSequence: {
        // Comes after only array conversion and before generic iterable conversion.
        priority: -800,
        predicate: isString,
        bounded: () => true,
        unbounded: () => false,
    },
    arguments: {
        one: wrap.expecting.string
    },
    implementation: (source) => {
        return new StringSequence(source);
    },
});

export default stringAsSequence;
