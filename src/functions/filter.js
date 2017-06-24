function FilterSequence(predicate, source, initialize = true){
    if(initialize){
        while(!predicate(source.front())){
            source.popFront();
        }
        if(source.back) while(!predicate(source.back())){
            source.popBack();
        }
    }
    this.predicate = predicate;
    this.source = source;
    this.maskAbsentMethods(source);
}

FilterSequence.prototype = Object.create(Sequence.prototype);
Object.assign(FilterSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
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
        this.source.popFront();
        while(!this.source.done() && !this.predicate(this.source.front())){
            this.source.popFront();
        }
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        this.source.popBack();
        while(!this.source.done() && !this.predicate(this.source.back())){
            this.source.popBack();
        }
    },
    index: null,
    slice: null,
    has: function(i){
        return this.source.has(i) && this.predicate(this.source.get(i));
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new FilterSequence(this.predicate, this.source.copy(), false);
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

hi.register("filter", {
    functions: 1,
    sequences: 1,
}, function(predicate, source){
    return new FilterSequence(predicate, source)
});
