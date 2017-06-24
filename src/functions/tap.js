hi.TapSequence = function(callback, source){
    this.callback = callback;
    this.source = source;
    this.frontValue = null;
    this.backValue = null;
    this.cachedFront = false;
    this.cachedBack = false;
    this.maskAbsentMethods(source);
}

hi.TapSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.TapSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        this.frontValue = this.source.front();
        this.cachedFront = true;
        return this.frontValue;
    },
    popFront: function(){
        this.callback(this.cachedFront ? this.frontValue : this.source.front());
        this.source.popFront();
        this.cachedFront = false;
    },
    back: function(){
        this.backValue = this.source.back();
        this.cachedBack = true;
        return this.backValue;
    },
    popBack: function(){
        this.callback(this.cachedBack ? this.backValue : this.source.back());
        this.source.popBack();
        this.cachedBack = false;
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return new hi.TapSequence(this.callback, this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        let copy = new hi.TapSequence(this.callback, this.source.copy());
        copy.frontValue = this.frontValue;
        copy.backValue = this.backValue;
        copy.cachedFront = this.cachedFront;
        copy.cachedBack = this.cachedBack;
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

hi.register("tap", {
    functions: 1,
    sequences: 1,
}, function(callback, source){
    return new hi.TapSequence(callback, source);
});
