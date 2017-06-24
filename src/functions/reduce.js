function SequenceReducer(
    combine, source, seedValue = null, hasSeed = false
){
    this.combine = combine;
    this.source = source;
    this.seedValue = seedValue;
    this.hasSeed = hasSeed;
    if(!source.copy) this.copy = null;
    if(!source.reset) this.reset = null;
}

Object.assign(SequenceReducer.prototype, {
    // Provide an initial seed value for the reduction.
    seed: function(value){
        this.seedValue = value;
        this.hasSeed = true;
        return this;
    },
    // Remove a previously-set seed from this object.
    unseed: function(){
        this.hasSeed = false;
        return this;
    },
    // Get a sequence enumerating every step in the reduce operation,
    // including the seed (if one was provided).
    sequence: function(){
        return new ReduceSequence(
            this.combine, asSequence(this.source),
            this.seedValue, this.hasSeed
        );
    },
    // Get the last value in the sequence synchronously.
    // Returns the fallback value if there was no last element.
    last: function(fallback = undefined){
        if(!validAsBoundedSequence(this.source)){
            throw "Failed to reduce sequence: Sequence isn't known to be bounded."
        }
        if(this.hasSeed){
            let accumulator = this.seed;
            for(let element of this.source){
                accumulator = this.combine(accumulator, element);
            }
            return accumulator;
        }else{
            let first = true;
            let accumulator = fallback;
            for(let element of this.source){
                accumulator = first ? element : this.combine(
                    accumulator, element
                );
                first = false;
            }
            return accumulator;
        }
    },
    collapse: function(){
        return this.sequence().collapse();
    },
    copy: function(){
        return new SequenceReducer(
            this.combine, this.source, this.seedValue, this.hasSeed
        );
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});
Object.assign(SequenceReducer.prototype, {
    // Shorthand alias for sequence method.
    seq: SequenceReducer.prototype.sequence,
    // Get the last value in the sequence asynchronously.
    lastAsync: function(fallback = undefined){
        return new Promise((resolve, reject) => {
            hi.callAsync(() => resolve(this.last(fallback)));
        });
    },
});

function ReduceSequence(
    combine, source, seedValue = null, hasSeed = false, initialize = true
){
    let done = source.done();
    this.combine = combine;
    this.source = source;
    this.accumulator = seedValue;
    this.seedValue = seedValue;
    this.hasSeed = hasSeed;
    this.lastElement = hasSeed || !done;
    this.maskAbsentMethods(source);
    if(initialize && !hasSeed && !done){
        this.accumulator = source.nextFront();
    }
}

ReduceSequence.prototype = Object.create(Sequence.prototype);
Object.assign(ReduceSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
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
        if(this.hasSeed) this.accumulator = this.seedValue;
        else if(!this.source.done()) this.accumulator = this.source.nextFront();
        return this;
    },
});

hi.register("reduce", {
    functions: 1,
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
}, function(combine, source){
    return new SequenceReducer(combine, source);
});
