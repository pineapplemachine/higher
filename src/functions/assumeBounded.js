import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const AssumeBoundedSequence = function(source){
    this.source = source;
    this.maskAbsentMethods(source);
};

AssumeBoundedSequence.prototype = Object.create(Sequence.prototype);
AssumeBoundedSequence.prototype.constructor = AssumeBoundedSequence;
Object.assign(AssumeBoundedSequence.prototype, {
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        this.source.popBack();
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return new AssumeBoundedSequence(this.source.slice(i, j));
    },
    copy: function(){
        return new AssumeBoundedSequence(this.source.copy());
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

// An AssumeBoundedSequence can be used to assure higher that a potentially
// unbounded sequence is in fact bounded.
// This may be helpful if you're sure a sequence that you want to fully
// consume will eventually end, even if higher can't tell for itself.
export const assumeBounded = wrap({
    name: "assumeBounded":
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: () => {
        return source.bounded() ? source : new AssumeBoundedSequence(source);
    },
});

export default assumeBounded;
