import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {BoundsUnknownError} from "../errors/BoundsUnknownError";

import {ArraySequence} from "./arrayAsSequence";
import {EmptySequence} from "./emptySequence";
import {FilterSequence} from "./filter";
import {HeadSequence} from "./head";
import {OnDemandSequence} from "./onDemandSequence";
import {ReverseSequence} from "./reverse";

export const UnboundedDropLastSequence = Sequence.extend({
    summary: "Enumerate the contents of an unbounded sequence, omitting the last so many elements.",
    supportRequired: [
        "back",
    ],
    supportsWith: [
        "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to drop and an input
            sequence. The sequence must be unbounded and bidirectional and the
            number of elements to drop must be a non-negative integer.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new UnboundedDropLastSequence(0, hi.counter()),
        hi => new UnboundedDropLastSequence(10, hi.counter()),
        hi => new UnboundedDropLastSequence(0, hi.repeat("hello")),
        hi => new UnboundedDropLastSequence(10, hi.repeat("hello")),
    ],
    constructor: function UnboundedDropLastSequence(dropTarget, source){
        this.dropTarget = dropTarget;
        this.source = source;
        this.maskAbsentMethods(source);
    },
    initializeBack: function(){
        for(let i = 0; i < this.dropTarget; i++) this.source.popBack();
        this.back = function(){
            return this.source.back();
        };
        this.popBack = function(){
            return this.source.popBack();
        };
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        this.initializeBack();
        return this.source.popBack();
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return this.source.slice(i, j);
    },
    copy: function(){
        const copy = new UnboundedDropLastSequence(
            this.dropTarget, this.source.copy()
        );
        copy.back = this.back;
        copy.popBack = this.popBack;
        return copy;
    },
    reset: function(){
        this.source.reset();
        delete this.back;
        delete this.popBack;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const UnboundedDropLastPredicateSequence = Sequence.extend({
    summary: "Enumerate the contents of an unbounded sequence, omitting the last so many elements satisfying a predicate.",
    supportRequired: [
        "back",
    ],
    supportsWith: [
        "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to drop, a predicate,
            and an input sequence. The sequence must be unbounded and
            bidirectional and the number of elements to drop must be a
            non-negative integer.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new UnboundedDropLastPredicateSequence(0, i => true, hi.counter()),
        hi => new UnboundedDropLastPredicateSequence(10, i => true, hi.counter()),
        hi => new UnboundedDropLastPredicateSequence(10, i => i % 2 === 0, hi.counter()),
        hi => new UnboundedDropLastPredicateSequence(0, i => true, hi.repeat("hello")),
        hi => new UnboundedDropLastPredicateSequence(9, i => true, hi.repeat("hello")),
        hi => new UnboundedDropLastPredicateSequence(9, i => i === "l", hi.repeat("hello")),
    ],
    constructor: function UnboundedDropLastPredicateSequence(
        dropTarget, predicate, source, droppedElements = undefined
    ){
        this.dropTarget = dropTarget;
        this.predicate = predicate;
        this.source = source;
        this.droppedElements = droppedElements || 0;
        this.maskAbsentMethods(source);
    },
    initializeBack: function(){
        while(
            this.droppedElements < this.dropTarget &&
            this.predicate(this.source.back())
        ){
            this.source.popBack();
            this.droppedElements++;
        }
        this.back = function(){
            return this.source.back();
        };
        this.popBack = function(){
            this.source.popBack();
            while(
                this.droppedElements < this.dropTarget &&
                this.predicate(this.source.back())
            ){
                this.source.popBack();
                this.droppedElements++;
            }
        };
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        this.initializeBack();
        return this.source.popBack();
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return this.source.slice(i, j);
    },
    copy: function(){
        const copy = new UnboundedDropLastPredicateSequence(
            this.dropTarget, this.predicate, this.source.copy(), this.droppedElements
        );
        copy.back = this.back;
        copy.popBack = this.popBack;
        return copy;
    },
    reset: function(){
        this.source.reset();
        delete this.back;
        delete this.popBack;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Implement dropLast with a predicate for known-bounded sequence inputs
const DropLastOnDemandSequence = (dropTarget, predicate, source) => {
    return new OnDemandSequence({
        dump: () => {
            const array = [];
            let dropped = 0;
            if(source.back){
                while(!source.done()){
                    const element = source.nextBack();
                    if(predicate(element)){
                        dropped++;
                        if(dropped >= dropTarget) break;
                    }else{
                        array.push(element);
                    }
                }
                while(!source.done()){
                    array.push(source.nextBack());
                }
                return new ReverseSequence(new ArraySequence(array));
            }else{
                for(const element of source){
                    array.push(element);
                }
                for(let i = array.length - 1; i >= 0 && dropped < dropTarget; i--){
                    if(predicate(array[i])){
                        array.splice(i, 1);
                        dropped++;
                    }
                }
                return new ArraySequence(array);
            }
        },
    });
};

export const dropLast = wrap({
    name: "dropLast",
    summary: "Get a sequence enumerating the contents of an input sequence, minus the last so many elements.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input a sequence, an optional number of
            elements to drop from its back, and an optional predicate function.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements in
            the input sequence, except for the last so many elements satisfying
            the predicate.
            /When no number of elements was specified, #1 is used as a default.
            When no predicate was specified, the output behaves as though a
            predicate satisfied by every input was given.
        `),
        throws: (`
            The function throws a @NotKnownBounded error when the number of
            elements to drop was a finite positive number and the input sequence
            was not either known-bounded or known-unbounded.
        `),
        returnType: {
            "typeof inputSequence": (`
                When the number of elements to drop was less than or equal to zero.
            `),
            "typeof inputSequence.slice()": (`
                When no predicate function was specified, the number of elements
                to drop was a positive finite number less than the length of
                the input sequence, and the sequence had both known length and
                support for slicing.
            `),
            "FilterSequence": (`
                When a predicate function was specified and the number of
                elements to drop was positive infinity or, if the input sequence
                had known length, was greater than or equal to the length of the
                sequence.
            `),
            "EmptySequence": (`
                When no predicate function was specified and the the number of
                elements to drop was positive infinity or, if the input sequence
                had known length, was greater than or equal to the length of the
                sequence.
            `),
            "HeadSequence": (`
                When no predicate function was specified, the number of elements
                to drop was a finite positive number, and the input sequence had
                known length but did not support slicing.
            `),
            "OnDemandSequence": (`
                When the number of elements to drop was a finite positive number,
                the input sequence was known-bounded, and either the sequence
                did not have known length and support slicing, or a predicate
                function was given as input.
            `),
            "UnboundedDropLastSequence": (`
                When no predicate function was specified, the number of elements
                to drop was a finite positive number, and the input sequence was
                known to be unbounded.
            `),
            "UnboundedDropLastPredicateSequence": (`
                When a predicate function was specified, the number of elements
                to drop was a finite positive number, and the input sequence was
                known to be unbounded.
            `),
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "last", "dropFirst",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: "?",
            functions: {optional: wrap.expecting.predicate},
            sequences: 1,
        }
    },
    implementation: (dropTarget, predicate, source) => {
        const drop = dropTarget || 1;
        if(dropTarget <= 0){
            return source;
        }else if(!isFinite(drop)){
            return (predicate ?
                new FilterSequence(element => !predicate(element), source) :
                new EmptySequence()
            );
        }else if(predicate){
            if(source.length && source.length() <= dropTarget){
                return new FilterSequence(element => !predicate(element), source);
            }else if(source.bounded()){
                return DropLastOnDemandSequence(drop, predicate, source);
            }else if(source.unbounded()){
                return new UnboundedDropLastPredicateSequence(drop, predicate, source);
            }else{
                throw BoundsUnknownError(source, {
                    message: "Failed to drop last elements",
                });
            }
        }else if(source.length){
            const sourceLength = source.length();
            return (sourceLength <= drop ?
                new EmptySequence() :
                (source.slice ?
                    source.slice(0, sourceLength - drop) :
                    new HeadSequence(sourceLength - drop, source)
                )
            );
        }else if(source.bounded()){
            return new OnDemandSequence({
                dump: () => {
                    const array = [];
                    for(const element of source) array.push(element);
                    return (array.length <= dropTarget ?
                        new EmptySequence() :
                        new ArraySequence(array).slice(0, array.length - dropTarget)
                    );
                },
            });
        }else if(source.unbounded()){
            return new UnboundedDropLastSequence(drop, source);
        }else{
            throw BoundsUnknownError(source, {
                message: "Failed to drop last elements",
            });
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const string = "hello world!";
            hi.assertEqual(hi.dropLast(1, string), "hello world");
            hi.assertEqual(hi.dropLast(7, string), "hello");
        },
        "basicUsagePredicate": hi => {
            const array = [1, 2, 3, 4, 5, 6, 7];
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.dropLast(2, even, array), [1, 2, 3, 5, 7]);
        },
        "dropZero": hi => {
            const seq = hi.range(10);
            hi.assertEqual(seq.dropLast(0) === seq);
            hi.assertEqual(seq.dropLast(0, i => true) === seq);
        },
        "dropSeveral": hi => {
            const string = "hello world";
            hi.assertEqual(hi(string).dropLast(2), "hello wor");
            hi.assertEqual(hi(string).dropLast(8), "hel");
            hi.assertEqual(hi(string).dropLast(10), "h");
            hi.assertEmpty(hi(string).dropLast(11));
            hi.assertEmpty(hi(string).dropLast(20));
        },
        "dropSeveralPredicate": hi => {
            const string = "apple pear plum";
            const isP = i => i === "p";
            hi.assertEqual(hi(string).dropLast(2, isP), "apple ear lum");
            hi.assertEqual(hi(string).dropLast(3, isP), "aple ear lum");
            hi.assertEqual(hi(string).dropLast(4, isP), "ale ear lum");
            hi.assertEqual(hi(string).dropLast(10, isP), "ale ear lum");
            hi.assertEqual(hi(string).dropLast(20, isP), "ale ear lum");
        },
        "dropInfinity": hi => {
            hi.assertEmpty(hi.range(10).dropLast(Infinity));
            hi.assertEmpty(hi.counter().dropLast(Infinity));
            hi.assertEmpty(hi.emptySequence().dropLast(Infinity));
        },
        "dropInfinityPredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.range(10).dropLast(Infinity, even), [1, 3, 5, 7, 9]);
            hi.assertEmpty(hi.range(10).dropLast(Infinity, i => true));
        },
        "unboundedInputDropFinite": hi => {
            const seq = hi.repeat("hello").dropLast(3);
            hi.assert(seq.unbounded());
            hi.assert(seq.endsWith("hellohellohe"));
        },
        "unboundedInputDropFinitePredicate": hi => {
            const isL = i => i === "l";
            const seq = hi.repeat("hello").dropLast(3, isL);
            hi.assert(seq.unbounded());
            hi.assert(seq.endsWith("helloheloheo"));
        },
        "unboundedInputDropInfinite": hi => {
            const even = i => i % 2 === 0;
            const seq = hi.range(6).repeat().dropFirst(Infinity, even);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([1, 3, 5, 1, 3, 5]));
            hi.assert(seq.endsWith([1, 3, 5, 1, 3, 5]));
        },
        "unidirectionalKnownLengthInput": hi => {
            const seq = () => hi.counter().until(i => i >= 8).assumeLength(8);
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().dropLast(2), [0, 1, 2, 3, 4, 5]);
            hi.assertEmpty(seq().dropLast(10));
            hi.assertEmpty(seq().dropLast(Infinity));
            hi.assertEqual(seq().dropLast(2, even), [0, 1, 2, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(10, even), [1, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(Infinity, even), [1, 3, 5, 7]);
        },
        "unidirectionalUnknownLengthInput": hi => {
            const seq = () => hi.counter().until(i => i >= 8).assumeBounded();
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().dropLast(2), [0, 1, 2, 3, 4, 5]);
            hi.assertEmpty(seq().dropLast(10));
            hi.assertEmpty(seq().dropLast(Infinity));
            hi.assertEqual(seq().dropLast(2, even), [0, 1, 2, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(10, even), [1, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(Infinity, even), [1, 3, 5, 7]);
        },
        "boundedNonSlicingInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(0).until(i => i >= 8).assumeBounded();
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().dropLast(2), [0, 1, 2, 3, 4, 5]);
            hi.assertEmpty(seq().dropLast(10));
            hi.assertEmpty(seq().dropLast(Infinity));
            hi.assertEqual(seq().dropLast(2, even), [0, 1, 2, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(10, even), [1, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(Infinity, even), [1, 3, 5, 7]);
        },
        "notKnownBoundedInput": hi => {
            const seq = hi.counter().until(i => i >= 8);
            hi.assert(seq.dropLast(0) === seq);
            hi.assertEmpty(seq.dropLast(Infinity));
            hi.assertFailWith(BoundsUnknownError,() => seq.dropLast(1));
            hi.assertFailWith(BoundsUnknownError,() => seq.dropLast(1, i => i !== 5));
        },
    },
});

export default dropLast;
