import Sequence from "../core/sequence";

const ConcatSequence = function(sources){
    this.sources = sources;
    this.source = sources[0];
    this.frontSourceIndex = 0;
    this.backSourceIndex = sources.length;
    let noLength = false;
    for(const source of sources){
        this.maskAbsentMethods(source);
        noLength = noLength || !source.length;
    }
    // All sources must have length for index and slice to be supported.
    if(noLength){
        this.index = null;
        this.slice = null;
    }
};

ConcatSequence.prototype = Object.create(Sequence.prototype);
ConcatSequence.prototype.constructor = ConcatSequence;
Object.assign(ConcatSequence.prototype, {
    bounded: function(){
        for(const source of this.sources){
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
        for(const source of this.sources) sum += source.length();
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
        for(const source of this.sources){
            const nextOffset = offset + source.length();
            if(nextOffset > i) return source.index(i - offset);
            offset = nextOffset;
        }
        return this.sources[this.sources.length - 1].index(i - offset);
    },
    slice: function(i, j){
        let offset = 0;
        const sliceSources = [];
        for(const source of this.sources){
            const nextOffset = offset + source.length();
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
        return new ConcatSequence(sliceSources);
    },
    copy: function(){
        const copies = [];
        for(const source of this.sources) copies.push(source.copy());
        const copy = new ConcatSequence(this.transform, copies);
        copy.frontSourceIndex = this.frontSourceIndex;
        copy.backSourceIndex = this.backSourceIndex;
    },
    reset: function(){
        for(const source of this.sources) source.reset();
        this.frontSourceIndex = 0;
        this.backSourceIndex = this.sources.length;
        return this;
    },
});

// named export for pulling in the ConcatSequence only
export {ConcatSequence};

export default {
    name: "concat",
    expected: {
        sequences: "*",
    },
    implementation: function(sources){
        return new ConcatSequence(sources);
    },
};
