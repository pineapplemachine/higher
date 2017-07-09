import {Sequence} from "../core/sequence";
import {asSequence, validAsSequence} from "../core/asSequence";
import {wrap} from "../core/wrap";

export const ForwardFlattenSequence = Sequence.extend({
    constructor: function ForwardFlattenSequence(source, frontSource = null){
        this.source = source;
        this.frontSource = frontSource;
    },
    reverse: function(){
        return new hi.BackwardFlattenSequence(this.source);
    },
    initialize: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            this.frontSource = asSequence(this.source.nextFront());
        }
        this.done = function(){
            return this.frontSource.done();
        };
        this.front = function(){
            return this.frontSource.front();
        };
        this.popFront = function(){
            this.frontSource.popFront();
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = asSequence(this.source.nextFront());
            }
        };
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        this.initialize();
        return this.frontSource.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.frontSource.front();
    },
    popFront: function(){
        this.initialize();
        this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

export const BackwardFlattenSequence = Sequence.extend({
    constructor: function BackwardFlattenSequence(source, frontSource = null){
        this.source = source;
        this.frontSource = frontSource;
    },
    reverse: function(){
        return new ForwardFlattenSequence(this.source);
    },
    initialize: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            this.frontSource = asSequence(this.source.nextBack());
        }
        this.done = function(){
            return this.frontSource.done();
        };
        this.front = function(){
            return this.frontSource.back();
        };
        this.popFront = function(){
            this.frontSource.popBack();
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = asSequence(this.source.nextBack());
            }
        };
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        this.initialize();
        return this.frontSource.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.frontSource.back();
    },
    popFront: function(){
        this.initialize();
        this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

// Flatten a single level deep.
export const flatten = wrap({
    name: "flatten",
    attachSequence: true,
    async: false,
    sequences: [
        ForwardFlattenSequence,
        BackwardFlattenSequence
    ],
    arguments: {
        one: wrap.expecting.sequence
    },
    imlementation: (source) => {
        return new ForwardFlattenSequence(source);
    },
});

export default flatten;
