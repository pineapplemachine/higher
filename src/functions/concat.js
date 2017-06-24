hi.ConcatSequence = function(sources){
    this.sources = sources;
    this.source = sources[0];
    this.frontSourceIndex = 0;
    this.backSourceIndex = sources.length;
    let noLength = false;
    for(let source of sources){
        this.maskAbsentMethods(source);
        noLength = noLength || !source.length;
    }
    // All sources must have length for index and slice to be supported.
    if(noLength){
        this.index = null;
        this.slice = null;
    }
}

hi.ConcatSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.ConcatSequence.prototype, {
    bounded: function(){
        for(let source of this.sources){
            if(!source.bounded()) return false;
        }
        return true;
    },
    done: function(){
        return this.frontSourceIndex > this.backSourceIndex || (
            this.frontSourceIndex === this.backSourceIndex - 1 &&
            this.sources[this.frontSourceIndex].done()
        );
    },
    length: function(){
        let sum = 0;
        for(let source of this.sources) sum += source.length();
        return sum;
    },
    left: function(){
        let sum = 0;
        for(let i = this.frontSourceIndex; i < this.backSourceIndex; i++){
            sum += this.sources[i].left();
        }
        return sum;
    },
    front: function(){
        return this.sources[this.frontSourceIndex].front();
    },
    popFront: function(){
        this.sources[this.frontSourceIndex].popFront();
        while(
            this.frontSourceIndex < this.backSourceIndex - 1 &&
            this.sources[this.frontSourceIndex].done()
        ){
            this.frontSourceIndex++;
        }
    },
    back: function(){
        return this.sources[this.backSourceIndex - 1].back();
    },
    popBack: function(){
        this.sources[this.backSourceIndex - 1].popBack();
        while(
            this.frontSourceIndex < this.backSourceIndex - 1 &&
            this.sources[this.backSourceIndex - 1].done()
        ){
            this.backSourceIndex--;
        }
    },
    index: function(i){
        let offset = 0;
        for(let source of this.sources){
            let nextOffset = offset + source.length();
            if(nextOffset > i) return source.index(i - offset);
            offset = nextOffset;
        }
        return this.sources[this.sources.length - 1].index(i - offset);
    },
    slice: function(i, j){
        let offset = 0;
        let sliceSources = [];
        for(let source of this.sources){
            let nextOffset = offset + source.length();
            if(nextOffset > i){
                if(!sliceSources.length){
                    for(let k = offset; k < i; k++) source.popFront();
                }
                sliceSources.push(source);
            }
            if(nextOffset > j){
                for(let k = j; k < nextOffset; k++) source.popBack();
                break;
            }
            offset = nextOffset;
        }
        return new hi.ConcatSequence(sliceSources);
    },
    copy: function(){
        let copies = [];
        for(let source of this.sources) copies.push(source.copy());
        let copy = new hi.ConcatSequence(this.transform, copies);
        copy.frontSourceIndex = this.frontSourceIndex;
        copy.backSourceIndex = this.backSourceIndex;
    },
    reset: function(){
        for(let source of this.sources) source.reset();
        this.frontSourceIndex = 0;
        this.backSourceIndex = this.sources.length;
        return this;
    },
});

hi.register("concat", {
    sequences: "*",
}, function(sources){
    return new hi.ConcatSequence(sources);
});
