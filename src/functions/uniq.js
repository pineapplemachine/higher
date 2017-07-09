import {constants} from "../core/constants";
import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const UniqSequence = Sequence.extend({
    constructor: function UniqSequence(
        compare, source, lastElement = undefined
    ){
        this.compare = compare;
        this.source = source;
        this.lastElement = lastElement;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    // This method assumes that the input was not an unbounded sequence
    // containing one element infinitely repeated.
    // Since such an input would produce an infinite loop and should really
    // be avoided, this seems like a safe assumption to make.
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
        this.front = function(){
            return this.lastElement;
        }
        this.popFront = function(){
            this.source.popFront();
            while(!this.source.done()){
                const front = this.source.front();
                const last = this.lastElement;
                this.lastElement = front;
                if(!this.compare(front, last)) break;
                this.source.popFront();
            }
        };
        this.lastElement = this.source.nextFront();
        this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new UniqSequence(
            this.compare, this.source.copy(), this.lastElement
        );
    },
    reset: function(){
        this.source.reset();
        this.firstElement = true;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Enumerate only the elements that are not equivalent to their predecessor
// as determined by a comparison function.
// Like https://en.wikipedia.org/wiki/Uniq
export const uniq = wrap({
    name: "uniq",
    attachSequence: true,
    async: false,
    sequences: [
        UniqSequence
    ],
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1
        }
    },
    implementation: (compare, source) => {
        return new UniqSequence(
            compare || constants.defaults.comparisonFunction, source
        );
    },
});

export default uniq;
