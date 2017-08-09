import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const UntilSequence = defineSequence({
    summary: "Enumerate elements in the input sequence until one satisfying a predicate is found.",
    supportsWith: [
        "index", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as its arguments a predicate function and
            an input sequence.
        `),
        methods: {
            "inclusive": {
                introduced: "higher@1.0.0",
                summary: "Modify the sequence to include the first element satisfying the predicate.",
                returns: "The function returns the sequence itself.",
                returnType: "UntilSequence",
                examples: [
                    "inclusiveBasicUsage",
                ],
            },
            "exclusive": {
                introduced: "higher@1.0.0",
                summary: "Modify the sequence to exclude the first element satisfying the predicate.",
                returns: "The function returns the sequence itself.",
                returnType: "UntilSequence",
                examples: [
                    "exclusiveBasicUsage",
                ],
            },
        },
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "inclusiveBasicUsage": hi => {
            const beeping = () => hi("beeping");
            hi.assertEqual(beeping().until(i => i === "p"), "bee");
            hi.assertEqual(beeping().until(i => i === "p").exclusive(), "bee");
            hi.assertEqual(beeping().until(i => i === "p").inclusive(), "beep");
        },
        "exclusiveBasicUsage": hi => {
            const beeping = () => hi("beeping");
            hi.assertEqual(beeping().until(i => i === "p").exclusive(), "bee");
            hi.assertEqual(beeping().until(i => i === "p").inclusive(), "beep");
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new UntilSequence(i => true, [1, 2, 3]),
        hi => new UntilSequence(i => true, [1, 2, 3]).inclusive(),
        hi => new UntilSequence(i => false, [1, 2, 3]),
        hi => new UntilSequence(i => false, [1, 2, 3]).inclusive(),
        hi => new UntilSequence(i => i >= 4, [1, 2, 3, 4, 5, 6]),
        hi => new UntilSequence(i => i >= 4, [1, 2, 3, 4, 5, 6]).inclusive(),
        hi => new UntilSequence(i => i >= 6, hi.counter()),
        hi => new UntilSequence(i => i >= 6, hi.counter()).inclusive(),
    ],
    constructor: function UntilSequence(
        predicate, source, isInclusive = undefined, included = undefined
    ){
        this.predicate = predicate;
        this.source = source;
        this.isInclusive = isInclusive || false;
        this.included = included || false;
        this.maskAbsentMethods(source);
    },
    inclusive: function(){
        this.isInclusive = true;
        this.included = false;
        return this;
    },
    exclusive: function(){
        this.isInclusive = false;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: () => false,
    done: function(){
        return this.source.done() || (
            this.predicate(this.source.front()) && (this.included || !this.isInclusive)
        );
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        if(this.predicate(this.source.front())){
            this.included = true;
        }else{
            this.source.popFront();
        }
    },
    index: function(i){
        return this.source.index(i);
    },
    copy: function(){
        return new UntilSequence(
            this.predicate, this.source.copy(),
            this.isInclusive, this.included
        );
    },
    reset: function(){
        this.source.reset();
        this.included = false;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const until = wrap({
    name: "until",
    summary: "Enumerate elements in a sequence until one satisfying a predicate is found.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a predicate function and a sequence as input.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements of
            the input sequence up to the first element satisfying the predicate.
            When no elements in the input sequence satisfied the predicate, the
            output sequence enumerates the entirety of the input sequence.
        `),
        developers: (`
            The default behavior of the outputted sequence is to enumerate
            elements up to and not including the first element to satisfy the
            predicate.
            The outputted sequence may be made to include the terminating
            element using its @UntilSequence.inclusive method.
        `),
        examples: [
            "basicUsageExclusive", "basicUsageInclusive",
        ],
        related: [
            "from",
        ],
    },
    attachSequence: true,
    async: false,
    sequences: [
        UntilSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        return new UntilSequence(predicate, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageExclusive": hi => {
            const seq = hi([1, 2, 3, 4, 5, 6]).until(i => i === 4);
            hi.assertEqual(seq, [1, 2, 3]);
        },
        "basicUsageInclusive": hi => {
            const seq = hi([1, 2, 3, 4, 5, 6]).until(i => i === 4).inclusive();
            hi.assertEqual(seq, [1, 2, 3, 4]);
        },
        "firstElementMatched": hi => {
            hi.assertEmpty(hi("hello").until(() => true));
            hi.assertEmpty(hi("hello").until(() => true).exclusive());
            hi.assertEqual(hi("hello").until(() => true).inclusive(), "h");
        },
        "noElementsMatched": hi => {
            hi.assertEqual(hi("hello").until(() => false), "hello");
            hi.assertEqual(hi("hello").until(() => false).exclusive(), "hello");
            hi.assertEqual(hi("hello").until(() => false).inclusive(), "hello");
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().until(i => i));
        },
        "notKnownBoundedInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(3).until(i => i >= 6);
            hi.assertEqual(seq(), [3, 4, 5]);
            hi.assertEqual(seq().inclusive(), [3, 4, 5, 6]);
        },
        "unboundedInput": hi => {
            const seq = hi.recur(i => 2 * -i).seed(1).until(i => i >= 16);
            hi.assert(!seq.bounded());
            hi.assert(!seq.unbounded());
            hi.assertEqual(seq, [+1, -2, +4, -8]);
        },
    },
});

export default until;
