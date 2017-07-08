import {isSequence, Sequence} from "../core/sequence";
import {asSequence, validAsSequence} from "../core/asSequence";
import {isArray, isIterable, isString} from "../core/types";
import {wrap} from "../core/wrap";

// TODO: Also write a backwards version of this sequence
export const FlattenDeepSequence = Sequence.extend({
    constructor: function FlattenDeepSequence(source){
        this.source = source;
        this.sourceStack = [source];
        this.frontSource = source;
    },
    // True when an element is a sequence which should be flattened.
    flattenElement: function(element){
        return !isString(element) && (
            isArray(element) ||
            isIterable(element) ||
            isSequence(element)
        );
    },
    // Used internally to handle progression to the next element.
    // Dive into the lowest possible sequence.
    diveStack: function(){
        while(!this.frontSource.done()){
            const front = this.frontSource.front();
            if(!this.flattenElement(front)){
                break;
            }else{
                this.frontSource.popFront();
                const source = asSequence(front);
                this.sourceStack.push(source);
                this.frontSource = source;
            }
        }
    },
    // Used internally to handle progression to the next element.
    // Resurface from empty sequences (and those containing only empties)
    bubbleStack: function(){
        while(this.sourceStack.length > 1 && this.frontSource.done()){
            this.sourceStack.pop();
            this.frontSource = this.sourceStack[this.sourceStack.length - 1];
        }
        if(!this.frontSource.done()){
            this.diveStack();
            if(this.frontSource.done()) this.bubbleStack();
        }
    },
    initialize: function(){
        this.diveStack();
        if(this.frontSource.done()) this.bubbleStack();
        this.front = function(){
            return this.frontSource.front();
        };
        this.popFront = function(){
            this.frontSource.popFront();
            this.diveStack();
            if(this.frontSource.done()) this.bubbleStack();
        };
    },
    bounded: () => false,
    done: function(){
        return this.sourceStack[0].done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.frontSource.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    // Can't support many operations because a sub-sequence might not support them.
    // TODO: Allow user to insist that the sequence should be bidirectional etc?
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

// Flatten recursively.
// Flattens arrays, iterables except strings, and sequences.
export const flattenDeep = wrap({
    name: "flattenDeep",
    attachSequence: true,
    async: false,
    sequences: [
        FlattenDeepSequence
    ],
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return new FlattenDeepSequence(source);
    },
});

export default flattenDeep;
