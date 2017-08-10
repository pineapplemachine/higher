import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {SingularMapSequence} from "./map";

export const IndexesSequence = defineSequence({
    summary: "Enumerate the elements in a sequence that are positioned at some indexes.",
    supportsWith: {
        "length": "indexSequence", "left": "indexSequence", "back": "indexSequence",
        "index": "indexSequence", "slice": "indexSequence", "copy": "indexSequence",
        "reset": "indexSequence",
    },
    overrides: {
        indexes: {one: wrap.expecting.sequence},
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as input source sequence and a sequence of
            indexes to be enumerated in the source sequence.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "indexesOverride": hi => {
            const seq = new hi.sequence.IndexesSequence(hi.range(10), hi([7, 5, 1, 3]));
            hi.assertEqual(seq.indexes([0, 3, 2], [7, 3, 1]));
        },
    },
    constructor: function IndexesSequence(
        source, indexSequence, consumedElements = undefined
    ){
        this.source = source;
        this.indexSequence = indexSequence;
        this.consumedElements = consumedElements || [];
    },
    indexes: function(getIndexes){
        const indexSequence = indexes(this.indexSequence, getIndexes);
        return new IndexesSequence(this.source, indexSequence, this.consumedElements);
    },
    getElementBySourceIndex: function(i){
        if(i < 0 || i === Infinity) return undefined;
        while(this.consumedElements.length <= i && !this.source.done()){
            this.consumedElements.push(this.source.nextFront());
        }
        return this.consumedElements[i];
    },
    bounded: function(){
        return this.indexSequence.bounded();
    },
    unbounded: function(){
        return this.indexSequence.bounded();
    },
    done: function(){
        return this.indexSequence.done();
    },
    length: function(){
        return this.indexSequence.length();
    },
    left: function(){
        return this.indexSequence.left();
    },
    front: function(){
        return this.getElementBySourceIndex(this.indexSequence.front());
    },
    popFront: function(){
        this.indexSequence.popFront();
    },
    back: function(){
        return this.getElementBySourceIndex(this.indexSequence.back());
    },
    popBack: function(){
        this.indexSequence.popBack();
    },
    index: function(i){
        return this.getElementBySourceIndex(this.indexSequence.index(i));
    },
    slice: function(i, j){
        return new IndexesSequence(
            this.source, this.indexSequence.slice(i, j), this.consumedElements
        );
    },
    copy: function(){
        return new IndexesSequence(
            this.source, this.indexSequence.copy(), this.consumedElements
        );
    },
    reset: function(){
        this.indexSequence.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const indexes = wrap({
    names: ["indexes", "indices"],
    summary: "Get a sequence of the elements at some given indexes.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects two sequences as input.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements of
            the first sequence located at the indexes specified by the second
            sequence.
            Indexes that are #Infinity or out of bounds of the sequence being
            indexed produce #undefined elements in the output sequence.
        `),
        returnType: {
            "SingularMapSequence": (`
                When the input sequence supported indexing and either had
                known length or was known to be unbounded.
            `),
            "IndexesSequence": (`
                When the input sequence did not support indexing or, if it
                did, the sequence both did not have known length and was not
                known to be unbounded.
            `),
        },
        examples: [
            "basicUsage",
        ],
        related: [
            "dropIndexes",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [wrap.expecting.sequence, wrap.expecting.sequence],
    },
    implementation: (source, getIndexes) => {
        if(source.length && source.index){
            const sourceLength = source.length();
            const transform = i => {
                const index = +i;
                return (index >= 0 && index < sourceLength ?
                    source.index(index) : undefined
                );
            }
            return new SingularMapSequence(transform, getIndexes);
        }else if(source.unbounded() && source.index){
            const transform = i => {
                const index = +i;
                return (index >= 0 && index !== Infinity ?
                    source.index(index) : undefined
                );
            }
            return new SingularMapSequence(transform, getIndexes);
        }else{
            return new IndexesSequence(source, getIndexes);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["apple", "bistro", "cherry", "dough", "espresso"];
            const seq = hi.indexes(strings, [3, 0, 1]);
            hi.assertEqual(seq, ["dough", "apple", "bistro"]);
        },
        "outOfBoundsIndexes": hi => {
            const array = [0, 1, 2, 3];
            const seq = hi.indexes(array, [0, 10, 1, -2, Infinity]);
            hi.assertEqual(seq, [0, undefined, 1, undefined, undefined]);
        },
        "invalidIndexes": hi => {
            const array = [0, 1, 2, 3];
            const seq = hi.indexes(array, [0, NaN, undefined, "!!"]);
            hi.assertEqual(seq, [0, undefined, undefined, undefined]);
        },
        "noIndexes": hi => {
            hi.assertEmpty(hi.range(10).indexes([]));
            hi.assertEmpty(hi.emptySequence().indexes([]));
        },
        "emptyInput": hi => {
            const seq = hi.emptySequence().indexes([0, 2, -2, NaN, Infinity, undefined]);
            hi.assertUndefined(seq.front());
            hi.assert(seq.uniform());
        },
        "unboundedIndexingInput": hi => {
            const seq = hi.counter().indexes([0, 1, -1, Infinity, NaN]);
            hi.assertEqual(seq, [0, 1, undefined, undefined, undefined]);
        },
        "unboundedNonIndexingInput": hi => {
            const source = () => hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assertEmpty(source().indexes([]));
            const seq = source().indexes([0, 7, -1, 2, 20, Infinity, NaN]);
            hi.assertEqual(seq, [0, 7, undefined, 2, undefined, undefined, undefined]);
        },
    },
});
    
export const indices = indexes;

export default indexes;
    
