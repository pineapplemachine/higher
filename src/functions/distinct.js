import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const defaultDistinctTransform = element => element;

export const DistinctSequence = Sequence.extend({
    summary: "Enumerate only those elements of an input sequence not equal to any other.",
    supportsWith: [
        "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            The sequence enumerates only those elements of an input sequence
            where the value produced by applying a transformation function to
            an element is not equal to the value produced by any previous
            element, as judged by JavaScript's #Set type.
        `),
        expects: (`
            The constructor expects a transformation function and a sequence
            as input.
        `),
        warnings: (`
            Take care when using this sequence with an unbounded input sequence.
            If at any point the input sequence enumerates an infinite series of
            elements that are not unique, then attempting to fully consume the
            output sequence will result in an infinite loop.
        `),
        developers: (`
            The sequence type uses a #Set to store elements as they are
            enumerated so that future elements may be compared against them.
            For very long sequences, this may require an unacceptably large
            amount of memory. One alternative approach for enumerating only
            those unique elements in a sequence would be to @sort the sequence
            and then use the @uniq function.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new DistinctSequence(i => i, hi.emptySequence()),
        hi => new DistinctSequence(i => i, hi.range(10)),
        hi => new DistinctSequence(i => i, hi([1, 2, 3, 4])),
        hi => new DistinctSequence(i => i, hi([1, 2, 3, 4, 1, 2, 3, 4])),
        hi => new DistinctSequence(i => i, hi.counter()),
        hi => new DistinctSequence(i => i, hi.repeat("hello")),
    ],
    constructor: function DistinctSequence(
        transform, source, history = null
    ){
        this.transform = transform;
        this.source = source;
        this.history = history || new Set();
        this.maskAbsentMethods(source);
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
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.history.add(this.transform(this.source.nextFront()));
        while(!this.source.done()){
            if(!this.history.has(this.transform(this.source.front()))) break;
            this.source.popFront();
        }
    },
    copy: function(){
        return new DistinctSequence(
            this.source.copy(), Object.assign({}, this.history)
        );
    },
    reset: function(){
        this.source.reset();
        this.history = new Set();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const distinct = wrap({
    name: "distinct",
    summary: "Enumerate only those elements of an input sequence not equal to any other.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and an optional transformation
            function as input.
        `),
        returns: (`
            The function returns a sequence which enumerates only those
            elements of the input sequence where the value produced by
            applying the transformation function to that element was not
            equivalent to the value produced by any previous element, as
            judged by JavaScript's #Set type.
            The first element of the input sequence is always included in the
            output sequence.
        `),
        warnings: (`
            Take care when using this function with an unbounded input sequence.
            If at any point the input sequence enumerates an infinite series of
            elements that are not unique, then attempting to fully consume the
            sequence outputted by this function will result in an infinite loop.
        `),
        developers: (`
            The returned sequence type uses a #Set to store elements as they are
            enumerated so that future elements may be compared against them.
            For very long sequences, this may require an unacceptably large
            amount of memory. One alternative approach for enumerating only
            those unique elements in a sequence would be to @sort the sequence
            and then use the @uniq function.
        `),
        returnType: "DistinctSequence",
        examples: [
            "basicUsage", "basicUsageTransform",
        ],
        related: [
            "uniq",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.transformation},
            sequences: 1,
        },
    },
    implementation: (transform, source) => {
        return new DistinctSequence(transform || defaultDistinctTransform, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 2, 4, 1];
            hi.assertEqual(hi.distinct(array), [1, 2, 3, 4]);
        },
        "basicUsageTransform": hi => {
            const strings = ["hello", "how", "are", "you", "?"];
            const byLength = i => i.length;
            hi.assertEqual(hi.distinct(strings, byLength), ["hello", "how", "?"]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().distinct());
        },
        "noDuplicatesInInput": hi => {
            hi.assertEqual(hi.distinct([1, 2, 3, 4]), [1, 2, 3, 4]);
        },
        "allDuplicatesInInput": hi => {
            hi.assertEqual(hi.distinct([0, 0, 0, 0, 0, 0]), [0]);
        },
        "unboundedInput": hi => {
            const seq = hi.roundRobin(hi.range(5), hi.counter());
            hi.assert(seq.distinct().startsWith([0, 1, 2, 3, 4, 5, 6, 7, 8]));
        },
    },
});

export default distinct;
