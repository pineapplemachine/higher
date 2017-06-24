hi.ReverseSequence = function(source){
    this.source = source;
    this.maskAbsentMethods(source);
    // Length property is required to support index and slice operations.
    if(!source.length){
        this.index = null;
        this.slice = null;
    }
}

hi.ReverseSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.ReverseSequence.prototype, {
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
        return this.source.back();
    },
    popFront: function(){
        return this.source.popBack();
    },
    back: function(){
        return this.source.front();
    },
    popBack: function(){
        return this.source.popFront();
    },
    index: function(i){
        return this.source.index(this.source.length - i - 1);
    },
    slice: function(i, j){
        return reverse.raw(this.source.slice(
            this.source.length - j - 1,
            this.source.length - i - 1
        ));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new hi.ReverseSequence(this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
    // This sequence requires special handling when collapsing.
    collapseBreak: function(target, length){
        let i = 0;
        let j = length;
        while(i < j){
            let t = target[i];
            target[i] = target[j - 1];
            target[j - 1] = t;
            i++;
            j--;
        }
        return length;
    },
});

hi.register("reverse", {
    sequences: 1,
}, function(source){
    if(source instanceof hi.ReverseSequence){
        return source.source;
    }else{
        return new hi.ReverseSequence(source);
    }
});
