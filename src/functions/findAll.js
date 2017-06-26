hi.FindSequenceResult = function(source, low, high){
    this.source = source;
    this.low = low;
    this.high = high;
    this.index = low;
    this.length = high - low;
    if(!source.slice){
        this.slice = null;
        this.array = null;
        this.write = null;
        this.string = null;
    }
};

// TODO: Maybe this should just be a sequence somehow?
Object.assign(hi.FindSequenceResult.prototype, {
    slice: function(){
        return this.source.slice(this.low, this.high);
    },
    array: function(...args){
        return this.slice().array(...args);
    },
    write: function(...args){
        return this.slice().write(...args);
    },
    string: function(){
        return this.slice().string();
    },
});

hi.FindSequenceThread = function(compare, index, search, searchElement, alive){
    this.compare = compare;
    this.index = index;
    this.search = search;
    this.searchElement = searchElement;
    this.alive = alive;
};

Object.assign(hi.FindSequenceThread.prototype, {
    consumeForward: function(element){
        if(this.compare(element, this.searchElement)){
            this.searchElement = this.search.front();
            if(this.search.done()){
                this.alive = false;
                return true;
            }else{
                this.search.popFront();
                return false;
            }
        }else{
            this.alive = false;
            return false;
        }
    },
    consumeBackward: function(element){
        if(this.compare(element, this.searchElement)){
            this.searchElement = this.search.back();
            if(this.search.done()){
                this.alive = false;
                return true;
            }else{
                this.search.popBack();
                return false;
            }
        }else{
            this.alive = false;
            return false;
        }
    },
    forwardResult: function(source, index){
        const low = this.index;
        const high = index + 1;
        return new hi.FindSequenceResult(source, low, high);
    },
    backwardResult: function(source, index){
        const low = index - 1;
        const high = this.index;
        return new hi.FindSequenceResult(source, low, high);
    },
    copy: function(){
        return new hi.FindSequenceThread(
            this.compare, this.index, this.search.copy(),
            this.searchElement, this.alive
        );
    },
});

hi.ForwardFindSequence = function(
    compare, source, search, searchThreads = undefined
){
    if(!search.copy) throw (
        "Failed to create find sequence: Search sequence must be copyable."
    );
    this.compare = compare;
    this.source = source;
    this.search = search;
    this.currentResult = null;
    this.searchElement = null;
    this.nextSearchElement = null;
    this.frontIndex = 0;
    this.searchThreads = searchThreads || [];
    if(!source.copy) this.copy = null;
    if(!source.reset) this.reset = null;
    if(!source.back || !search.back || !source.length) this.reverse = function(){
        // TODO: Fall back on eager eval where possible
        throw "Failed to reverse find sequence: An input is unidirectional.";
    };
};

hi.BackwardFindSequence = function(
    compare, source, search, searchThreads = undefined
){
    if(!search.copy) throw (
        "Failed to create find sequence: Search sequence must be copyable."
    );
    this.compare = compare;
    this.source = source;
    this.search = search;
    this.currentResult = null;
    this.searchElement = null;
    this.nextSearchElement = null;
    this.backIndex = source.length();
    this.searchThreads = searchThreads || [];
    if(!source.copy) this.copy = null;
    if(!source.reset) this.reset = null;
};

hi.ForwardFindSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.ForwardFindSequence.prototype, {
    reverse: function(){
        return new hi.BackwardFindSequence(
            this.compare, this.source, this.search
        );
    },
    initialize: function(){
        if(this.search.done()){
            // Search subject is empty
            this.done = () => true;
            this.front = () => undefined;
            this.popFront = () => {};
            return;
        }
        this.searchElement = this.search.nextFront();
        if(this.search.done()){
            // Search subject contains one element
            while(!this.source.done() && !this.currentResult){
                if(this.compare(this.source.nextFront(), this.searchElement)){
                    this.currentResult = new hi.FindSequenceResult(
                        this.source, this.frontIndex, this.frontIndex + 1
                    );
                }
                this.frontIndex++;
            }
            this.done = function(){
                return !this.currentResult && this.source.done();
            };
            this.front = function(){
                return this.currentResult;
            };
            this.popFront = function(){
                this.currentResult = null;
                while(!this.currentResult && !this.source.done()){
                    if(this.compare(this.source.nextFront(), this.searchElement)){
                        this.currentResult = new hi.FindSequenceResult(
                            this.source, this.frontIndex, this.frontIndex + 1
                        );
                    }
                    this.frontIndex++;
                }
            };
        }else{
            // Search subject contains more than one element
            this.nextSearchElement = this.search.nextFront();
            while(!this.source.done() && !this.currentResult){
                this.stepThreads(this.source.nextFront());
                this.frontIndex++;
            }
            this.done = function(){
                return !this.currentResult && this.source.done();
            };
            this.front = function(){
                return this.currentResult;
            };
            this.popFront = function(){
                let found = false;
                this.currentResult = null;
                while(!this.source.done() && !found){
                    found = this.stepThreads(this.source.nextFront());
                    this.frontIndex++;
                }
            };
        }
    },
    stepThreads: function(element){
        let found = false;
        let deadThreads = 0;
        // Progress alive threads
        for(const thread of this.searchThreads){
            deadThreads += thread.alive ? 0 : 1;
            if(thread.alive && thread.consumeForward(element)){
                this.currentResult = thread.forwardResult(
                    this.source, this.frontIndex
                );
                found = true;
            }
        }
        // Spawn new threads
        if(this.compare(element, this.searchElement)){
            this.searchThreads.push(new hi.FindSequenceThread(
                this.compare, this.frontIndex, this.search.copy(),
                this.nextSearchElement, true
            ));
        }
        // Clean up old threads
        if(deadThreads > 64 && deadThreads >= this.searchThreads.length * 2){
            const newThreads = [];
            for(const thread of this.searchThreads){
                if(thread.alive) newThreads.push(thread);
            }
            this.searchThreads = newThreads;
        }
        // All done
        return found;
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        this.initialize();
        return !this.searchElement && this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.currentResult;
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        const copyThreads = [];
        for(const thread of this.searchThreads){
            if(thread.alive) copyThreads.push(thread.copy());
        }
        const copy = new hi.ForwardFindSequence(
            this.compare, this.source.copy(), this.search.copy(), copyThreads
        );
        copy.currentResult = this.currentResult;
        copy.searchElement = this.searchElement;
        copy.nextSearchElement = this.nextSearchElement;
        copy.frontIndex = this.frontIndex;
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        this.currentResult = null;
        this.searchThreads = [];
        delete this.done;
        delete this.front;
        delete this.popFront;
        return this;
    },
});

