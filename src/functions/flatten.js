import Sequence from "../core/sequence";
import {asSequence, validAsSequence} from "../core/asSequence";

const FlattenSequence = function(source, frontSource = null){
    this.source = source;
    this.frontSource = frontSource;
};

FlattenSequence.prototype = Object.create(Sequence.prototype);
FlattenSequence.prototype.constructor = FlattenSequence;
Object.assign(FlattenSequence.prototype, {
    initializeFront: function(){
        while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
            const element = this.source.nextFront();
            if(!validAsSequence(element)){
                this.frontSource = new hi.OnceSequence(element); break;
            }else{
                this.frontSource = hi.asSequence(element);
            }
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
                const element = this.source.nextFront();
                if(!validAsSequence(element)){
                    this.frontSource = new hi.OnceSequence(element); break;
                }else{
                    this.frontSource = asSequence(element);
                }
            }
        };
    },
    bounded: () => false,
    done: function(){
        this.initializeFront();
        return this.frontSource.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initializeFront();
        return this.frontSource.front();
    },
    popFront: function(){
        this.initializeFront();
        this.popFront();
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

/**
 * Flatten a single level deep.
 * @param {*} source
 */
const flatten = (source) => {
    return new FlattenSequence(source);
};

export const registration = {
    name: "flatten",
    expected: {

    },
    implementation: flatten,
};

export default flatten;
