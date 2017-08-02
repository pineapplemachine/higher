import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const DistinctSequence = Sequence.extend({
    constructor: function DistinctSequence(
        transform, source, history = null
    ){
        this.transform = transform;
        this.source = source;
        this.history = history || {};
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
    length: null,
    left: null,
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.history[this.transform(this.source.nextFront())] = true;
        while(!this.source.done()){
            const front = this.source.front();
            if(!(this.transform(front) in this.history)) break;
            this.source.popFront();
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new DistinctSequence(
            this.source.copy(), Object.assign({}, this.history)
        );
    },
    reset: function(){
        this.source.reset();
        this.history = {};
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const distinct = wrap({
    name: "distinct",
    attachSequence: true,
    async: false,
    sequences: [
        DistinctSequence
    ],
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.transformation},
            sequences: 1,
        },
    },
    implementation: (transform, source) => {
        return new DistinctSequence(
            transform || (element => element), source
        );
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
    },
});

export default distinct;