hi.BackwardFindSequence.prototype = Object.create(hi.Sequence.prototype);
Object.assign(hi.BackwardFindSequence.prototype, {
    reverse: function(){
        return new hi.ForwardFindSequence(
            this.compare, this.source, this.search
        );
    },
    initialize: function(){
        if(this.search.done()){
            // Search subject is empty
            this.done = () => true;
            this.front = () => undefined;
            this.popFront = () => {};
            return;
        }
        this.searchElement = this.search.nextBack();
        if(this.search.done()){
            // Search subject contains one element
            while(!this.source.done() && !this.currentResult){
                if(this.compare(this.source.nextBack(), this.searchElement)){
                    this.currentResult = new hi.FindSequenceResult(
                        this.source, this.backIndex - 1, this.backIndex
                    );
                }
                this.backIndex--;
            }
            this.done = function(){
                return !this.currentResult && this.source.done();
            };
            this.front = function(){
                return this.currentResult;
            };
            this.popFront = function(){
                this.currentResult = null;
                while(!this.currentResult && !this.source.done()){
                    if(this.compare(this.source.nextBack(), this.searchElement)){
                        this.currentResult = new hi.FindSequenceResult(
                            this.source, this.backIndex - 1, this.backIndex
                        );
                    }
                    this.backIndex--;
                }
            };
        }else{
            // Search subject contains more than one element
            this.nextSearchElement = this.search.nextBack();
            while(!this.source.done() && !this.currentResult){
                this.stepThreads(this.source.nextBack());
                this.backIndex--;
            }
            this.done = function(){
                return !this.currentResult && this.source.done();
            };
            this.front = function(){
                return this.currentResult;
            };
            this.popFront = function(){
                let found = false;
                this.currentResult = null;
                while(!this.source.done() && !found){
                    found = this.stepThreads(this.source.nextBack());
                    this.backIndex--;
                }
            };
        }
    },
    stepThreads: function(element){
        let found = false;
        let deadThreads = 0;
        // Progress alive threads
        for(const thread of this.searchThreads){
            deadThreads += thread.alive ? 0 : 1;
            if(thread.alive && thread.consumeBackward(element)){
                this.currentResult = thread.backwardResult(
                    this.source, this.backIndex
                );
                found = true;
            }
        }
        // Spawn new threads
        if(this.compare(element, this.searchElement)){
            this.searchThreads.push(new hi.FindSequenceThread(
                this.compare, this.backIndex, this.search.copy(),
                this.nextSearchElement, true
            ));
        }
        // Clean up old threads
        if(deadThreads > 64 && deadThreads >= this.searchThreads.length * 2){
            const newThreads = [];
            for(const thread of this.searchThreads){
                if(thread.alive) newThreads.push(thread);
            }
            this.searchThreads = newThreads;
        }
        // All done
        return found;
    },
    bounded: function(){
        return this.source.bounded();
    },
    done: function(){
        this.initialize();
        return !this.searchElement && this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.currentResult;
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: function(){
        const copyThreads = [];
        for(const thread of this.searchThreads){
            if(thread.alive) copyThreads.push(thread.copy());
        }
        const copy = new hi.ForwardFindSequence(
            this.compare, this.source.copy(), this.search.copy(), copyThreads
        );
        copy.currentResult = this.currentResult;
        copy.searchElement = this.searchElement;
        copy.nextSearchElement = this.nextSearchElement;
        copy.backIndex = this.backIndex;
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.frontIndex = 0;
        this.currentResult = null;
        this.searchThreads = [];
        delete this.done;
        delete this.front;
        delete this.popFront;
        return this;
    },
});

// Find all occurrences of a substring as judged by a comparison function.
// When no comparison function is given, (a, b) => (a == b) is used as a default.
hi.register("findAll", {
    functions: "?",
    sequences: 2,
}, function(compare, sequences){
    const source = sequences[0];
    const search = sequences[1];
    return new hi.ForwardFindSequence(
        compare || ((a, b) => a == b), source, search
    );
});
