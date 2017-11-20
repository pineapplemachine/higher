import {addConverter} from "./addConverter";
import {lightWrap} from "./lightWrap";
import {isSequence} from "./sequence";

export const sequenceConverters = [];

export const asSequence = lightWrap({
    summary: "Get a @Sequence for enumerating the elements of some input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any type.
        `),
        returns: (`
            The function returns a @Sequence object when there was any applicable
            converter, such as if the input was an array, string, object, or
            other iterable.
            If no sequence could be acquired for the input, then the function
            returns #undefined.
        `),
        developers: (`
            Note that every converter that is registered slightly increases the
            performance impact of calling the function. For low numbers of
            converters the impact is negligible, but registering a great number
            of converters may have a noticable impact.
        `),
        examples: [
            "basicUsageArray", "basicUsageString",
            "basicUsageObject", "basicUsageIterator",
        ],
        related: [
            "asImplicitSequence", "validAsSequence", "isSequence",
        ],
    },
    implementation: function asSequence(value){
        if(isSequence(value)) return value;
        for(const sequenceType of sequenceConverters){
            if(sequenceType.converter.predicate(value)){
                return new sequenceType(value);
            }
        }
        return undefined;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsageArray": hi => {
            const seq = hi.asSequence([1, 2, 3]);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 2);
            hi.assert(seq.nextFront() === 3);
            hi.assert(seq.done());
        },
        "basicUsageString": hi => {
            const seq = hi.asSequence("hi!");
            hi.assert(seq.nextFront() === "h");
            hi.assert(seq.nextFront() === "i");
            hi.assert(seq.nextFront() === "!");
            hi.assert(seq.done());
        },
        "basicUsageObject": hi => {
            const obj = {hello: "world"};
            const seq = hi.asSequence(obj);
            hi.assertEqual(seq.nextFront(), {
                key: "hello", value: "world"
            });
            hi.assert(seq.done());
        },
        "basicUsageIterable": hi => {
            const countdown = function*(n){
                while(n > 0) yield n--;
                yield 0;
            };
            const seq = hi.asSequence(countdown(3));
            hi.assert(seq.nextFront() === 3);
            hi.assert(seq.nextFront() === 2);
            hi.assert(seq.nextFront() === 1);
            hi.assert(seq.nextFront() === 0);
            hi.assert(seq.done());
        },
    },
});

export const asImplicitSequence = lightWrap({
    summary: "Get a @Sequence for enumerating the elements of an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
        related: [
            "asSequence", "validAsImplicitSequence", "isSequence",
        ],
    },
    implementation: function asImplicitSequence(value){
        if(isSequence(value)) return value;
        for(const sequenceType of sequenceConverters){
            if(sequenceType.converter.implicit && sequenceType.converter.predicate(value)){
                return new sequenceType(value);
            }
        }
        return undefined;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Arrays are considered to be implicit sequences
            const seq = hi.asImplicitSequence([0, 1, 2, 3]);
            hi.assertEqual(seq, [0, 1, 2, 3]);
            // Objects are not considered implicit sequences
            const noSeq = hi.asImplicitSequence({hello: "there"});
            hi.assertUndefined(noSeq);
        },
    },
});

// TODO: Document sequence converters somewhere
export const addSequenceConverter = lightWrap({
    summary: "Register a new sequence converter.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function addSequenceConverter(converter){
        console.log("Adding a converter.");
        addConverter(converter, sequenceConverters);
    },
});

// True when asSequence(value) could return a sequence.
export const validAsSequence = lightWrap({
    summary: "Get whether a @Sequence may be constructed to enumerate elements of an input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
    },
    implementation: function validAsSequence(value){
        if(isSequence(value)) return true;
        for(const sequenceType of sequenceConverters){
            if(sequenceType.converter.predicate(value)) return true;
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.validAsSequence([1, 2, 3]));
            hi.assert(hi.validAsSequence("some string"));
            hi.assert(hi.validAsSequence({hello: "world", im: "an object"}));
            hi.assertNot(hi.validAsSequence(undefined));
        },
    },
});

export const validAsImplicitSequence = lightWrap({
    summary: "Get whether an input is valid as a @Sequence and itself describes some sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
    },
    implementation: function validAsImplicitSequence(value){
        if(isSequence(value)) return true;
        for(const sequenceType of sequenceConverters){
            if(sequenceType.converter.predicate(value)){
                return sequenceType.converter.implicit;
            }
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.validAsImplicitSequence([1, 2, 3]));
        },
    },
});

// True when asSequence(value) would return a known-bounded sequence.
export const validAsBoundedSequence = lightWrap({
    summary: "Get whether an input is valid as a known-bounded @Sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
    },
    implementation: function validAsBoundedSequence(value){
        if(isSequence(value)) return value.bounded();
        for(const sequenceType of sequenceConverters){
            if(sequenceType.converter.predicate(value)){
                return sequenceType.converter.bounded(value);
            }
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.validAsBoundedSequence([1, 2, 3]));
        },
    },
});

// True when asSequence(value) would return a known-unbounded sequence.
export const validAsUnboundedSequence = lightWrap({
    summary: "Get whether an input is valid as a known-unbounded @Sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage", "sequenceInput",
        ],
    },
    implementation: function validAsUnboundedSequence(value){
        if(isSequence(value)) return value.unbounded();
        for(const sequenceType of sequenceConverters){
            if(sequenceType.converter.predicate(value)){
                return sequenceType.converter.unbounded(value);
            }
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertNot(hi.validAsUnboundedSequence([1, 2, 3]));
            hi.assertNot(hi.validAsUnboundedSequence("some string"));
        },
        "sequenceInput": hi => {
            hi.assert(hi.validAsUnboundedSequence(hi.recur(i => i + 1).seed(0)));
        },
    },
});

export default asSequence;
