import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./empty";
import {HeadSequence} from "./head";
import {ShuffleSequence} from "./shuffle";

// An alternative to commiting a sequence of indexes fully to memory and then
// shuffling the entirety.
// This algorithm is always less performant when shuffling an entire array,
// but is often faster than acquiring the first few elements of a longer
// shuffled sequence.
export const DistinctRandomIndexSequence = Sequence.extend({
    constructor: function DistinctRandomIndexSequence(
        random, totalValues, valueHistory = undefined
    ){
        this.random = random;
        this.totalValues = totalValues;
        this.valueHistory = valueHistory || [
            Math.floor(random() * totalValues),
        ];
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.valueHistory.length > this.totalValues;
    },
    length: function(){
        return this.totalValues;
    },
    left: function(){
        return this.totalValues - this.valueHistory.length;
    },
    front: function(){
        return this.valueHistory[this.valueHistory.length - 1];
    },
    popFront: function(){
        // Because this algorithm warrants some explanation:
        // 1. This method is called, requesting a new number.
        // 2. If enough numbers have already been generated do no more steps,
        // just push undefined to the history array. This matters because it
        // handles the case where popFront pops the last element.
        // 2. i is set to some random number in the range [0, remaining elements).
        // 3. All previously generated numbers are enumerated. While i is less
        // than or equal to any of those numbers, i is incremented and then the
        // numbers are enumerated repeatedly until i isn't incremented again.
        // This operation is the same as taking index i of the sequence of
        // numbers that haven't been chosen yet.
        // 3a. During step 3, the array containing previously generated numbers
        // is bubble sorted; the closer the array's contents are to being
        // entirely in ascending order, the fewer times step 3 will need to
        // enumerate the history array the next time this method is called.
        // In essence: Whenever a pair of elements are encountered that are
        // relatively in descending order, they are swapped to instead be
        // in ascending order.
        if(this.valueHistory.length < this.totalValues){
            let i = Math.floor(this.random() * (
                this.totalValues - this.valueHistory.length
            ));
            let j = i;
            for(const value of this.valueHistory){
                if(value <= i) i++;
            }
            while(i !== j){
                j = i;
                if(this.valueHistory[0] >= j && this.valueHistory[0] <= i) i++;
                for(let k = 1; k < this.valueHistory.length; k++){
                    const value = this.valueHistory[k];
                    // Increment i where appropriate
                    if(value >= j && value <= i) i++;
                    // Ensure that values appear in ascending order
                    if(value < this.valueHistory[k - 1]){
                        this.valueHistory[k] = this.valueHistory[k - 1];
                        this.valueHistory[k - 1] = value;
                    }
                }
            }
            this.valueHistory.push(j);
        }else if(this.valueHistory.length === this.totalValues){
            this.valueHistory.push(undefined);
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    // Can't copy or reset since result is nondeterministic.
    // TODO: Use resettable RNG objects instead of e.g. Math.random?
    copy: null,
    reset: null,
    rebase: null,
});

// Input sequence must have length and indexing.
// TODO: This sequence probably needs a collapseBreak method.
const SampleSequence = Sequence.extend({
    constructor: function(samples, random, source, indexes = undefined){
        this.samples = samples;
        this.random = random;
        this.source = source;
        this.indexes = indexes || new DistinctRandomIndexSequence(
            this.random, this.source.length()
        );
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.indexes.valueHistory.length > this.samples;
    },
    length: function(){
        return this.samples;
    },
    left: function(){
        return this.samples - this.indexes.valueHistory.length;
    },
    front: function(){
        return this.source.index(this.indexes.front());
    },
    popFront: function(){
        return this.indexes.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    // Can't copy or reset since result is nondeterministic.
    // TODO: Use resettable RNG objects instead of e.g. Math.random?
    copy: null,
    reset: null,
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const sample = wrap({
    name: "sample",
    attachSequence: true,
    async: false,
    sequences: [
        SampleSequence,
        DistinctRandomIndexSequence
    ],
    arguments: {
        unordered: {
            numbers: "?",
            functions: "?",
            sequences: 1
        }
    },
    implementation: (samples, random, source) => {
        if(samples <= 0){
            return new EmptySequence();
        }
        if(!source.index || !source.length){
            source.forceEager();
        }
        const randomFunc = random || Math.random;
        if(!samples){
            return source.index(Math.floor(randomFunc() * source.length()));
        }else if(samples <= source.length() / 5){
            // Lazy implementation is usually more performant when the sample
            // count is no more than 20% of the number of elements.
            return new SampleSequence(samples, randomFunc, source);
        }else{
            return new HeadSequence(samples,
                new ShuffleSequence(randomFunc, source)
            );
        }
    },
});

export default sample;
