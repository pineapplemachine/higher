import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {InfiniteRepeatElementSequence} from "./repeatElement";

export const SlicingNgramSequence = Sequence.extend({
    summary: "Enumerate ngrams in a sequence.",
    supportRequired: [
        "length", "slice",
    ],
    supportsAlways: [
        "back", "index", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number indicating ngram size and one
            sequence as input. Ngram size must be a positive integer.
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
        hi => new SlicingNgramSequence(3, hi("some string")),
    ],
    constructor: function SlicingNgramSequence(
        ngramSize, source,
        lowIndex = undefined, highIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        // TODO: Better arguments validation
        if(!source.length) throw new Error("Source must have length.");
        if(!source.slice) throw new Error("Source must allow slicing.");
        if(ngramSize < 1) throw new Error("Ngram size must be at least 1.");
        this.ngramSize = ngramSize;
        this.source = source;
        this.lowIndex = lowIndex || 0;
        this.highIndex = (highIndex !== undefined ?
            highIndex : Math.max(this.lowIndex, 1 + source.length() - ngramSize)
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
    left: function(){
        return this.backIndex - this.frontIndex;
    },
    front: function(){
        return this.source.slice(
            this.frontIndex, this.frontIndex + this.ngramSize
        );
    },
    popFront: function(){
        this.frontIndex++;
    },
    back: function(){
        return this.source.slice(
            this.backIndex - 1, this.backIndex - 1 + this.ngramSize
        );
    },
    popBack: function(){
        this.backIndex--;
    },
    index: function(i){
        return this.source.slice(i, i + this.ngramSize);
    },
    slice: function(i, j){
        return new SlicingNgramSequence(
            this.ngramSize, this.source, this.lowIndex + i, this.lowIndex + j
        );
    },
    has: null,
    get: null,
    copy: function(){
        return new SlicingNgramSequence(
            this.ngramSize, this.source, this.lowIndex,
            this.highIndex, this.frontIndex, this.backIndex
        );
    },
    reset: function(){
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const TrackingNgramSequence = Sequence.extend({
    summary: "Enumerate ngrams in a sequence.",
    supportsWith: [
        "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number indicating ngram size and one
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
        // TODO: Better arguments validation
        if(ngramSize < 1) throw new Error("Ngram size must be at least 1.");
        this.ngramSize = ngramSize;
        this.source = source;
        this.currentNgram = currentNgram;
        this.maskAbsentMethods(source);
    },
    initialize: function(){
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
        if(!this.currentNgram) this.initialize();
        return this.source.done() && this.currentNgram.length < this.ngramSize;
    },
    length: function(){
        const length = 1 + this.source.length() - this.ngramSize;
        return length >= 0 ? length : 0;
    },
    left: function(){
        if(!this.currentNgram) this.initialize();
        const left = (this.currentNgram.length >= this.ngramSize) + this.source.left();
        return left >= 0 ? left : 0;
    },
    front: function(){
        if(!this.currentNgram) this.initialize();
        return new ArraySequence(this.currentNgram);
    },
    popFront: function(){
        if(!this.currentNgram) this.initialize();
        this.currentNgram = this.currentNgram.slice(1);
        if(!this.source.done()){
            this.currentNgram.push(this.source.nextFront());
        }
    },
    back: null,
    popBack: null,
    index: function(i){
        const ngram = [];
        for(let j = i; j < i + this.ngramSize; j++){
            ngram.push(this.source.index(i));
        }
        return ngram;
    },
    slice: function(i, j){
        return new NgramSequence(
            this.ngramSize, this.source.slice(i, j + this.ngramSize)
        );
    },
    has: null,
    get: null,
    copy: function(){
        const copy = new NgramSequence(this.ngramSize, this.source.copy());
        if(this.currentNgram) copy.currentNgram = this.currentNgram.slice();
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.currentNgram = undefined;
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.currentNgram = undefined;
        return this;
    },
});

export const ngrams = wrap({
    name: "ngrams",
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (ngramSize, source) => {
        if(ngramSize < 1){
            return new InfiniteRepeatElementSequence(new ArraySequence([]));
        }else if(source.length && source.slice && source.bounded()){
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
