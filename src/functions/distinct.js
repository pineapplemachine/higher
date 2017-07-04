hi.DistinctSequence = function(
    source, history = null, frontValue = null, initialize = true
){
    this.source = source;
    this.history = history || {};
    this.frontValue = initialize && !source.done() ? source.front() : frontValue;
    this.maskAbsentMethods(source);
};

hi.DistinctSequence.prototype = Object.create(hi.Sequence.prototype);
hi.DistinctSequence.prototype.constructor = hi.DistinctSequence;
Object.assign(hi.DistinctSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        return this.frontValue;
    },
    popFront: function(){
        this.history[this.frontValue] = true;
        while(!this.source.done()){
            this.frontValue = this.source.nextFront();
            if(!(this.frontValue in this.history)) break;
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new hi.DistinctSequence(
            this.source.copy(), Object.assign({}, this.history),
            this.frontValue, false
        );
    },
    reset: function(){
        this.source.reset();
        this.history = {};
        return this;
    },
});

hi.register("distinct", {
    sequences: 1,
}, function(source){
    return new hi.DistinctSequence(source);
});
