import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {ArgumentsError} from "../errors/ArgumentsError";

import {EmptySequence} from "./emptySequence";
import {HeadSequence} from "./head";
import {ShuffleSequence} from "./shuffle";

// An alternative to commiting a sequence of indexes fully to memory and then
// shuffling the entirety.
// This algorithm is always less performant when shuffling an entire array,
// but is often faster than acquiring the first few elements of a longer
// shuffled sequence.
export const DistinctRandomIndexSequence = defineSequence({
    summary: "Enumerate unique indexes in random order.",
    supportsAlways: [
        "length", "left",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a random number generation function and
            a total number of indexes to generate as input.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new DistinctRandomIndexSequence(Math.random, 0),
        hi => new DistinctRandomIndexSequence(Math.random, 1),
        hi => new DistinctRandomIndexSequence(Math.random, 2),
        hi => new DistinctRandomIndexSequence(Math.random, 3),
        hi => new DistinctRandomIndexSequence(Math.random, 10),
        hi => new DistinctRandomIndexSequence(Math.random, 20),
    ],
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
        // 3. All previously generated numbers are enumerated. While i is greater
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
const SampleSequence = defineSequence({
    summary: "Enumerate a random subset of the elements in a sequence.",
    supportRequired: [
        "index", "length",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of random samples, a random
            number generation function, and an input sequence with known
            length and support for indexing.
            The number of samples must be less than or equal to the length
            of the input sequence.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new SampleSequence(0, Math.random, hi.emptySequence()),
        hi => new SampleSequence(0, Math.random, hi.range(10)),
        hi => new SampleSequence(2, Math.random, hi.range(10)),
        hi => new SampleSequence(5, Math.random, hi.range(10)),
        hi => new SampleSequence(8, Math.random, hi.range(10)),
        hi => new SampleSequence(10, Math.random, hi.range(10)),
    ],
    constructor: function SampleSequence(samples, random, source, indexes = undefined){
        const sourceLength = source.length();
        ArgumentsError.assert(samples <= sourceLength, {
            isConstructor: true,
            message: "Failed to create sequence",
        });
        this.samples = samples;
        this.random = random;
        this.source = source;
        this.indexes = indexes || new DistinctRandomIndexSequence(
            this.random, sourceLength
        );
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.indexes.valueHistory.length > this.samples;
    },
    length: function(){
        const sourceLength = this.source.length();
        return this.samples <= sourceLength ? this.samples : sourceLength;
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
    summary: "Get a random sample of elements from a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        expects: (`
            The function expects one known-bounded input sequence, a
            number of samples, and an optional random number generation function.
        `),
        returns: (`
            The function returns a sequence enumerating the given number of
            randomly-chosen elements of the input sequence, without ever
            selecting an element at the same index more than once.
            If the given number of samples was zero, then the function returns
            an empty sequence.
            If the given number of samples was greater than the length of the
            input sequence, then the function returns a sequence enumerating
            all the elements of the input sequence in a randomly-shuffled order.
        `),
        developers: (`
            When the number of samples is small in relation to the length of
            the input sequence, random indexes are chosen as they are requested.
            When the number of samples is at least a significant fraction of
            the length of the input sequence, a new, fully-in-memory and fully-
            shuffled sequence is produced from the input, and the output
            sequence enumerates that shuffled sequence's first so many elements.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "sampleElement", "shuffle",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            functions: "?",
            sequences: {one: wrap.expecting.boundedSequence},
        },
    },
    implementation: (samples, random, source) => {
        if(samples <= 0) return new EmptySequence();
        // TODO: Don't default to Math.random
        const randomFunc = random || Math.random;
        const sourceLength = source.length();
        if(source.index && samples <= sourceLength / 5){
            // Lazy implementation is usually more performant when the sample
            // count is no more than 20% of the total number of elements.
            return new SampleSequence(samples, randomFunc, source);
        }else if(samples < sourceLength){
            return new HeadSequence(
                samples, new ShuffleSequence(randomFunc, source)
            );
        }else{
            return new ShuffleSequence(randomFunc, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const numbers = [50, 10, 200, 30];
            // Get any two numbers from the array
            const samples = hi.sample(numbers, 2).array();
            hi.assert(hi(numbers).containsElement(samples[0]));
            hi.assert(hi(numbers).containsElement(samples[1]));
            // But never the same number repeatedly
            hi.assert(samples[0] !== samples[1]);
        },
        "smallSampleSize": hi => {
            const samples = hi.range(1000).sample(3).array();
            for(let i = 0; i < samples.length; i++){
                hi.assert(samples[i] >= 0 && samples[i] < 1000);
            }
            hi.assert(samples.length === 3);
            hi.assert(samples[0] !== samples[1]);
            hi.assert(samples[0] !== samples[2]);
            hi.assert(samples[1] !== samples[2]);
        },
        "tooLargeSampleSize": hi => {
            const samples = hi.range(3).sample(10).array();
            hi.assert(samples.length === 3);
            for(let i = 0; i < samples.length; i++){
                hi.assert(samples[i] >= 0 && samples[i] < 3);
            }
            hi.assert(
                (samples[0] === 0 && samples[1] === 1 && samples[2] === 2) ||
                (samples[0] === 2 && samples[1] === 0 && samples[2] === 1) ||
                (samples[0] === 1 && samples[1] === 2 && samples[2] === 0) ||
                (samples[0] === 2 && samples[1] === 1 && samples[2] === 0) ||
                (samples[0] === 0 && samples[1] === 2 && samples[2] === 1) ||
                (samples[0] === 1 && samples[1] === 0 && samples[2] === 2)
            );
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().sample(10));
        },
    },
});

export default sample;
