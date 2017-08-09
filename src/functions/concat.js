import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";

export const ConcatSequence = defineSequence({
    summary: "Concatenate the contents of some input sequences.",
    supportsWith: {
        "length": "all", "left": "all", "back": "all",
        "index": "all", "slice": "all", "copy": "all", "reset": "all",
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an array of sequences as its single argument.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ConcatSequence([]),
        hi => new ConcatSequence([hi.emptySequence()]),
        hi => new ConcatSequence([hi.emptySequence(), hi.emptySequence()]),
        hi => new ConcatSequence([hi.emptySequence(), hi([]), hi([])]),
        hi => new ConcatSequence([hi([1, 2]), hi([])]),
        hi => new ConcatSequence([hi([]), hi([3, 4])]),
        hi => new ConcatSequence([hi([1, 2]), hi([3, 4])]),
        hi => new ConcatSequence([hi([1, 2]), hi([]), hi([3, 4])]),
        hi => new ConcatSequence([hi("abc"), hi("def"), hi("xyz"), hi("uvw")]),
        hi => new ConcatSequence([hi.counter()]),
        hi => new ConcatSequence([hi.repeat("hello")]),
        hi => new ConcatSequence([hi.counter(), hi.counter()]),
        hi => new ConcatSequence([hi([1, 2, 3]), hi.counter()]),
        hi => new ConcatSequence([hi.counter(), hi([1, 2, 3])]),
        hi => new ConcatSequence([hi([1, 2, 3]), hi.counter(), hi([1, 2, 3])]),
        hi => new ConcatSequence([hi.counter(), hi([1, 2, 3]), hi.counter()]),
    ],
    constructor: function ConcatSequence(
        sources, frontSourceIndex = undefined, backSourceIndex = undefined
    ){
        this.sources = sources;
        this.source = sources[0];
        this.frontSourceIndex = frontSourceIndex || 0;
        this.backSourceIndex = (backSourceIndex === undefined ?
            sources.length : backSourceIndex
        );
        this.initializeSourceIndexes(
            frontSourceIndex === undefined, backSourceIndex === undefined
        );
        let noLength = false;
        for(const source of sources){
            this.maskAbsentMethods(source);
            noLength = noLength || !source.length;
        }
        // All sources must have known length for index and slice to be supported.
        if(noLength){
            this.index = null;
            this.slice = null;
        }
    },
    initializeSourceIndexes: function(front, back){
        if(front) while(
            this.frontSourceIndex < this.backSourceIndex &&
            this.sources[this.frontSourceIndex].done()
        ){
            this.frontSourceIndex++;
        }
        if(back) while(
            this.backSourceIndex > this.frontSourceIndex &&
            this.sources[this.backSourceIndex - 1].done()
        ){
            this.backSourceIndex--;
        }
    },
    bounded: function(){
        for(const source of this.sources){
            if(!source.bounded()) return false;
        }
        return true;
    },
    unbounded: function(){
        for(const source of this.sources){
            if(source.unbounded()) return true;
        }
        return true;
    },
    done: function(){
        return this.frontSourceIndex >= this.backSourceIndex;
    },
    length: function(){
        let sum = 0;
        for(const source of this.sources) sum += source.length();
        return sum;
    },
    left: function(){
        let sum = 0;
        for(let i = this.frontSourceIndex; i < this.backSourceIndex; i++){
            sum += this.sources[i].left();
        }
        return sum;
    },
    front: function(){
        return this.sources[this.frontSourceIndex].front();
    },
    popFront: function(){
        this.sources[this.frontSourceIndex].popFront();
        while(
            this.frontSourceIndex < this.backSourceIndex &&
            this.sources[this.frontSourceIndex].done()
        ){
            this.frontSourceIndex++;
        }
    },
    back: function(){
        return this.sources[this.backSourceIndex - 1].back();
    },
    popBack: function(){
        this.sources[this.backSourceIndex - 1].popBack();
        while(
            this.frontSourceIndex < this.backSourceIndex &&
            this.sources[this.backSourceIndex - 1].done()
        ){
            this.backSourceIndex--;
        }
    },
    index: function(i){
        let offset = 0;
        for(const source of this.sources){
            const nextOffset = offset + source.length();
            if(nextOffset > i) return source.index(i - offset);
            offset = nextOffset;
        }
        return this.sources[this.sources.length - 1].index(i - offset);
    },
    slice: function(i, j){
        let offset = 0;
        const sliceSources = [];
        for(const source of this.sources){
            const nextOffset = offset + source.length();
            if(nextOffset > i){
                if(!sliceSources.length){
                    for(let k = offset; k < i; k++) source.popFront();
                }
                sliceSources.push(source);
            }
            if(nextOffset > j){
                for(let k = j; k < nextOffset; k++) source.popBack();
                break;
            }
            offset = nextOffset;
        }
        return new ConcatSequence(sliceSources);
    },
    copy: function(){
        const copies = [];
        for(const source of this.sources){
            copies.push(source.copy());
        }
        return new ConcatSequence(
            copies, this.frontSourceIndex, this.backSourceIndex
        );
    },
    reset: function(){
        for(const source of this.sources) source.reset();
        this.frontSourceIndex = 0;
        this.backSourceIndex = this.sources.length;
        this.initializeSourceIndexes(true, true);
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.sources[0] = source;
        return this;
    },
});

export const concat = wrap({
    name: "concat",
    summary: "Get a sequence that is the concatenation of some input sequences.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function accepts any number of sequences of any kind as input.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements of
            the first input sequence, followed by the elements of the second,
            and so on.
            If no input sequences were provided, then the function returns an
            empty sequence.
        `),
        returnTypes: {
            "EmptySequence": "When no sequences were given as input",
            "typeof first argument": "When exactly one sequence was given as input",
            "ConcatSequence": "When more than one sequence was given as input",
        },
        examples: [
            "basicUsage", "basicUsageStrings",
        ],
        related: [
            "flatten", "join", "roundRobin",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            sequences: "*",
        },
    },
    implementation: (sources) => {
        if(sources.length <= 0){
            return new EmptySequence();
        }else if(sources.length === 1){
            return sources[0];
        }else{
            return new ConcatSequence(sources);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.concat([1, 2, 3], [4, 5, 6]);
            hi.assertEqual(seq, [1, 2, 3, 4, 5, 6]);
        },
        "basicUsageStrings": hi => {
            const seq = hi.concat("hello world!", " ", "how are you?");
            hi.assertEqual(seq, "hello world! how are you?");
        },
        "noInputs": hi => {
            hi.assertEmpty(hi.concat());
        },
        "oneInput": hi => {
            hi.assertEqual(hi.concat([1, 2, 3]), [1, 2, 3]);
            hi.assertEqual(hi.concat("hello"), "hello");
        },
        "emptyInputs": hi => {
            hi.assertEmpty(hi.concat(hi.emptySequence()));
            hi.assertEmpty(hi.concat(hi.emptySequence(), hi.emptySequence()));
            hi.assertEmpty(hi.concat(hi.emptySequence(), hi.emptySequence(), [], []));
            hi.assertEqual(hi.concat([], [1, 2, 3]), [1, 2, 3]);
            hi.assertEqual(hi.concat([1, 2, 3], []), [1, 2, 3]);
            hi.assertEqual(hi.concat([1, 2], [], [3, 4]), [1, 2, 3, 4]);
        },
        "unboundedInput": hi => {
            const seq = hi.concat("abc", hi.repeat("def"), "ghi");
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith("abcdefdefdefdef"));
            hi.assert(seq.endsWith("defdefdefdefghi"));
        },
    },
});

export default concat;
