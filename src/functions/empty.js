import Sequence from "../core/sequence";
// import {NullRepeatSequence} from "./repeat";

// A chronically empty sequence.
const EmptySequence = function(){};

EmptySequence.prototype = Object.create(Sequence.prototype);
EmptySequence.prototype.constructor = EmptySequence;
Object.assign(EmptySequence.prototype, {
    repeat: function(repetitions){
        const sequence = new NullRepeatSequence(this);
        sequence.repetitions = repetitions;
        return sequence;
    },
    reverse: function(){
        return this;
    },
    bounded: () => true,
    done: () => true,
    length: () => 0,
    left: () => 0,
    front: () => undefined,
    popFront: () => {},
    back: () => undefined,
    popBack: () => {},
    index: (i) => undefined,
    has: (i) => false,
    get: (i) => undefined,
    slice: function(i, j){
        return this;
    },
    copy: function(){
        return this;
    },
    reset: function(){
        return this;
    },
});

export {EmptySequence};

export default {
    name: "empty",
    expected: {},
    implementation: function(){
        return new EmptySequence();
    },
};
