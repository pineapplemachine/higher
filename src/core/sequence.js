hi.internal.unboundedError = function(action, method, intermediate = false){
    return (
        `Failed to ${action} the sequence because to do so would require ` +
        "fully consuming an unbounded sequence" +
        (intermediate ? " in an intermediate step." : ". Try passing " +
        `a length limit to the "${method}" call to only store the ` +
        "first so many elements or, if you're sure the sequence will " +
        "eventually end, use the sequence's assumeBounded method " +
        "before collapsing it.")
    );
};
hi.internal.collapseCopyError = function(prevType, breakingType){
    return (
        "Collapsing the sequence failed because one of the " +
        `intermediate sequences of type "${prevType}" does ` +
        "not support copying even though it appears before a " +
        `special collapse behavior sequence "${breakingType}".`
    );
};

hi.Sequence = function(){};

hi.Sequence.prototype[Symbol.iterator] = function(){
    return this;
};
hi.Sequence.prototype.next = function(){
    const done = this.done();
    const value = done ? undefined : this.nextFront();
    return {value: value, done: done};
};
hi.Sequence.prototype.nextFront = function(){
    const value = this.front();
    this.popFront();
    return value;
};
hi.Sequence.prototype.nextBack = function(){
    const value = this.back();
    this.popBack();
    return value;
};
hi.Sequence.prototype.unbounded = function(){
    return false;
};
hi.Sequence.prototype.maskAbsentMethods = function(source){
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
hi.Sequence.prototype.collapse = function(limit = -1){
    if(limit < 0 && !this.bounded()){
        throw hi.internal.unboundedError("collapse", "collapse");
    }
    let source = this;
    const stack = [];
    const breaks = [];
    let i = 0;
    while(source && hi.isSequence(source)){
        if(source.collapseBreak) breaks.push(stack.length);
        stack.push(source);
        source = source.source;
    }
    if(!hi.isArray(source)){
        throw (
            "Sequence collapsing is supported only for sequences that are " +
            "based on an array. To acquire other sequences in-memory, see " +
            "the write, array, and object methods."
        );
    }
    const arraySequence = stack[stack.length - 1];
    function write(seq, limit, intermediate){
        if(limit < 0 && !seq.bounded()) throw hi.internal.unboundedError(
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
                    if(!prev.copy) throw hi.internal.collapseCopyError(
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
hi.Sequence.prototype.collapseAsync = function(limit = -1){
    return new hi.Promise((resolve, reject) => {
        hi.callAsync(function(){
            resolve(this.collapse(limit));
        });
    });
};
// Turn a lazy sequence into an array-based one.
// Used internally by functions when a purely lazy implementation won't work
// because a sequence doesn't support the necessary operations.
// Not necessarily intended for external use.
hi.Sequence.prototype.forceEager = function(){
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
        this.done = hi.ArraySequence.prototype.done;
        this.length = hi.ArraySequence.prototype.length;
        this.left = hi.ArraySequence.prototype.left;
        this.front = hi.ArraySequence.prototype.front;
        this.popFront = hi.ArraySequence.prototype.popFront;
        this.back = hi.ArraySequence.prototype.back;
        this.popBack = hi.ArraySequence.prototype.popBack;
        this.index = hi.ArraySequence.prototype.index;
        this.slice = hi.ArraySequence.prototype.slice;
        this.has = hi.ArraySequence.prototype.has;
        this.get = hi.ArraySequence.prototype.get;
        this.copy = hi.ArraySequence.prototype.copy;
        this.reset = hi.ArraySequence.prototype.reset;
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
