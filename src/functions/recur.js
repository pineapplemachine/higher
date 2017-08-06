import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const RecurSequence = Sequence.extend({
    constructor: function RecurSequence(
        transform, seedValue = null, frontValue = null
    ){
        this.transform = transform;
        this.seedValue = seedValue;
        this.frontValue = frontValue;
    },
    // Call this to set the initial value of the generator.
    // Necessarily resets the state of the sequence.
    seed: function(value){
        this.seedValue = value;
        this.frontValue = value;
        return this;
    },
    bounded: () => false,
    unbounded: () => true,
    done: () => false,
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.frontValue = this.transform(this.frontValue);
    },
    copy: function(){
        return new RecurSequence(
            this.transform, this.seedValue, this.frontValue
        );
    },
    reset: function(){
        this.frontValue = this.seedValue;
        return this;
    },
});

// Produce a sequence via repeated application of a transformation function
// to some seed value.
export const recur = wrap({
    name: "recur",
    attachSequence: false,
    async: false,
    sequences: [
        RecurSequence
    ],
    arguments: {
        one: wrap.expecting.function
    },
    implementation: (transform) => {
        return new RecurSequence(transform);
    },
});

export default recur;
