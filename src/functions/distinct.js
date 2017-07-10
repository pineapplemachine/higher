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
            functions: "?",
            sequences: 1
        }
    },
    implementation: (transform, source) => {
        return new DistinctSequence(
            transform || (element => element), source
        );
    },
});

export default distinct;
