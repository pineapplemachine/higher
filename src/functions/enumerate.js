import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const EnumerateSequence = Sequence.extend({
    summary: "Enumerate elements of an input sequence with indexes attached.",
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        // Default start index
        hi => new EnumerateSequence(hi.emptySequence()),
        hi => new EnumerateSequence(hi([1])),
        hi => new EnumerateSequence(hi([0, 1, 2, 3, 4, 5])),
        hi => new EnumerateSequence(hi(["hello", "world"])),
        hi => new EnumerateSequence(hi.range(10)),
        hi => new EnumerateSequence(hi.counter()),
        // Otherwise specified start index
        hi => new EnumerateSequence(hi.emptySequence(), 0),
        hi => new EnumerateSequence(hi.emptySequence(), 1),
        hi => new EnumerateSequence(hi.emptySequence(), 10),
        hi => new EnumerateSequence(hi([1]), 1),
        hi => new EnumerateSequence(hi([0, 1, 2, 3, 4, 5]), 15),
        hi => new EnumerateSequence(hi(["hello", "world"]), 600),
        hi => new EnumerateSequence(hi.range(10), 20),
        hi => new EnumerateSequence(hi.counter(), 10),
        // Negative and fractional start indexes
        hi => new EnumerateSequence(hi([1, 2, 3]), -10),
        hi => new EnumerateSequence(hi([1, 2, 3]), 0.5),
        hi => new EnumerateSequence(hi([1, 2, 3]), -2.5),
    ],
    constructor: function EnumerateSequence(
        source, startIndex = undefined,
        frontIndex = undefined, backIndex = undefined
    ){
        this.source = source;
        this.startIndex = startIndex || 0;
        this.frontIndex = frontIndex || this.startIndex;
        this.backIndex = backIndex;
        this.maskAbsentMethods(source);
        if(!source.length) this.back = null;
        if(this.back && backIndex === undefined){
            this.backIndex = this.startIndex + source.length() - 1;
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        return {index: this.frontIndex, value: this.source.front()};
    },
    popFront: function(){
        this.source.popFront();
        this.frontIndex++;
    },
    back: function(){
        return {index: this.backIndex, value: this.source.back()};
    },
    popBack: function(){
        this.source.popBack();
        this.backIndex--;
    },
    index: function(i){
        return {index: this.startIndex + i, value: this.source.index(i)};
    },
    slice: function(i, j){
        return new EnumerateSequence(
            this.source.slice(i, j), this.startIndex + i
        );
    },
    has: null,
    get: null,
    copy: function(){
        return new EnumerateSequence(
            this.source.copy(), this.startIndex, this.frontIndex, this.backIndex
        );
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = this.startIndex;
        if(this.back) this.backIndex = this.startIndex + this.source.length() - 1;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const enumerate = wrap({
    name: "enumerate",
    summary: "Get a sequence enumerating values of a source with indexes attached.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single input sequence and an optional initial
            index. If no initial index is provided, the index of the first
            element in the output sequence will be zero.
        `),
        returns: (`
            The function returns a sequence enumerating those elements of the
            input sequence wrapped in objects with both "index" and "value"
            attributes; the index of the element is stored in the "index"
            attribute and the corresponding element of the input sequence is
            stored in the "value" attribute.
        `),
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: "?",
            sequences: 1,
        },
    },
    implementation: (startIndex, source) =>{
        return new EnumerateSequence(source, startIndex || 0);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = (i) => (i % 2 === 0);
            const filtered = hi.filter(even, [1, 2, 3, 5, 6, 8, 19, 23, 34]);
            const seq = filtered.enumerate();
            hi.assertEqual(seq, [
                {index: 0, value: 2},
                {index: 1, value: 6},
                {index: 2, value: 8},
                {index: 3, value: 34},
            ]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().enumerate());
        },
        "nonZeroStartIndex": hi => {
            const seq = hi.enumerate(4, [0, 1, 2]);
            hi.assertEqual(seq, [
                {index: 4, value: 0},
                {index: 5, value: 1},
                {index: 6, value: 2},
            ]);
        },
    },
});

export default enumerate;
