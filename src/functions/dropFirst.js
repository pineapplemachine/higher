import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {FilterSequence} from "./filter";

export const DropFirstSequence = Sequence.extend({
    summary: "Enumerate the contents of a sequence, omitting the first so many elements.",
    supportsWith: [
        "length", "left", "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to drop and an input
            sequence. The number of elements to drop must be a non-negative
            integer.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new DropFirstSequence(0, hi.emptySequence()),
        hi => new DropFirstSequence(5, hi.emptySequence()),
        hi => new DropFirstSequence(0, hi.range(10)),
        hi => new DropFirstSequence(1, hi.range(10)),
        hi => new DropFirstSequence(2, hi.range(10)),
        hi => new DropFirstSequence(4, hi.range(10)),
        hi => new DropFirstSequence(10, hi.range(10)),
        hi => new DropFirstSequence(15, hi.range(10)),
        hi => new DropFirstSequence(0, hi.counter()),
        hi => new DropFirstSequence(1, hi.counter()),
        hi => new DropFirstSequence(10, hi.counter()),
    ],
    constructor: function DropFirstSequence(dropTarget, source){
        this.dropTarget = dropTarget;
        this.source = source;
        this.maskAbsentMethods(source);
    },
    initialize: function(){
        for(let i = 0; i < this.dropTarget && !this.source.done(); i++){
            this.source.popFront();
        }
        this.done = function(){
            return this.source.done();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            return this.source.popFront();
        };
        if(this.source.left) this.left = function(){
            return this.source.left();
        };
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        this.initialize();
        return this.source.done();
    },
    length: function(){
        const length = this.source.length() - this.dropTarget;
        return length >= 0 ? length : 0;
    },
    left: function(){
        const left = this.source.left() - this.dropTarget;
        return left >= 0 ? left : 0;
    },
    front: function(){
        this.initialize();
        return this.source.front();
    },
    popFront: function(){
        this.initialize();
        return this.source.popFront();
    },
    index: function(i){
        return this.source.index(i + this.dropTarget);
    },
    slice: function(i, j){
        return this.source.slice(i + this.dropTarget, j + this.dropTarget);
    },
    copy: function(){
        const copy = new DropFirstSequence(this.dropTarget, this.source.copy());
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        copy.left = this.left;
        return copy;
    },
    reset: function(){
        this.source.reset();
        delete this.done;
        delete this.front;
        delete this.popFront;
        delete this.left;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const DropFirstPredicateSequence = Sequence.extend({
    summary: "Enumerate the contents of a sequence, omitting the first so many elements to satisfy a predicate.",
    supportsWith: [
        "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to drop, a predicate
            function, and an input sequence. The number of elements to drop
            must be a non-negative integer.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new DropFirstPredicateSequence(0, i => true, hi.emptySequence()),
        hi => new DropFirstPredicateSequence(4, i => true, hi.emptySequence()),
        hi => new DropFirstPredicateSequence(0, i => false, hi.emptySequence()),
        hi => new DropFirstPredicateSequence(4, i => false, hi.emptySequence()),
        hi => new DropFirstPredicateSequence(0, i => true, hi.range(10)),
        hi => new DropFirstPredicateSequence(5, i => true, hi.range(10)),
        hi => new DropFirstPredicateSequence(10, i => true, hi.range(10)),
        hi => new DropFirstPredicateSequence(20, i => true, hi.range(10)),
        hi => new DropFirstPredicateSequence(0, i => false, hi.range(10)),
        hi => new DropFirstPredicateSequence(5, i => false, hi.range(10)),
        hi => new DropFirstPredicateSequence(1, i => i % 2 == 0, hi.range(10)),
        hi => new DropFirstPredicateSequence(3, i => i % 2 == 0, hi.range(10)),
        hi => new DropFirstPredicateSequence(5, i => i % 2 == 0, hi.range(10)),
        hi => new DropFirstPredicateSequence(10, i => i % 2 == 0, hi.range(10)),
        hi => new DropFirstPredicateSequence(0, i => true, hi.counter()),
        hi => new DropFirstPredicateSequence(5, i => true, hi.counter()),
        hi => new DropFirstPredicateSequence(5, i => false, hi.counter()),
    ],
    constructor: function DropFirstPredicateSequence(
        dropTarget, predicate, source, droppedElements = undefined
    ){
        this.dropTarget = dropTarget;
        this.predicate = predicate;
        this.source = source;
        this.droppedElements = droppedElements || 0;
        this.maskAbsentMethods(source);
    },
    initialize: function(){
        while(
            this.droppedElements < this.dropTarget && !this.source.done() &&
            this.predicate(this.source.front())
        ){
            this.source.popFront();
            this.droppedElements++;
        }
        this.done = function(){
            return this.source.done();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            this.source.popFront();
            while(
                this.droppedElements < this.dropTarget && !this.source.done() &&
                this.predicate(this.source.front())
            ){
                this.source.popFront();
                this.droppedElements++;
            }
        };
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        this.initialize();
        return this.source.done();
    },
    front: function(){
        this.initialize();
        return this.source.front();
    },
    popFront: function(){
        this.initialize();
        return this.source.popFront();
    },
    copy: function(){
        const copy = new DropFirstPredicateSequence(
            this.dropTarget, this.predicate, this.source.copy(), this.droppedElements
        );
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        copy.left = this.left;
        return copy;
    },
    reset: function(){
        this.source.reset();
        delete this.done;
        delete this.front;
        delete this.popFront;
        delete this.left;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const dropFirst = wrap({
    name: "dropFirst",
    summary: "Get a sequence minus the first so many elements.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input a sequence, an optional number of
            elements to drop from its front, and an optional predicate function.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements in
            the input sequence, except for the first so many elements satisfying
            the predicate.
            /When no number of elements was specified, #1 is used as a default.
            When no predicate was specified, the output behaves as though a
            predicate satisfied by every input was given.
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
            "DropFirstPredicateSequence": (`
                When a predicate function was specified and the number of elements
                to drop was a positive finite number.
            `),
            "DropFirstSequence": (`
                When no predicate function was specified, the number of elements
                to drop was a positive finite number, and the input sequence
                either did not have known length or did not support slicing.
            `),
        },
        examples: [
            "basicUsage", "basicUsagePredicate",
        ],
        related: [
            "first", "dropLast",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: "?",
            functions: {optional: wrap.expecting.predicate},
            sequences: 1,
        },
    },
    implementation: (dropTarget, predicate, source) => {
        // TODO: Write optimized sequence implementations for dropTarget === 1
        const drop = dropTarget || 1;
        if(dropTarget <= 0){
            return source;
        }else if(!isFinite(drop)){
            return (predicate ?
                new FilterSequence(element => !predicate(element), source) :
                new EmptySequence()
            );
        }else if(!predicate && source.slice && source.length){
            return (source.length() <= drop ?
                new EmptySequence() : source.slice(drop, source.length())
            );
        }else if(predicate){
            return (source.length && source.length() <= drop ?
                new FilterSequence(element => !predicate(element), source) :
                new DropFirstPredicateSequence(drop, predicate, source)
            );
        }else{
            return (source.length && source.length() <= drop ?
                new EmptySequence() :
                new DropFirstSequence(drop, source)
            );
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5, 6, 7];
            hi.assertEqual(hi.dropFirst(4, array), [5, 6, 7]);
        },
        "basicUsagePredicate": hi => {
            const array = [1, 2, 3, 4, 5, 6, 7];
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.dropFirst(2, even, array), [1, 3, 5, 6, 7]);
        },
        "dropZero": hi => {
            const boundedSeq = hi.range(10);
            hi.assert(boundedSeq.dropFirst(0) === boundedSeq);
            const unboundedSeq = hi.counter();
            hi.assert(unboundedSeq.dropFirst(0) === unboundedSeq);
        },
        "dropZeroPredicate": hi => {
            const boundedSeq = hi.range(10);
            hi.assert(boundedSeq.dropFirst(0, i => true) === boundedSeq);
            const unboundedSeq = hi.counter();
            hi.assert(unboundedSeq.dropFirst(0, i => true) === unboundedSeq);
        },
        "dropOne": hi => {
            hi.assertEqual(hi.range(4).dropFirst(), [1, 2, 3]);
            hi.assertEqual(hi.range(4).dropFirst(1), [1, 2, 3]);
        },
        "dropOnePredicate": hi => {
            hi.assertEqual(hi.range(4).dropFirst(i => true), [1, 2, 3]);
            hi.assertEqual(hi.range(4).dropFirst(1, i => true), [1, 2, 3]);
        },
        "dropSeveral": hi => {
            const string = "hello world";
            hi.assertEqual(hi(string).dropFirst(2), "llo world");
            hi.assertEqual(hi(string).dropFirst(8), "rld");
            hi.assertEqual(hi(string).dropFirst(10), "d");
            hi.assertEmpty(hi(string).dropFirst(11));
            hi.assertEmpty(hi(string).dropFirst(20));
        },
        "dropSeveralPredicate": hi => {
            const string = "apple pear plum";
            const isP = i => i === "p";
            hi.assertEqual(hi(string).dropFirst(2, isP), "ale pear plum");
            hi.assertEqual(hi(string).dropFirst(3, isP), "ale ear plum");
            hi.assertEqual(hi(string).dropFirst(4, isP), "ale ear lum");
            hi.assertEqual(hi(string).dropFirst(10, isP), "ale ear lum");
            hi.assertEqual(hi(string).dropFirst(20, isP), "ale ear lum");
        },
        "dropInfinity": hi => {
            hi.assertEmpty(hi.range(10).dropFirst(Infinity));
            hi.assertEmpty(hi.counter().dropFirst(Infinity));
            hi.assertEmpty(hi.emptySequence().dropFirst(Infinity));
        },
        "dropInfinityPredicate": hi => {
            const even = i => i % 2 === 0;
            hi.assertEqual(hi.range(10).dropFirst(Infinity, even), [1, 3, 5, 7, 9]);
            hi.assertEmpty(hi.range(10).dropFirst(Infinity, i => true));
        },
        "unboundedInputDropFinite": hi => {
            const isL = i => i === "l";
            const seq = hi.repeat("hello").dropFirst(3, isL);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith("heohelohello"));
        },
        "unboundedInputDropInfinite": hi => {
            const even = i => i % 2 === 0;
            const seq = hi.counter().dropFirst(Infinity, even);
            hi.assert(seq.unbounded());
            hi.assert(seq.startsWith([1, 3, 5, 7, 9]));
        },
    },
});

export default dropFirst;
