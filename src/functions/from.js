import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

// Enumerate those elements of an input sequence starting from the first
// element matching a predicate.
export const FromSequence = defineSequence({
    overrides: {
        exclusive: {none: true},
        inclusive: {none: true},
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a predicate function and a sequence as input.
        `),
        methods: {
            "exclusive": {
                introduced: "higher@1.0.0",
                summary: (`
                    Modify the sequence to exclude the first element satisfying
                    the predicate from its output.
                `),
                expects: (`
                    The function accepts no arguments.
                `),
                returns: (`
                    The function returns the sequence itself.
                `),
                returnType: "sequence",
                examples: ["exclusiveBasicUsage"],
            },
            "inclusive": {
                introduced: "higher@1.0.0",
                summary: (`
                    Modify the sequence to include the first element satisfying
                    the predicate from its output.
                `),
                expects: (`
                    The function accepts no arguments.
                `),
                returns: (`
                    The function returns the sequence itself.
                `),
                returnType: "sequence",
                examples: ["inclusiveBasicUsage"],
            },
        },
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "exclusiveBasicUsage": hi => {
            const seq = new hi.sequence.FromSequence(i => i == 2, hi.range(6))
            hi.assertEqual(seq.exlusive(), [3, 4, 5]);
        },
        "inclusiveBasicUsage": hi => {
            const seq = new hi.sequence.FromSequence(i => i == 2, hi.range(6))
            hi.assertEqual(seq.inclusive(), [2, 3, 4, 5]);
        },
    },
    constructor: function FromSequence(
        predicate, source, isInclusive = true,
        initializedFront = undefined, poppedElements = undefined
    ){
        this.predicate = predicate;
        this.source = source;
        this.isInclusive = isInclusive;
        this.initializedFront = initializedFront;
        this.poppedElements = poppedElements || 0;
        this.maskAbsentMethods(source);
    },
    initializeFront: function(){
        this.initializedFront = true;
        while(!this.source.done()){
            if(this.predicate(this.source.front())){
                if(!this.isInclusive){
                    this.source.popFront();
                    this.poppedElements++;
                }
                break;
            }else{
                this.source.popFront();
                this.poppedElements++;
            }
        }
    },
    inclusive: function(){
        this.isInclusive = true;
        return this;
    },
    exclusive: function(){
        this.isInclusive = false;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.source.done();
    },
    front: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.source.front();
    },
    popFront: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.source.popFront();
    },
    back: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.source.back();
    },
    popBack: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.source.popBack();
    },
    index: function(i){
        if(!this.initializedFront) this.initializeFront();
        return this.source.nativeIndex(i + this.poppedElements);
    },
    slice: function(i, j){
        if(!this.initializedFront) this.initializeFront();
        return this.source.nativeSlice(
            i + this.poppedElements, j + this.poppedElements
        );
    },
    copy: function(){
        return new FromSequence(
            this.predicate, this.source.copy(), this.isInclusive,
            this.initializedFront, this.poppedElements
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const from = wrap({
    name: "from",
    summary: "Get the elements in a sequence after the first one satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and a predicate function as input.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements of
            the input sequence after and including the first element satisfying
            the predicate.
            (The inclusivity of the first element can be toggled using the
            [inclusive](FromSequence.inclusive) and [exclusive](FromSequence.exclusive)
            methods of the output sequence.
        `),
        warnings: (`
            Attempting to enumerate elements in an unbounded input sequence from
            a predicate not satisfied by any element in that sequence will
            produce an infinite loop.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage", "basicUsageExclusive"
        ],
        related: [
            "until",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: {one: wrap.expecting.predicate},
            sequences: 1,
        },
    },
    implementation: (predicate, source) => {
        return new FromSequence(predicate, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const isVowel = i => hi("aeiouy").containsElement(i);
            hi.assertEqual(hi.from(isVowel, "hello"), "ello");
            hi.assertEqual(hi.from(isVowel, "Great"), "eat");
        },
        "basicUsageExclusive": hi => {
            const isVowel = i => hi("aeiouy").containsElement(i);
            hi.assertEqual(hi.from(isVowel, "hello").exclusive(), "llo");
            hi.assertEqual(hi.from(isVowel, "Great").exclusive(), "at");
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().from(i => true));
            hi.assertEmpty(hi.emptySequence().from(i => false));
            hi.assertEmpty(hi.emptySequence().from(i => true).inclusive());
            hi.assertEmpty(hi.emptySequence().from(i => false).inclusive());
            hi.assertEmpty(hi.emptySequence().from(i => true).exclusive());
            hi.assertEmpty(hi.emptySequence().from(i => false).exclusive());
        },
        "noElementsSatisfy": hi => {
            hi.assertEmpty(hi.range(8).from(i => false));
            hi.assertEmpty(hi.range(8).from(i => false).inclusive());
            hi.assertEmpty(hi.range(8).from(i => false).exclusive());
        },
        "firstElementSatisfies": hi => {
            hi.assertEqual(hi.range(6).from(i => true), [0, 1, 2, 3, 4, 5]);
            hi.assertEqual(hi.range(6).from(i => true).inclusive(), [0, 1, 2, 3, 4, 5]);
            hi.assertEqual(hi.range(6).from(i => true).exclusive(), [1, 2, 3, 4, 5]);
        },
    },
});

const fromFn = from; // Workaround for syntax error
export default fromFn;
