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
        Symbol.iterator, "array", "newArray"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an array as its single argument.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "iteratorOverride": hi => {
            const seq = new hi.sequence.ArraySequence([1, 2, 3]);
            const acc = [];
            for(const ch of seq) acc.push(ch);
            for(const ch of seq.slice(1, 3)) acc.push(ch);
            hi.assertEqual(acc, [1, 2, 3, 2, 3]);
        },
        "arrayOverride": hi => {
            const array = [1, 2, 3, 4];
            const seq = new hi.sequence.ArraySequence(array);
            hi.assert(seq.array() === array);
            hi.assertEqual(seq.array(), [1, 2, 3, 4]);
            hi.assertEqual(seq.slice(1, 3).array(), [2, 3]);
        },
        "newArrayOverride": hi => {
            const array = [1, 2, 3, 4];
            const seq = new hi.sequence.ArraySequence(array);
            hi.assert(seq.newArray() !== array);
            hi.assertEqual(seq.newArray(), [1, 2, 3, 4]);
            hi.assertEqual(seq.slice(1, 3).newArray(), [2, 3]);
        },
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
    array: function(){
        if(this.lowIndex !== 0 || this.highIndex !== this.source.length){
            return this.source.slice(this.lowIndex, this.highIndex);
        }else{
            return this.source;
        }
    },
    newArray: function(){
        return this.source.slice(this.lowIndex, this.highIndex);
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
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an array as its single argument.
        `),
        returns: (`
            The function returns a sequence for enumerating the elements of
            the input array.
        `),
        returnType: "ArraySequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "stringAsSequence", "iterableAsSequence",
        ],
    },
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
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.arrayAsSequence([1, 2, 3]);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 2);
            hi.assert(seq.nextFront() === 3);
            hi.assert(seq.done());
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.arrayAsSequence([]));
        },
        "asSequence": hi => {
            hi.assertEqual(hi.asSequence([1, 2, 3]), [1, 2, 3]);
        },
    },
});

export default arrayAsSequence;
