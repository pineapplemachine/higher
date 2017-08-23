import {defineSequence} from "../core/defineSequence";
import {isInteger, isString} from "../core/types";
import {wrap} from "../core/wrap";

export const StringSequence = defineSequence({
    summary: "Enumerate the characters in a string.",
    supportsAlways: [
        "length", "left", "back", "index", "slice", "has", "get", "copy", "reset",
    ],
    overrides: [
        Symbol.iterator, "string",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a string as input.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new StringSequence(""),
        hi => new StringSequence("0"),
        hi => new StringSequence("hi"),
        hi => new StringSequence("xyz"),
        hi => new StringSequence("hello"),
        hi => new StringSequence("null"),
        hi => new StringSequence("undefined"),
        hi => new StringSequence("once upon a midnight dreary"),
    ],
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "iteratorOverride": hi => {
            const seq = new hi.sequence.StringSequence("xyz");
            let acc = "";
            for(const ch of seq) acc += ch;
            for(const ch of seq.slice(1, 3)) acc += ch;
            hi.assert(acc === "xyzyz");
        },
        "stringOverride": hi => {
            const seq = new hi.sequence.StringSequence("hello world");
            hi.assert(seq.string() === "hello world");
            hi.assert(seq.slice(1, 5).string() === "ello");
        },
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
    [Symbol.iterator]: function(){
        if(this.lowIndex === 0 && this.highIndex === this.source.length){
            return this.source[Symbol.iterator]();
        }else{
            return this;
        }
    },
    string: function(){
        if(this.lowIndex === 0 && this.highIndex === this.source.length){
            return this.source;
        }else{
            return this.source.nativeSlice(this.lowIndex, this.highIndex);
        }
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
        return isInteger(i) && i >= 0 && i < this.nativeLength();
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
});

export const stringAsSequence = wrap({
    name: "stringAsSequence",
    summary: "Get a sequence for enumerating the characters in a string.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function accepts any value as its single argument, which is
            then coerced to a string if was not already one.
        `),
        returns: (`
            The function returns a sequence for enumerating the characters of
            the input string.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "arrayAsSequence", "iterableAsSequence",
        ],
    },
    attachSequence: false,
    async: false,
    asSequence: {
        // Comes after only array conversion and before generic iterable conversion.
        implicit: false,
        priority: -800,
        predicate: isString,
        bounded: () => true,
        unbounded: () => false,
    },
    arguments: {
        one: wrap.expecting.anything
    },
    implementation: (source) => {
        return new StringSequence(String(source));
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.stringAsSequence("yo");
            hi.assert(seq.nextFront() === "y");
            hi.assert(seq.nextFront() === "o");
            hi.assert(seq.done());
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.stringAsSequence(""));
        },
        "asSequence": hi => {
            hi.assertEqual(hi.asSequence("some string"), "some string");
        },
    },
});

export default stringAsSequence;
