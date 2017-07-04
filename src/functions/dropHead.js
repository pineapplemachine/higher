import Sequence from "../core/sequence";

const DropHeadSequence = function(dropElements, source, initialized = false){
    this.dropElements = dropElements;
    this.source = source;
    this.initialized = initialized;
    this.maskAbsentMethods(source);
};

DropHeadSequence.prototype = Object.create(Sequence.prototype);
DropHeadSequence.prototype.constructor = DropHeadSequence;
Object.assign(DropHeadSequence.prototype, {
    initialize: function(){
        this.initialized = true;
        for(let i = 0; i < this.dropElements && !this.source.done(); i++){
            this.source.popFront();
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(!this.initialized) this.initialize();
        return this.source.done();
    },
    length: function(){
        return this.source.length() - this.dropElements;
    },
    left: function(){
        return this.source.left() - this.initialized * this.dropElements;
    },
    front: function(){
        if(!this.initialized) this.initialize();
        return this.source.front();
    },
    popFront: function(){
        if(!this.initialized) this.initialize();
        this.source.popFront();
    },
    back: null,
    popBack: null,
    index: function(i){
        return this.source.index(i + this.dropElements);
    },
    // Don't create DropHeadSequences for sequences that already have slicing!
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new DropHeadSequence(
            this.dropElements, this.source.copy(), this.initialized
        );
    },
    reset: function(){
        this.source.reset();
        this.DropHeadSequence = false;
        return this;
    },
});

const dropHead = (dropElements, source) => {
    if(dropElements <= 0){
        return source;
    }else if(source.slice && source.length){
        return source.slice(dropElements, source.length());
    }else{
        return new DropHeadSequence(dropElements, source);
    }
};

export {DropHeadSequence};

export const registration = {
    name: "dropHead",
    expected: {
        numbers: 1,
        sequences: 1,
    },
    implementation: dropHead,
};

export default dropHead;
