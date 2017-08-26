import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";
import {FilterSequence} from "./filter";
import {HeadSequence} from "./head";

export const UnidirectionalDropLastSequence = defineSequence({
    summary: "Enumerate the contents of a sequence, omitting the last so many elements.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to drop and a sequence
            to drop them from as input.
        `),
    },
    constructor: function UnidirectionalDropLastSequence(
        dropTarget, source, seenElements = undefined
    ){
        this.dropTarget = dropTarget;
        this.source = source;
        this.seenElements = seenElements;
        this.maskAbsentMethods(source);
    },
    initializeFront: function(){
        this.seenElements = [];
        while(this.seenElements.length < this.dropTarget && !this.source.done()){
            this.seenElements.push(this.source.nextFront());
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.seenElements) this.initializeFront();
        return this.source.done();
    },
    length: function(){
        return Math.max(0, this.source.nativeLength() - this.dropTarget);
    },
    front: function(){
        if(!this.seenElements) this.initializeFront();
        return this.seenElements[0];
    },
    popFront: function(){
        if(!this.seenElements) this.initializeFront();
        this.seenElements.shift();
        this.seenElements.push(this.source.nextFront());
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    slice: function(i, j){
        return this.source.nativeSlice(i, j);
    },
    copy: function(){
        return new UnidirectionalDropLastSequence(
            this.dropTarget, this.source.copy(), (this.seenElements ?
                this.seenElements.slice() : undefined
            )
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    }
});

export const DropLastPredicateSequence = defineSequence({
    summary: "Enumerate the contents of a sequence, omitting the last so many elements satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a number of elements to drop, a predicate
            describing which elements to drop, and a sequence to drop them from
            as input.
        `),
    },
    constructor: function DropLastPredicateSequence(
        dropTarget, predicate, source, frontIndex = undefined,
        seenElements = undefined, seenSatisfied = undefined
    ){
        this.dropTarget = dropTarget;
        this.predicate = predicate;
        this.source = source;
        this.frontIndex = frontIndex || 0;
        this.seenElements = seenElements;
        this.seenSatisfied = seenSatisfied;
        this.maskAbsentMethods(source);
    },
    initializeFront: function(){
        this.seenElements = [];
        this.seenSatisfied = [];
        while(this.seenSatisfied.length <= this.dropTarget && !this.source.done()){
            const element = this.source.nextFront();
            if(this.predicate(element)){
                this.seenSatisfied.push(this.frontIndex);
            }
            this.seenElements.push(element);
            this.frontIndex++;
        }
        if(this.source.done()){
            while(this.seenSatisfied[0] === this.frontIndex - this.seenElements.length){
                this.seenSatisfied.shift();
                this.seenElements.shift();
            }
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.seenElements) this.initializeFront();
        return this.seenElements.length === 0 && this.source.done();
    },
    front: function(){
        if(!this.seenElements) this.initializeFront();
        return this.seenElements[0];
    },
    popFront: function(){
        if(!this.seenElements){
            this.initializeFront();
        }
        // Remove the element just viewed
        this.seenElements.shift();
        // While the source has yet to be fully consumed...
        if(!this.source.done()){
            const element = this.source.nextFront();
            if(this.predicate(element)){
                this.seenSatisfied.shift();
                this.seenSatisfied.push(this.frontIndex);
            }
            this.seenElements.push(element);
            this.frontIndex++;
            if(this.seenSatisfied[0] <= this.frontIndex - this.seenElements.length - 1){
                this.seenSatisfied.shift();
                while(this.seenSatisfied.length <= this.dropTarget && !this.source.done()){
                    const nextElement = this.source.nextFront();
                    if(this.predicate(nextElement)){
                        this.seenSatisfied.push(this.frontIndex);
                    }
                    this.seenElements.push(nextElement);
                    this.frontIndex++;
                }
            }else if(this.source.done()){
                this.seenSatisfied.shift();
            }
        }
        // After the source was consumed and the last elements are being enumerated...
        if(this.source.done()){
            while(this.seenSatisfied[0] === this.frontIndex - this.seenElements.length){
                this.seenSatisfied.shift();
                this.seenElements.shift();
            }
        }
    },
    copy: function(){
        return new DropLastPredicateSequence(
            this.dropTarget, this.predicate, this.source.copy(), this.frontIndex,
            this.seenElements ? this.seenElements.slice() : undefined,
            this.seenSatisfied ? this.seenSatisfied.slice() : undefined
        );
    },
});

