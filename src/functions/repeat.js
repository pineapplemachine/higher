hi.FiniteRepeatSequence = function(
    repetitions, source,
    originalFrontSource = null, originalBackSource = null,
    frontSource = null, backSource = null
){
    if(!source.copy){
        throw "Error repeating sequence: Only copyable sequences can be repeated.";
    }
    this.repetitions = repetitions;
    this.source = source;
    this.originalFrontSource = originalFrontSource || source;
    this.originalBackSource = originalBackSource || (
        source.back ? source : null
    );
    this.frontSource = frontSource || this.originalFrontSource.copy();
    this.backSource = backSource || (
        source.back ? this.originalBackSource.copy() : null
    );
    this.frontRepetitions = 0;
    this.backRepetitions = 0;
    this.maskAbsentMethods(source);
    // Source must have known length to support left, index, slice operations.
    if(!source.length){
        this.left = null;
        this.index = null;
        this.slice = null;
    }
    // Source must be bidirectional to support slicing
    if(!source.back){
        this.slice = null;
    }
    // Only needs to break a collapse if it repeats more than once
    if(repetitions <= 1) this.collapseBreak = null;
};

hi.InfiniteRepeatSequence = function(source, frontSource = null, backSource = null){
    if(!source.copy){
        throw "Error repeating sequence: Only copyable sequences can be repeated.";
    }
    this.source = source;
    this.frontSource = frontSource || source.copy();
    this.backSource = backSource || (
        source.back ? source.copy() : null
    );
    this.maskAbsentMethods(source);
};

hi.NullRepeatSequence = function(source){
    this.source = source;
};

hi.FiniteRepeatSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.FiniteRepeatSequence.prototype, {
    finishedRepetitions: function(){
        return this.frontRepetitions + this.backRepetitions;
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return (
            this.finishedRepetitions() >= this.repetitions &&
            this.frontSource.done()
        );
    },
    length: function(){
        return this.source.length() * this.repetitions;
    },
    left: function(){
        return this.source.left() + this.source.length() * (
            this.repetitions - this.finishedRepetitions() - 1
        );
    },
    front: function(){
        return this.frontSource.front();
    },
    popFront: function(){
        this.frontSource.popFront();
        if(this.frontSource.done()){
            this.frontRepetitions++;
            const finishedRepetitions = this.finishedRepetitions();
            if(this.backSource && finishedRepetitions === this.repetitions - 1){
                this.frontSource = this.backSource;
            }else if(finishedRepetitions < this.repetitions){
                this.frontSource = this.originalFrontSource.copy();
            }
        }
    },
    back: function(){
        return this.backSource.back();
    },
    popBack: function(){
        this.backSource.popBack();
        if(this.backSource.done()){
            this.backRepetitions++;
            const finishedRepetitions = this.finishedRepetitions();
            if(finishedRepetitions === this.repetitions - 1){
                this.backSource = this.frontSource;
            }else if(finishedRepetitions < this.repetitions){
                this.backSource = this.originalBackSource.copy();
            }
        }
    },
    index: function(i){
        return this.source.index(i % this.source.length());
    },
    slice: function(i, j){
        const length = this.source.length();
        const lowIndex = i % length;
        const highIndex = j % length;
        if(j - i < length && highIndex >= lowIndex){
            return this.source.slice(lowIndex, highIndex);
        }else if(lowIndex === 0 && highIndex === 0){
            return new hi.FiniteRepeatSequence((j - i) / length, this.source);   
        }else{
            const repetitions = Math.ceil(j / length) - Math.floor(i / length);
            const frontSource = (
                lowIndex === 0 ? this.source : this.source.slice(lowIndex, length)
            );
            const backSource = (
                highIndex === 0 ? this.source : this.source.slice(0, highIndex)
            );
            return new hi.FiniteRepeatSequence(
                repetitions, this.source,
                this.source, this.source,
                frontSource, backSource
            );
        }
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new hi.FiniteRepeatSequence(
            this.repetitions, this.source,
            this.originalFrontSource, this.originalBackSource,
            this.frontSource.copy(), this.backSource.copy()
        );
    },
    reset: function(){
        this.frontRepetitions = 0;
        this.frontSource = this.originalFrontSource.copy();
        if(this.back){
            this.backRepetitions = 0;
            this.backSource = this.originalBackSource.copy();
        }
        return this;
    },
    collapseBreak: function(target, length){
        if(this.repetitions === 0){
            return 0;
        }else if(this.repetitions === 1){
            return length;
        }else{
            let i = 0;
            let j = length;
            const writes = length * (this.repetitions - 1);
            while(j < target.length && i < writes){
                target[j++] = target[i++];
            }
            while(i < writes){
                target.push(target[i++]);
            }
            target.splice(length * this.repetitions);
            return length * this.repetitions;
        }
    },
});

hi.InfiniteRepeatSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.InfiniteRepeatSequence.prototype, {
    repetitions: Infinity,
    unbounded: () => true,
    bounded: () => false,
    done: () => false,
    length: null,
    left: null,
    front: function(){
        return this.frontSource.front();
    },
    popFront: function(){
        this.frontSource.popFront();
        if(this.frontSource.done()) this.frontSource = this.source.copy();
    },
    back: function(){
        return this.backSource.back();
    },
    popBack: function(){
        this.backSource.popBack();
        if(this.backSource.done()) this.backSource = this.source.copy();
    },
    index: function(i){
        return this.source.index(i % this.source.length());
    },
    // Note: This method is a bit dirty as it relies on knowing
    // the implementation details of FiniteRepeatSequence.
    // I'm trying not to feel too bad about this since the relevant code
    // is defined just a few tens of lines above here.
    slice: function(i, j){
        const repeat = new hi.FiniteRepeatSequence(
            0, this.source, null, null, null, null
        );
        return repeat.slice(i, j);
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new hi.InfniteRepeatSequence(
            this.source, this.frontSource, this.backSource
        );
    },
    reset: function(){
        this.frontSource = this.source.copy();
        if(this.back) this.backSource = this.source.copy();
    },
    collapseBreak: function(target, length){
        // TODO: Can this be fixed?
        throw "Cannot collapse infinitely repeated sequence.";
    },
});

hi.NullRepeatSequence.prototype = Object.create(hi.EmptySequence.prototype);
Object.assign(hi.NullRepeatSequence.prototype, {
    repetitions: 0,
    slice: function(i, j){
        return new hi.NullRepeatSequence(this.source);
    },
    copy: function(){
        return new hi.NullRepeatSequence(this.source);
    },
});

hi.register("repeat", {
    numbers: "?",
    sequences: 1,
}, function(repetitions, source){
    const getCopyableSource = (source) => {
        if(source.copy) return source;
        else if(source.bounded()) return new hi.LazyArraySequence(source);
        else throw "Error repeating sequence: Sequence is unbounded and uncopyable.";
    };
    if(repetitions <= 0 && repetitions !== null){
        return new hi.NullRepeatSequence(source);
    }else if(source.unbounded()){
        return source;
    }else if(repetitions && isFinite(repetitions)){
        return new hi.FiniteRepeatSequence(repetitions, getCopyableSource(source));
    }else{
        return new hi.InfiniteRepeatSequence(getCopyableSource(source));
    }
});
