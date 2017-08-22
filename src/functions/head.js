import {wrap} from "../core/wrap";
import {defineSequence} from "../core/defineSequence";

import {EmptySequence} from "./emptySequence";

// Fallback implementation of head function for when slicing is unavailable.
export const HeadSequence = defineSequence({
    summary: "Enumerate only the first so many elements of a sequence.",
    supportsWith: [
        "length", "get", "copy",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to take from the
            beginning of the input, and an input sequence.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new HeadSequence(0, hi.emptySequence()),
        hi => new HeadSequence(3, hi.emptySequence()),
        hi => new HeadSequence(0, hi([0, 1, 2, 3, 4])),
        hi => new HeadSequence(3, hi([0, 1, 2, 3, 4])),
        hi => new HeadSequence(5, hi([0, 1, 2, 3, 4])),
        hi => new HeadSequence(10, hi([0, 1, 2, 3, 4])),
        hi => new HeadSequence(0, hi.counter()),
        hi => new HeadSequence(3, hi.counter()),
        hi => new HeadSequence(0, hi.counter().until(i => i >= 8)),
        hi => new HeadSequence(3, hi.counter().until(i => i >= 8)),
        hi => new HeadSequence(8, hi.counter().until(i => i >= 8)),
        hi => new HeadSequence(10, hi.counter().until(i => i >= 8)),
    ],
    constructor: function HeadSequence(
        headLength, source, frontIndex = undefined
    ){
        this.headLength = headLength;
        this.source = source;
        this.frontIndex = frontIndex || 0;
        this.maskAbsentMethods(source);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.frontIndex >= this.headLength || this.source.done();
    },
    length: function(){
        const sourceLength = this.source.length();
        return sourceLength < this.headLength ? sourceLength : this.headLength;
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
        this.frontIndex++;
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return this.source.slice(i, j);
    },
    copy: function(){
        return new HeadSequence(
            this.headLength, this.source.copy(), this.frontIndex
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const head = wrap({
    names: ["head", "take"],
    summary: "Get a sequence enumerating the first so many elements of an input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as arguments one input sequence and a number
            indicating the number of elements to take from its beginning.
        `),
        returns: (`
            The function returns a sequence enumerating only up to the first
            so many elements of the input. If there were fewer elements in the
            input than the specified number, then the resulting sequence will
            be only as long as the input.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "first", "dropFirst", "tail",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1,
        },
    },
    implementation: (count, source) => {
        if(count <= 0){
            return new EmptySequence();
        }else if(!isFinite(count)){
            return source;
        }else if(source.nativeLength && source.nativeSlice){
            const sourceLength = source.length();
            return sourceLength <= count ? source : source.nativeSlice(0, count);
        }else{
            return new HeadSequence(count, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5, 6];
            hi.assertEqual(hi.head(array, 4), [1, 2, 3, 4]);
        },
        "zeroLength": hi => {
            hi.assertEmpty(hi.head(0, hi.emptySequence()));
            hi.assertEmpty(hi.head(0, [0, 1, 2, 3]));
            hi.assertEmpty(hi.head(0, hi.counter()));
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.head(1, hi.emptySequence()));
            hi.assertEmpty(hi.head(10, hi.emptySequence()));
        },
        "infiniteInput": hi => {
            const seq = hi.range(100);
            hi.assert(seq.head(Infinity) === seq);
        },
        "boundedInputs": hi => {
            hi.assertEqual(hi.head(1, [0, 1, 2, 3, 4]), [0]);
            hi.assertEqual(hi.head(3, [0, 1, 2, 3, 4]), [0, 1, 2]);
            hi.assertEqual(hi.head(2, "hello"), "he");
            hi.assertEqual(hi.head(4, "red"), "red");
            hi.assertEqual(hi.head(100, "red"), "red");
        },
        "notKnownBoundedInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(3).until(i => i >= 6);
            hi.assertEmpty(seq().head(0));
            hi.assertEqual(seq().head(1), [3]);
            hi.assertEqual(seq().head(2), [3, 4]);
            hi.assertEqual(seq().head(3), [3, 4, 5]);
            hi.assertEqual(seq().head(4), [3, 4, 5]);
            hi.assertEqual(seq().head(100), [3, 4, 5]);
        },
        "unboundedInput": hi => {
            hi.assertEqual(hi.counter().head(1), [0]);
            hi.assertEqual(hi.counter().head(4), [0, 1, 2, 3]);
        },
    },
});

export const take = head;

export default head;