export const BidirectionalDropLastSequence = defineSequence({
    summary: "Enumerate the contents of an unbounded sequence, omitting the last so many elements.",
    supportRequired: [
        "back",
    ],
    supportsWith: [
        "index", "slice", "copy",
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
        hi => new BidirectionalDropLastSequence(0, hi.counter()),
        hi => new BidirectionalDropLastSequence(10, hi.counter()),
        hi => new BidirectionalDropLastSequence(0, hi.repeat("hello")),
        hi => new BidirectionalDropLastSequence(10, hi.repeat("hello")),
    ],
    constructor: function BidirectionalDropLastSequence(
        dropTarget, source, initializedBack = undefined
    ){
        this.dropTarget = dropTarget;
        this.source = source;
        this.initializedBack = initializedBack;
        this.maskAbsentMethods(source);
    },
    initializeBack: function(){
        this.initializedBack = true;
        for(let i = 0; i < this.dropTarget; i++){
            this.source.popBack();
        }
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
        if(!this.initializedBack) this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        if(!this.initializedBack) this.initializeBack();
        return this.source.popBack();
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    slice: function(i, j){
        return this.source.nativeSlice(i, j);
    },
    copy: function(){
        return new BidirectionalDropLastSequence(
            this.dropTarget, this.source.copy(), this.initializedBack
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const UnboundedDropLastPredicateSequence = defineSequence({
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
        dropTarget, predicate, source, droppedElements = undefined,
        initializedBack = undefined
    ){
        this.dropTarget = dropTarget;
        this.predicate = predicate;
        this.source = source;
        this.droppedElements = droppedElements || 0;
        this.initializedBack = initializedBack;
        this.maskAbsentMethods(source);
    },
    initializeBack: function(){
        this.initializedBack = true;
        while(
            this.droppedElements < this.dropTarget &&
            this.predicate(this.source.back())
        ){
            this.source.popBack();
            this.droppedElements++;
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
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.source.popFront();
    },
    back: function(){
        if(!this.initializedBack) this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        if(!this.initializedBack) this.initializeBack();
        this.source.popBack();
        while(
            this.droppedElements < this.dropTarget &&
            this.predicate(this.source.back())
        ){
            this.source.popBack();
            this.droppedElements++;
        }
    },
    index: function(i){
        return this.source.nativeIndex(i);
    },
    slice: function(i, j){
        return this.source.nativeSlice(i, j);
    },
    copy: function(){
        return new UnboundedDropLastPredicateSequence(
            this.dropTarget, this.predicate, this.source.copy(),
            this.droppedElements, this.initializedBack
        );
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const dropLast = wrap({
    name: "dropLast",
    summary: "Get a sequence minus the last so many elements.",
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
        warnings: (`
            When given a predicate function as input and an in-fact unbounded
            sequence that is not known-unbounded and which ever ceases to
            enumerate any more elements satisfying the predicate, attempting
            to even partially consume the returned sequence may produce an
            infinite loop.
        `),
        returnType: "sequence",
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
            if(source.nativeLength && source.nativeLength() <= dropTarget){
                return new FilterSequence(element => !predicate(element), source);
            }else if(source.unbounded()){
                if(source.back){
                    return new UnboundedDropLastPredicateSequence(drop, predicate, source);
                }else{
                    return source;
                }
            }else{
                return new DropLastPredicateSequence(drop, predicate, source);
            }
        }else if(source.nativeLength){
            const sourceLength = source.nativeLength();
            return (sourceLength <= drop ?
                new EmptySequence() :
                (source.nativeSlice ?
                    source.nativeSlice(0, sourceLength - drop) :
                    new HeadSequence(sourceLength - drop, source)
                )
            );
        }else if(source.back){
            return new BidirectionalDropLastSequence(drop, source);
        }else if(source.unbounded()){
            return source;
        }else{
            return new UnidirectionalDropLastSequence(drop, source);
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
        "unboundedUnidirectionalInput": hi => {
            const seq = hi.recur(i => i + 1).seed(0);
            hi.assertUndefined(seq.back);
            hi.assert(seq.dropLast(10) === seq);
            hi.assert(seq.dropLast(10, i => true) === seq);
            hi.assert(seq.dropLast(Infinity, i => i % 2 === 0).startsWith([1, 3, 5, 7]));
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
            const seq = () => hi.range(8).makeNonSlicing();
            const even = i => i % 2 === 0;
            hi.assertEqual(seq().dropLast(2), [0, 1, 2, 3, 4, 5]);
            hi.assertEmpty(seq().dropLast(10));
            hi.assertEmpty(seq().dropLast(Infinity));
            hi.assertEqual(seq().dropLast(2, even), [0, 1, 2, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(10, even), [1, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(Infinity, even), [1, 3, 5, 7]);
        },
        "notKnownBoundedInput": hi => {
            const seq = () => hi.counter().until(i => i >= 8);
            hi.assertEqual(seq().dropLast(2), [0, 1, 2, 3, 4, 5]);
            hi.assertEqual(seq().dropLast(2, i => i % 2 === 0), [0, 1, 2, 3, 5, 7]);
            hi.assertEqual(seq().dropLast(2, i => i % 2 !== 0), [0, 1, 2, 3, 4, 6]);
        },
    },
});

export default dropLast;
