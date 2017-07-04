hi.ForwardJoinSequence = function(
    source, delimiter, frontSource = undefined,
    frontDelimiter = undefined, onDelimiter = undefined
){
    this.source = source;
    this.delimiter = delimiter;
    this.frontSource = frontSource;
    this.frontDelimiter = frontDelimiter;
    this.onDelimiter = onDelimiter;
};

hi.BackwardJoinSequence = function(
    source, delimiter, frontSource = undefined,
    frontDelimiter = undefined, onDelimiter = undefined
){
    this.source = source;
    this.delimiter = delimiter;
    this.frontSource = frontSource;
    this.frontDelimiter = frontDelimiter;
    this.onDelimiter = onDelimiter;
};

hi.ForwardJoinSequence.prototype = Object.create(hi.Sequence.prototype);
hi.ForwardJoinSequence.prototype.constructor = hi.ForwardJoinSequence;
Object.assign(hi.ForwardJoinSequence.prototype, {
    reverse: function(){
        return new hi.BackwardJoinSequence(this.source, this.delimiter);
    },
    initialize: function(){
        if(this.source.done()){
            this.front = () => undefined;
            this.popFront = () => {};
        }else if(this.delimiter.done()){
            this.frontSource = hi.asSequence(this.source.nextFront());
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = hi.asSequence(this.source.nextFront());
            }
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return this.frontSource.front();
            };
            this.popFront = function(){
                this.frontSource.popFront();
                while(this.frontSource.done() && !this.source.done()){
                    this.frontSource = hi.asSequence(this.source.nextFront());
                }
            };
        }else{
            this.frontDelimiter = this.delimiter.copy();
            this.frontSource = hi.asSequence(this.source.nextFront());
            this.onDelimiter = this.frontSource.done();
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return (this.onDelimiter ?
                    this.frontDelimiter.front() : this.frontSource.front()
                );
            };
            this.popFront = function(){
                if(this.onDelimiter){
                    this.frontDelimiter.popFront();
                    if(this.frontDelimiter.done()){
                        this.frontDelimiter = this.delimiter.copy();
                        this.onDelimiter = false;
                    }
                }else if(!this.frontSource.done()){
                    this.frontSource.popFront();
                    if(this.frontSource.done() && !this.source.done()){
                        this.frontSource = hi.asSequence(this.source.nextFront());
                        this.onDelimiter = true;
                    }
                }else if(!this.source.done()){
                    this.frontSource = hi.asSequence(this.source.nextFront());
                    this.onDelimiter = true;
                }
            };
        }
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

hi.BackwardJoinSequence.prototype = Object.create(hi.Sequence.prototype);
hi.BackwardJoinSequence.prototype.constructor = hi.BackwardJoinSequence;
Object.assign(hi.BackwardJoinSequence.prototype, {
    reverse: function(){
        return new hi.ForwardJoinSequence(this.source, this.delimiter);
    },
    initialize: function(){
        if(this.source.done()){
            this.front = () => undefined;
            this.popFront = () => {};
        }else if(this.delimiter.done()){
            this.frontSource = hi.asSequence(this.source.nextBack());
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = hi.asSequence(this.source.nextBack());
            }
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return this.frontSource.back();
            };
            this.popFront = function(){
                this.frontSource.popBack();
                while(this.frontSource.done() && !this.source.done()){
                    this.frontSource = hi.asSequence(this.source.nextBack());
                }
            };
        }else{
            this.frontDelimiter = this.delimiter.copy();
            this.frontSource = hi.asSequence(this.source.nextBack());
            this.onDelimiter = this.frontSource.done();
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return (this.onDelimiter ?
                    this.frontDelimiter.back() : this.frontSource.back()
                );
            };
            this.popFront = function(){
                if(this.onDelimiter){
                    this.frontDelimiter.popBack();
                    if(this.frontDelimiter.done()){
                        this.frontDelimiter = this.delimiter.copy();
                        this.onDelimiter = false;
                    }
                }else if(!this.frontSource.done()){
                    this.frontSource.popBack();
                    if(this.frontSource.done() && !this.source.done()){
                        this.frontSource = hi.asSequence(this.source.nextBack());
                        this.onDelimiter = true;
                    }
                }else if(!this.source.done()){
                    this.frontSource = hi.asSequence(this.source.nextBack());
                    this.onDelimiter = true;
                }
            };
        }
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    copy: null,
    reset: null,
});

hi.register("join", {
    sequences: 2,
}, function(sequences){
    const source = sequences[0];
    const delimiter = sequences[1];
    return new hi.ForwardJoinSequence(source, delimiter);
});
