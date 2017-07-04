import {unboundedError, collapseCopyError} from "./internal/errors";
import {isArray, isSequence} from "./types";
import {ArraySequence} from "./asSequence";

const Sequence = function(){};

Sequence.prototype[Symbol.iterator] = function(){
    return this;
};
Sequence.prototype.next = function(){
    const done = this.done();
    const value = done ? undefined : this.nextFront();
    return {value: value, done: done};
};
Sequence.prototype.nextFront = function(){
    const value = this.front();
    this.popFront();
    return value;
};
Sequence.prototype.nextBack = function(){
    const value = this.back();
    this.popBack();
    return value;
};
// TODO: Make this part of normal sequence spec just like bounded
Sequence.prototype.unbounded = function(){
    return this.source ? this.source.unbounded() : false;
};
Sequence.prototype.maskAbsentMethods = function(source){
    if(!source.back){
        this.back = null;
        this.popBack = null;
        this.nextBack = null;
    }
    if(this.length && !source.length) this.length = null;
    if(this.left && !source.left) this.left = null;
    if(this.index && !source.index) this.index = null;
    if(this.slice && !source.slice) this.slice = null;
    if(this.has && !source.has) this.has = null;
    if(this.get && !source.get) this.get = null;
    if(this.copy && !source.copy) this.copy = null;
    if(this.reset && !source.reset) this.reset = null;
};
// Here be dragons
Sequence.prototype.collapse = function(limit = -1){
    if(limit < 0 && !this.bounded()){
        throw unboundedError("collapse", "collapse");
    }
    let source = this;
    const stack = [];
    const breaks = [];
    let i = 0;
    while(source && isSequence(source)){
        if(source.collapseBreak) breaks.push(stack.length);
        stack.push(source);
        source = source.source;
    }
    if(!isArray(source)){
        throw (
            "Sequence collapsing is supported only for sequences that are " +
            "based on an array. To acquire other sequences in-memory, see " +
            "the write, array, and object methods."
        );
    }
    const arraySequence = stack[stack.length - 1];
    function write(seq, limit, intermediate){
        if(limit < 0 && !seq.bounded()) throw unboundedError(
            "collapse", "collapse", intermediate
        );
        i = 0;
        while(!seq.done()){
            const value = seq.nextFront();
            if(i < source.length) source[i] = value;
            else source.push(value);
            i++;
        }
    }
    if(!breaks.length){
        write(this, limit, false);
    }else{
        for(let j = breaks.length - 1; j >= 0; j--){
            const breakIndex = breaks[j];
            const breaking = stack[breakIndex];
            const prev = stack[breakIndex + 1];
            const next = stack[breakIndex - 1];
            if(prev){
                if(!prev.collapseBreak){
                    if(!prev.copy) throw collapseCopyError(
                        prev.type, breaking.type
                    );
                    write(prev.copy(), -1, true);
                }
            }else{
                i = source.length;
            }
            i = breaking.collapseBreak(source, i);
            if(next){
                // TODO: Can this be accomplished more safely?
                // Idea: Reset method should accept an optional source,
                // if it's passed then the sequence uses it as the new basis
                next.source = arraySequence;
                arraySequence.backIndex = i;
                if(next.sources) next.sources[0] = arraySequence;
            }
        }
        if(breaks[0] !== 0){
            write(stack[0], limit, false);
        }
    }
    if(i < source.length){
        source.splice(i);
    }
    return source;
};
Sequence.prototype.collapseAsync = function(limit = -1){
    return new hi.Promise((resolve, reject) => {
        hi.callAsync(function(){
            resolve(this.collapse(limit));
        });
    });
};

/**
 * Turn a lazy sequence into an array-based one.
 * Used internally by functions when a purely lazy implementation won't work
 * because a sequence doesn't support the necessary operations.
 * Not necessarily intended for external use.
 */
Sequence.prototype.forceEager = function(){
    if(!this.bounded()){
        throw "Failed to consume sequence: Sequence is not known to be bounded.";
    }
    this.lazyDone = this.done;
    this.lazyFront = this.front;
    this.lazyPopFront = this.popFront;
    this.initializeEager = function(){
        const array = [];
        while(!this.lazyDone()){
            array.push(this.lazyFront());
            this.lazyPopFront();
        }
        delete this.lazyDone;
        delete this.lazyFront;
        delete this.lazyPopFront;
        this.source = array;
        this.lowIndex = 0;
        this.highIndex = this.source.length;
        this.frontIndex = this.lowIndex;
        this.backIndex = this.highIndex;
        this.done = ArraySequence.prototype.done;
        this.length = ArraySequence.prototype.length;
        this.left = ArraySequence.prototype.left;
        this.front = ArraySequence.prototype.front;
        this.popFront = ArraySequence.prototype.popFront;
        this.back = ArraySequence.prototype.back;
        this.popBack = ArraySequence.prototype.popBack;
        this.index = ArraySequence.prototype.index;
        this.slice = ArraySequence.prototype.slice;
        this.has = ArraySequence.prototype.has;
        this.get = ArraySequence.prototype.get;
        this.copy = ArraySequence.prototype.copy;
        this.reset = ArraySequence.prototype.reset;
    };
    this.bounded = () => true;
    if(!this.length) this.length = function(){
        this.initializeEager();
        return this.length();
    };
    if(!this.left) this.left = function(){
        this.initializeEager();
        return this.left();
    };
    this.front = function(){
        this.initializeEager();
        return this.front();
    };
    this.popFront = function(){
        this.initializeEager();
        return this.popFront();
    };
    this.back = function(){
        this.initializeEager();
        return this.back();
    };
    this.popBack = function(){
        this.initializeEager();
        return this.popBack();
    };
    this.index = function(i){
        this.initializeEager();
        return this.index(i);
    };
    this.slice = function(i, j){
        this.initializeEager();
        return this.slice(i, j);
    };
    this.copy = function(){
        this.initializeEager();
        return this.copy();
    };
    this.reset = function(){
        return this;
    };
    return this;
};

export default Sequence;
