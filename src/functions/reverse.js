import {error} from "../core/error";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";
import {OnDemandSequence} from "./onDemandSequence";

export const ReverseSequence = defineSequence({
    summary: "Enumerate the elements of an input sequence in reverse order.",
    supportRequired: [
        "back",
    ],
    supportsAlways: [
        "back",
    ],
    supportsWith: {
        "length": "any", "copy": "any",
        "has": "any", "get": "any",
        "index": ["index", "length"],
        "slice": ["slice", "length"],
    },
    overrides: {
        "reverse": {none: true},
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a single bidirectional sequence as input.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "reverseOverride": hi => {
            const seq = new hi.sequence.ReverseSequence(hi.range(10));
            hi.assertEqual(seq.reverse(), hi.range(10));
        },
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new ReverseSequence(hi.emptySequence()),
        hi => new ReverseSequence(hi([1, 2, 3, 4, 5])),
        hi => new ReverseSequence(hi("hello")),
        hi => new ReverseSequence(hi.range(8)),
        hi => new ReverseSequence(hi.counter()),
        hi => new ReverseSequence(hi.repeat("beep boop beep")),
        hi => new ReverseSequence(hi.repeatElement(1)),
    ],
    constructor: function ReverseSequence(source){
        this.source = source;
        this.maskAbsentMethods(source);
        // Length property is required to support index and slice operations.
        // TODO: Handle this differently
        if(!source.length){
            this.nativeIndex = undefined;
            this.nativeSlice = undefined;
        }
    },
    reverse: function(){
        return this.source;
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
        return this.source.nativeLength();
    },
    front: function(){
        return this.source.back();
    },
    popFront: function(){
        return this.source.popBack();
    },
    back: function(){
        return this.source.front();
    },
    popBack: function(){
        return this.source.popFront();
    },
    index: function(i){
        return this.source.nativeIndex(this.source.length - i - 1);
    },
    slice: function(i, j){
        return new ReverseSequence(this.source.nativeSlice(
            this.source.length - j - 1,
            this.source.length - i - 1
        ));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new ReverseSequence(this.source.copy());
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
    // This sequence requires special handling when collapsing.
    collapseBreak: function(target, length){
        let i = 0;
        let j = length;
        while(i < j){
            const t = target[i];
            target[i] = target[j - 1];
            target[j - 1] = t;
            i++;
            j--;
        }
        return length;
    },
});

// Implementation for reversing a known-bounded unidirectional sequence.
export const ReverseOnDemandSequence = function(source){
    return new OnDemandSequence(ReverseSequence.appliedTo(ArraySequence), {
        bounded: () => source.bounded(),
        unbounded: () => source.unbounded(),
        done: () => source.done(),
        back: () => source.front(),
        length: source.nativeLength ? () => source.nativeLength() : undefined,
        has: source.has ? (i) => source.has(i) : undefined,
        get: source.get ? (i) => source.get(i) : undefined,
        dump: () => {
            const array = [];
            for(const element of source) array.push(element);
            return new ReverseSequence(new ArraySequence(array));
        },
    });
};

// Enumerate the contents of a bidirectional input sequence in reverse order.
export const reverse = wrap({
    name: "reverse",
    summary: "Enumerate the elements of an input sequence in reverse order.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single sequence as input.
            The sequence must either be bidirectional, known-bounded, or both
            in order to be reversible.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements of
            the input sequence in reverse order.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: false,
    sequences: [
        ReverseSequence
    ],
    arguments: {
        one: wrap.expecting.notUnidirectionalUnboundedSequence,
    },
    implementation: function reverse(source){
        if(source.back){
            return new ReverseSequence(source);
        }else{
            return ReverseOnDemandSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi.reverse([1, 2, 3, 4, 5]), [5, 4, 3, 2, 1]);
            hi.assertEqual(hi.reverse("hello"), "olleh");
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().reverse());
        },
        "singleLengthInput": hi => {
            hi.assertEqual(hi.reverse("?"), "?");
        },
        "boundedBidirectionalInput": hi => {
            hi.assertEqual(hi.repeat("ih", 2).reverse(), "hihi");
        },
        "boundedUnidirectionalInput": hi => {
            const seq = () => hi.recur(i => i + i).seed(1).head(4);
            hi.assertEqual(seq(), [1, 2, 4, 8]);
            hi.assertEqual(seq().reverse(), [8, 4, 2, 1]);
        },
        "unboundedBidirectionalInput": hi => {
            const seq = hi.repeat("hello", Infinity).reverse();
            hi.assert(seq.startsWith("olleholleholleh"));
            hi.assert(seq.endsWith("olleholleholleh"));
        },
        "notKnownBoundedUnidirectionalInput": hi => {
            const seq = () => hi.recur(i => i + 1).seed(1).until(i => i >= 8);
            hi.assertEqual(seq(), [1, 2, 3, 4, 5, 6, 7]);
            hi.assertEqual(seq().reverse(), [7, 6, 5, 4, 3, 2, 1]);
        },
        "unboundedUnidirectionalInput": hi => {
            const seq = hi.recur(i => i + "!").seed("hello");
            hi.assertFail(() => seq.reverse());
        },
    },
});

export default reverse;
