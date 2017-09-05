import {isEqual} from "../core/isEqual";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const defaultUniqComparison = isEqual;

export const UniqSequence = defineSequence({
    summary: "Enumerate only those elements of an input sequence not equivalent to their predecessor.",
    supportsWith: [
        "copy", "reset",
    ], 
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a comparison function and a sequence as
            input.
        `),
        warnings: (`
            Take care when using this sequence with an unbounded input.
            If at any point the sequence comes to enumerate an infinite series of
            equivalent elements, then attempting to consume output sequence
            will produce an infinite loop.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new UniqSequence(isEqual, hi.emptySequence()),
        hi => new UniqSequence(isEqual, hi([0])),
        hi => new UniqSequence(isEqual, hi([0, 1, 2, 3, 4])),
        hi => new UniqSequence(isEqual, hi([0, 0, 0, 0, 0])),
        hi => new UniqSequence(isEqual, hi("!")),
        hi => new UniqSequence(isEqual, hi("abcdefg")),
        hi => new UniqSequence(isEqual, hi("aaaabcddefffg")),
        hi => new UniqSequence(isEqual, hi.counter()),
        hi => new UniqSequence(isEqual, hi.repeat([1, 2, 3, 3, 4, 5])),
    ],
    constructor: function UniqSequence(
        compare, source, lastElement = undefined
    ){
        this.compare = compare;
        this.source = source;
        this.lastElement = lastElement;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    // This method assumes that the input was not an unbounded sequence
    // containing one element infinitely repeated.
    // Since such an input would produce an infinite loop and should really
    // be avoided, this seems like a safe assumption to make.
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
        this.lastElement = this.source.nextFront();
        while(!this.source.done()){
            const front = this.source.front();
            const last = this.lastElement;
            this.lastElement = front;
            if(!this.compare(last, front)) break;
            this.source.popFront();
        }
    },
    copy: function(){
        return new UniqSequence(
            this.compare, this.source.copy(), this.lastElement
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Enumerate only the elements that are not equivalent to their predecessor
// as determined by a comparison function.
// Like https://en.wikipedia.org/wiki/Uniq
export const uniq = wrap({
    name: "uniq",
    summary: "Get a sequence enumerating only the elements of an input not equivalent to their predecessor.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and an optional comparison
            function as input.
        `),
        returns: (`
            The function returns a sequence which enumerates only those elements
            of the input sequence that were not equivalent to their predecessors,
            as judged by a comparison function.
            The first element of the input sequence is always included in the
            output sequence.
            /When no comparison function is given, @isEqual is used as a default.
        `),
        warnings: (`
            Take care when using this function with an unbounded sequence.
            If at any point the sequence comes to enumerate an infinite series of
            equivalent elements, then attempting to consume output sequence
            will produce an infinite loop.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage", "comparisonFunctionInput",
        ],
        related: [
            "distinct",
        ],
        links: [
            {
                description: "Description of the uniq Unix utility.",
                url: "https://en.wikipedia.org/wiki/Uniq",
            },
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.comparison},
            sequences: 1
        }
    },
    implementation: (compare, source) => {
        return new UniqSequence(compare || defaultUniqComparison, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 1, 2, 3, 3, 3, 4, 3, 2, 2, 1];
            hi.assertEqual(hi.uniq(array), [1, 2, 3, 4, 3, 2, 1]);
        },
        "comparisonFunctionInput": hi => {
            const absEqual = (a, b) => (a === b || a === -b);
            const seq = hi.uniq(absEqual, [1, 1, -1, 2, 3, -4, 4, 5, -6, -6]);
            hi.assertEqual(seq, [1, 2, 3, -4, 5, -6]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().uniq());
        },
        "singleLengthInput": hi => {
            hi.assertEqual(hi.uniq([1]), [1]);
            hi.assertEqual(hi.uniq(["abc"]), ["abc"]);
        },
        "noDuplicatesInInput": hi => {
            hi.assertEqual(hi.uniq([1, 2, 3, 4]), [1, 2, 3, 4]);
        },
        "allDuplicatesInInput": hi => {
            hi.assertEqual(hi.uniq([0, 0, 0, 0, 0, 0]), [0]);
        },
        "unboundedInput": hi => {
            const seq = hi.roundRobin(hi.range(5), hi.counter());
            hi.assert(seq.uniq().startsWith([0, 1, 2, 3, 4, 5, 6, 7, 8]));
        },
    },
});

export default uniq;
