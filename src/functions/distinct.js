import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const DistinctSequence = function(
    source, history = null, frontValue = null, initialize = true
){
    this.source = source;
    this.history = history || {};
    this.frontValue = initialize && !source.done() ? source.front() : frontValue;
    this.maskAbsentMethods(source);
};

DistinctSequence.prototype = Object.create(Sequence.prototype);
DistinctSequence.prototype.constructor = DistinctSequence;
Object.assign(DistinctSequence.prototype, {
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
        return this.frontValue;
    },
    popFront: function(){
        this.history[this.frontValue] = true;
        while(!this.source.done()){
            this.frontValue = this.source.nextFront();
            if(!(this.frontValue in this.history)) break;
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
            this.source.copy(), Object.assign({}, this.history),
            this.frontValue, false
        );
    },
    reset: function(){
        this.source.reset();
        this.history = {};
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
        one: wrap.expecting.sequence
    },
    imlementation: (source) => {
        return new DistinctSequence(source);
    },
});

export default distinct;
