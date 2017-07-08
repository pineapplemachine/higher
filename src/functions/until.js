import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const UntilSequence = Sequence.extend({
    constructor: function UntilSequence(
        predicate, source, isInclusive = false, included = true,
        satisfied = false, frontValue = null, initialize = true
    ){
        this.predicate = predicate;
        this.source = source;
        this.isInclusive = isInclusive;
        this.included = included;
        if(source.done() || !initialize){
            this.frontValue = frontValue;
            this.satisfied = satisfied;
        }else{
            this.frontValue = source.nextFront();
            this.satisfied = predicate(this.frontValue);
        }
        this.maskAbsentMethods(source);
    },
    inclusive: function(){
        this.isInclusive = true;
        this.included = false;
        return this;
    },
    exclusive: function(){
        this.isInclusive = false;
        this.included = true;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: () => false,
    done: function(){
        return (this.satisfied || this.source.done()) && this.included;
    },
    length: null,
    left: null,
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        if(this.satisfied){
            this.included = true;
        }else{
            this.frontValue = this.source.nextFront();
            this.satisfied = this.predicate(this.frontValue);
        }
    },
    back: null,
    popBack: null,
    index: function(i){
        return this.source.index(i);
    },
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new UntilSequence(
            this.predicate, this.source.copy(), this.isInclusive,
            this.included, this.satisfied, this.frontValue, false
        );
    },
    reset: function(){
        this.source.reset();
        this.included = !this.isInclusive;
        if(!this.source.done()){
            this.frontValue = this.source.nextFront();
            this.satisfied = this.predicate(this.frontValue);
        }
        return this;
    },
});

export const until = wrap({
    name: "until",
    attachSequence: true,
    async: false,
    sequences: [
        UntilSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        return new UntilSequence(predicate, source);
    },
});

export default until;
