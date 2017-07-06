import {asSequence, validAsBoundedSequence} from "../core/asSequence";
import {callAsync} from "../core/callAsync";
import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const ReduceSequence = function(
    combine, source, seedValue = null, hasSeed = false, initialize = true
){
    const done = source.done();
    this.combine = combine;
    this.source = source;
    this.accumulator = seedValue;
    this.seedValue = seedValue;
    this.hasSeed = hasSeed;
    this.lastElement = hasSeed || !done;
    this.maskAbsentMethods(source);
    // TODO: Move this out of the creation function, into initialization logic
    if(initialize && !hasSeed && !done){
        this.accumulator = source.nextFront();
    }
};

ReduceSequence.prototype = Object.create(Sequence.prototype);
ReduceSequence.prototype.constructor = ReduceSequence;
Object.assign(ReduceSequence.prototype, {
    // Get the last value in the sequence synchronously.
    // Returns the fallback value if there was no last element.
    last: function(fallback = undefined){
        if(!validAsBoundedSequence(this.source)){
            throw "Failed to reduce sequence: Sequence isn't known to be bounded.";
        }
        if(this.hasSeed){
            let accumulator = this.seed;
            for(const element of this.source){
                accumulator = this.combine(accumulator, element);
            }
            return accumulator;
        }else{
            let first = true;
            let accumulator = fallback;
            for(const element of this.source){
                accumulator = first ? element : this.combine(
                    accumulator, element
                );
                first = false;
            }
            return accumulator;
        }
    },
    lastAsync: function(fallback = undefined){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.last(fallback)));
        });
    },
    seed: function(value){
        this.seedValue = value;
        this.hasSeed = true;
        return this;
    },
    unseed: function(){
        this.hasSeed = false;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return !this.lastElement && this.source.done();
    },
    length: function(){
        return this.source.length() - 1 + this.hasSeed;
    },
    left: function(){
        return this.source.left() - 1 + this.hasSeed;
    },
    front: function(){
        return this.accumulator;
    },
    popFront: function(){
        if(this.source.done()){
            this.lastElement = false;
        }else{
            this.accumulator = this.combine(
                this.accumulator, this.source.nextFront()
            );
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        return new ReduceSequence(
            this.combine, this.source.copy(),
            this.seedValue, this.hasSeed, false
        );
    },
    reset: function(){
        this.source.reset();
        if(this.hasSeed){
            this.accumulator = this.seedValue;
        }else{
            // TODO: Assign in an initialization function
            this.accumulator = this.source.nextFront();
        }
        else if(!this.source.done()) this.accumulator = this.source.nextFront();
        return this;
    },
});

export const reduce = wrap({
    names: ["reduce", "fold"],
    attachSequence: true,
    async: false,
    sequences: [
        ReduceSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (combine, source) => {
        return new ReduceSequence(combine, source);
    },
});

export const fold = reduce;

export default reduce;
