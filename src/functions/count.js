function SequenceCounter(predicate, source){
    this.predicate = predicate;
    this.source = source;
    if(!source.copy) this.copy = null;
    if(!source.reset) this.reset = null;
};

SequenceCounter.prototype = Object.create(Sequence.prototype);
Object.assign(SequenceCounter.prototype, {
    sum: function(){
        let i = 0;
        for(let element of this.source){
            i += this.predicate(element) ? 1 : 0;
        }
        return i;
    },
    equals: function(n){
        let i = 0;
        for(let element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i > n) return false;
        }
        return i === +n;
    },
    lessThan: function(n){
        let i = 0;
        for(let element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i >= n) return false;
        }
        return true;
    },
    lessThanEqual: function(n){
        let i = 0;
        for(let element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i > n) return false;
        }
        return true;
    },
    greaterThan: function(n){
        let i = 0;
        for(let element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i > n) return true;
        }
        return false;
    },
    greaterThanEqual: function(n){
        let i = 0;
        for(let element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i >= n) return true;
        }
        return false;
    },
    copy: function(){
        return new SequenceCounter(this.predicate, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});
Object.assign(SequenceCounter.prototype, {
    // Alternatives
    notLessThan: SequenceCounter.prototype.greaterThanEqual,
    notGreaterThan: SequenceCounter.prototype.lessThanEqual,
    atLeast: SequenceCounter.prototype.greaterThanEqual,
    atMost: SequenceCounter.prototype.lessThanEqual,
    // Shorthands
    eq: SequenceCounter.prototype.equals,
    lt: SequenceCounter.prototype.lessThan,
    gt: SequenceCounter.prototype.greaterThan,
    gte: SequenceCounter.prototype.greaterThanEqual,
    lte: SequenceCounter.prototype.lessThanEqual,
});

const count = registerFunction("count", {
    functions: 1,
    sequences: 1,
    // Don't waste time coercing input iterables to sequences
    allowIterables: true,
}, function(predicate, source){
    return new SequenceCounter(predicate, source);
});
