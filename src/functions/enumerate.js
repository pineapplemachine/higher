hi.EnumerateSequence = function(
    source, start = 0, step = 1, frontIndex = 0, backIndex = 0, initialize = true
){
    this.source = source;
    this.start = start;
    this.step = step;
    this.frontIndex = frontIndex;
    if(initialize){
        this.backIndex = source.length ? start + (step * (source.length() - 1)) : 0;
    }else{
        this.backIndex = backIndex;
    }
    if(!source.length) this.back = null;
    this.maskAbsentMethods(source);
};

hi.EnumerateSequence.prototype = Object.create(hi.Sequence.prototype);
hi.EnumerateSequence.prototype.constructor = hi.EnumerateSequence;
Object.assign(hi.EnumerateSequence.prototype, {
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
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
        return {index: this.frontIndex, value: this.source.front()};
    },
    popFront: function(){
        this.source.popFront();
        this.frontIndex += this.step;
    },
    back: function(){
        return {index: this.backIndex, value: this.source.back()};
    },
    popBack: function(){
        this.source.popBack();
        this.backIndex -= this.step;
    },
    index: function(i){
        return {index: this.start + i * this.step, value: this.source.index(i)};
    },
    slice: function(i, j){
        return new hi.EnumerateSequence(
            this.source.slice(i, j), this.start + i * this.step, this.step
        );
    },
    has: null,
    get: null,
    copy: function(){
        return new hi.EnumerateSequence(
            this.source.copy(), this.start, this.step,
            this.frontIndex, this.backIndex, false
        );
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = this.start;
        if(this.back) this.backIndex = start + (step * (source.length() - 1));
        return this;
    },
});

hi.register("enumerate", {
    numbers: [0, 2],
    sequences: 1,
}, function(numbers, source){
    const start = numbers[0] || 0;
    const step = numbers.length > 1 ? numbers[1] : 1;
    return new hi.EnumerateSequence(source, start, step);
});
