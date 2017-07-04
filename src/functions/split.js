hi.ForwardSplitSequence = function(
    compare, source, delimiter, beginDelimiter = undefined,
    endDelimiter = undefined, frontValue = undefined,
    frontResult = undefined, findDelimiters = undefined
){
    if(!source.slice || !source.length){
        throw "Error splitting sequence: Input must support slicing and length.";
    }
    if(!delimiter.copy){
        throw "Error splitting sequence: Delimiter must support copying.";
    }
    this.compare = compare;
    this.source = source;
    this.delimiter = delimiter;
    this.beginDelimiter = beginDelimiter;
    this.endDelimiter = endDelimiter;
    this.frontValue = frontValue;
    this.frontResult = frontResult || {low: 0, high: 0};
    this.findDelimiters = findDelimiters || new hi.ForwardFindSequence(
        compare, source, delimiter.copy()
    );
};

hi.BackwardSplitSequence = function(
    compare, source, delimiter, beginDelimiter = undefined,
    endDelimiter = undefined, frontValue = undefined,
    frontResult = undefined, findDelimiters = undefined
){
    if(!source.slice || !source.length){
        throw "Error splitting sequence: Input must support slicing and length.";
    }
    if(!delimiter.copy){
        throw "Error splitting sequence: Delimiter must support copying.";
    }
    this.compare = compare;
    this.source = source;
    this.delimiter = delimiter;
    this.beginDelimiter = beginDelimiter;
    this.endDelimiter = endDelimiter;
    this.frontValue = frontValue;
    const sourceLength = source.length();
    this.frontResult = frontResult || {low: sourceLength, high: sourceLength};
    this.findDelimiters = findDelimiters || new hi.BackwardFindSequence(
        compare, source, delimiter.copy()
    );
};

hi.ForwardSplitSequence.prototype = Object.create(hi.Sequence.prototype);
hi.ForwardSplitSequence.prototype.constructor = hi.ForwardSplitSequence;
Object.assign(hi.ForwardSplitSequence.prototype, {
    reverse: function(){
        return new hi.BackwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter
        );
    },
    // Include the delimiter sequence at the beginning of every element
    beginWithDelimiter: function(){
        this.beginDelimiter = true;
        return this;
    },
    // Include the delimiter sequence at the end of every element
    endWithDelimiter: function(){
        this.endDelimiter = true;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return !this.frontValue && this.findDelimiters.done();
    },
    length: null,
    left: null,
    front: function(){
        if(!this.frontValue) this.popFront();
        return this.frontValue;
    },
    popFront: function(){
        if(this.findDelimiters.done()){
            this.frontValue = !this.frontResult ? null : this.source.slice(
                this.beginDelimiter ? this.frontResult.low : this.frontResult.high,
                this.source.length()
            );
            this.frontResult = null;
        }else{
            const result = this.findDelimiters.nextFront();
            this.frontValue = this.source.slice(
                this.beginDelimiter ? this.frontResult.low : this.frontResult.high,
                this.endDelimiter ? result.high : result.low
            );
            this.frontResult = result;
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        return new hi.ForwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter, this.frontValue,
            this.frontResult, this.findDelimiters.copy()
        );
    },
    reset: function(){
        this.findDelimiters.reset();
        return this;
    },
});

hi.BackwardSplitSequence.prototype = Object.create(hi.Sequence.prototype);
hi.BackwardSplitSequence.prototype.constructor = hi.BackwardSplitSequence;
Object.assign(hi.BackwardSplitSequence.prototype, {
    reverse: function(){
        return new hi.ForwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter
        );
    },
    // Include the delimiter sequence at the beginning of every element
    beginWithDelimiter: function(){
        this.beginDelimiter = true;
        return this;
    },
    // Include the delimiter sequence at the end of every element
    endWithDelimiter: function(){
        this.endDelimiter = true;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        return !this.frontValue && this.findDelimiters.done();
    },
    length: null,
    left: null,
    front: function(){
        if(!this.frontValue) this.popFront();
        return this.frontValue;
    },
    popFront: function(){
        if(this.findDelimiters.done()){
            this.frontValue = !this.frontResult ? null : this.source.slice(
                0, this.endDelimiter ? this.frontResult.high : this.frontResult.low
            );
            this.frontResult = null;
        }else{
            const result = this.findDelimiters.nextFront();
            this.frontValue = this.source.slice(
                this.beginDelimiter ? result.low : result.high,
                this.endDelimiter ? this.frontResult.high : this.frontResult.low
            );
            this.frontResult = result;
        }
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        return new hi.BackwardSplitSequence(
            this.compare, this.source, this.delimiter,
            this.beginDelimiter, this.endDelimiter, this.frontValue,
            this.frontResult, this.findDelimiters.copy()
        );
    },
    reset: function(){
        this.findDelimiters.reset();
        return this;
    },
});

hi.register("split", {
    functions: "?",
    sequences: 2,
}, function(compare, sequences){
    const compareFunc = compare || hi.defaultComparisonFunction;
    const source = sequences[0];
    const delimiter = sequences[1];
    if(!source.slice || !source.length) source.forceEager();
    if(!delimiter.copy) delimiter.forceEager();
    return new hi.ForwardSplitSequence(compareFunc, source, delimiter);
});
