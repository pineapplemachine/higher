import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {EmptySequence} from "./emptySequence";
import {InfiniteRepeatElementSequence} from "./repeatElement";

export const SlicingNgramSequence = defineSequence({
    summary: "Enumerate n-grams in a sequence.",
    supportRequired: [
        "length", "slice",
    ],
    supportsAlways: [
        "back", "index", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number indicating n-gram size and one
            sequence as input. Ngram size must be a positive integer.
            The input sequence must have known length and support slicing.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new SlicingNgramSequence(1, hi.emptySequence()),
        hi => new SlicingNgramSequence(2, hi.emptySequence()),
        hi => new SlicingNgramSequence(3, hi.emptySequence()),
        hi => new SlicingNgramSequence(1, hi.range(1)),
        hi => new SlicingNgramSequence(3, hi.range(1)),
        hi => new SlicingNgramSequence(1, hi.range(2)),
        hi => new SlicingNgramSequence(2, hi.range(2)),
        hi => new SlicingNgramSequence(3, hi.range(2)),
        hi => new SlicingNgramSequence(1, hi.range(3)),
        hi => new SlicingNgramSequence(2, hi.range(3)),
        hi => new SlicingNgramSequence(3, hi.range(3)),
        hi => new SlicingNgramSequence(4, hi.range(3)),
        hi => new SlicingNgramSequence(1, hi("?")),
        hi => new SlicingNgramSequence(3, hi("some string")),
    ],
    constructor: function SlicingNgramSequence(
        ngramSize, source,
        lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        this.ngramSize = ngramSize;
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.highIndex = (highIndex !== undefined ?
            highIndex : Math.max(this.lowIndex, 1 + source.nativeLength() - ngramSize)
        );
        this.frontIndex = frontIndex !== undefined ? frontIndex : this.lowIndex;
        this.backIndex = backIndex !== undefined ? backIndex : this.highIndex;
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
        return this.source.nativeSlice(
            this.frontIndex, this.frontIndex + this.ngramSize
        );
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.source.nativeSlice(
            this.backIndex - 1, this.backIndex - 1 + this.ngramSize
        );
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        return this.source.nativeSlice(i, i + this.ngramSize);
    },
    slice: function(i, j){
        return new SlicingNgramSequence(
            this.ngramSize, this.source, this.lowIndex + i, this.lowIndex + j
        );
    },
    copy: function(){
        return new SlicingNgramSequence(
            this.ngramSize, this.source, this.lowIndex,
            this.highIndex, this.frontIndex, this.backIndex
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const TrackingNgramSequence = defineSequence({
    summary: "Enumerate n-grams in a sequence.",
    supportsWith: [
        "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number indicating n-gram size and one
            sequence as input. Ngram size must be a positive integer.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new TrackingNgramSequence(1, hi.emptySequence()),
        hi => new TrackingNgramSequence(3, hi.emptySequence()),
        hi => new TrackingNgramSequence(1, hi.range(1)),
        hi => new TrackingNgramSequence(3, hi.range(1)),
        hi => new TrackingNgramSequence(1, hi.range(2)),
        hi => new TrackingNgramSequence(2, hi.range(2)),
        hi => new TrackingNgramSequence(3, hi.range(2)),
        hi => new TrackingNgramSequence(2, hi.range(3)),
        hi => new TrackingNgramSequence(3, hi.range(3)),
        hi => new TrackingNgramSequence(4, hi.range(3)),
        hi => new TrackingNgramSequence(3, hi("some string")),
        hi => new TrackingNgramSequence(2, hi.repeat("hello")),
        hi => new TrackingNgramSequence(4, hi.counter()),
    ],
    constructor: function TrackingNgramSequence(
        ngramSize, source, currentNgram = undefined
    ){
        this.ngramSize = ngramSize;
        this.source = source;
        this.currentNgram = currentNgram;
        this.maskAbsentMethods(source);
    },
    initializeFront: function(){
        this.currentNgram = [];
        while(!this.source.done() && this.currentNgram.length < this.ngramSize){
            this.currentNgram.push(this.source.nextFront());
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.currentNgram) this.initializeFront();
        return this.source.done() && this.currentNgram.length < this.ngramSize;
    },
    length: function(){
        return Math.max(0, 1 + this.source.nativeLength() - this.ngramSize);
    },
    front: function(){
        if(!this.currentNgram) this.initializeFront();
        return new ArraySequence(this.currentNgram);
    },
    popFront: function(){
        if(!this.currentNgram) this.initializeFront();
        this.currentNgram = this.currentNgram.slice(1);
        if(!this.source.done()){
            if(this.source.front() === undefined) console.log(this.source.frontSource);
            this.currentNgram.push(this.source.nextFront());
        }
    },
    index: function(i){
        const ngram = [];
        for(let j = i; j < i + this.ngramSize; j++){
            ngram.push(this.source.nativeIndex(i));
        }
        return ngram;
    },
    slice: function(i, j){
        return new NgramSequence(
            this.ngramSize, this.source.nativeSlice(i, j + this.ngramSize)
        );
    },
    copy: function(){
        return new TrackingNgramSequence(
            this.ngramSize, this.source.copy(),
            this.currentNgram ? this.currentNgram.slice() : undefined
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const ngrams = wrap({
    name: "ngrams",
    summary: "Get a sequence enumerating n-grams of an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input a sequence and a n-gram length.
        `),
        returns: (`
            The function returns a sequence enumerating the n-grams of the
            specified length of the input sequence.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "bigrams", "trigrams",
        ],
        links: [
            {
                description: "Information about n-grams on Wikipedia",
                url: "https://en.wikipedia.org/wiki/N-gram",
            },
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1,
        }
    },
    implementation: (ngramSize, source) => {
        if(ngramSize < 1){
            return new InfiniteRepeatElementSequence(new EmptySequence());
        }else if(source.nativeLength && source.nativeSlice){
            return new SlicingNgramSequence(ngramSize, source);
        }else{
            return new TrackingNgramSequence(ngramSize, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const words = ["hello", "world", "how", "do?"];
            hi.assertEqual(hi.ngrams(2, words), [ // Bigrams
                ["hello", "world"], ["world", "how"], ["how", "do?"]
            ]);
            hi.assertEqual(hi.ngrams(3, words), [ // Trigrams
                ["hello", "world", "how"], ["world", "how", "do?"]
            ]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().ngrams(1));
            hi.assertEmpty(hi.emptySequence().ngrams(3));
            hi.assertEmpty(hi.emptySequence().ngrams(100));
        },
        "unboundedInput": hi => {
            const seq = hi.counter().ngrams(2);
            hi.assert(seq.startsWith(hi.isEqual, [[0, 1], [1, 2], [2, 3], [3, 4]]));
        },
        "singleLengthNgrams": hi => {
            hi.assertEqual(hi.ngrams(1, [1, 2, 3]), [[1], [2], [3]]);
        },
        "zeroLengthNgrams": hi => {
            const seq = hi.ngrams(0, [1, 2, 3]);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith(hi.isEqual, [[], [], []]));
        },
        "tooBigNgrams": hi => {
            hi.assertEmpty(hi.ngrams(4, [1, 2, 3]));
            hi.assertEmpty(hi.ngrams(2, hi.emptySequence()));
        },
    },
});

export default ngrams;
