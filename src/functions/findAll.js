import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const FindSequenceResult = function(source, low, high){
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
FindSequenceResult.prototype.constructor = FindSequenceResult;
Object.assign(FindSequenceResult.prototype, {
    slice: function(){
        return this.source.nativeSlice(this.low, this.high);
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

// A find sequences uses a list of threads to find substring occurrences.
// Forward-searching sequences use this constructor.
export const ForwardFindSequenceThread = function(
    compare, index, search, searchElement, alive
){
    this.compare = compare;
    this.index = index;
    this.search = search;
    this.searchElement = searchElement;
    this.alive = alive;
};

// A find sequences uses a list of threads to find substring occurrences.
// Backward-searching sequences use this constructor.
export const BackwardFindSequenceThread = function(
    compare, index, search, searchElement, alive
){
    this.compare = compare;
    this.index = index;
    this.search = search;
    this.searchElement = searchElement;
    this.alive = alive;
};

ForwardFindSequenceThread.prototype.constructor = ForwardFindSequenceThread;
Object.assign(ForwardFindSequenceThread.prototype, {
    consume: function(element){
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
    result: function(source, index){
        const low = this.index;
        const high = index + 1;
        return new FindSequenceResult(source, low, high);
    },
    copy: function(){
        return new ForwardFindSequenceThread(
            this.compare, this.index, this.search.copy(),
            this.searchElement, this.alive
        );
    },
});

BackwardFindSequenceThread.prototype.constructor = BackwardFindSequenceThread;
Object.assign(BackwardFindSequenceThread.prototype, {
    consume: function(element){
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
    result: function(source, index){
        const low = index - 1;
        const high = this.index;
        return new FindSequenceResult(source, low, high);
    },
    copy: function(){
        return new BackwardFindSequenceThread(
            this.compare, this.index, this.search.copy(),
            this.searchElement, this.alive
        );
    },
});

export const stepFindThreads = function(element){
    let result = undefined;
    let deadThreads = 0;
    // Progress alive threads
    for(const thread of this.searchThreads){
        deadThreads += thread.alive ? 0 : 1;
        if(thread.alive && thread.consume(element)){
            result = thread.result(this.source, this.index);
        }
    }
    // Spawn new threads
    if(this.compare(element, this.searchElement)){
        this.searchThreads.push(new this.threadType(
            this.compare, this.index, this.search.copy(),
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
    return result;
};

export const ForwardFindSequence = defineSequence({
    constructor: function ForwardFindSequence(
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
        this.searchThreads = searchThreads || [];
        this.index = 0;
        if(!source.copy) this.copy = null;
        if(!source.reset) this.reset = null;
        if(!source.back || !search.back || !source.length) this.reverse = function(){
            // TODO: Fall back on eager eval where possible
            throw "Failed to reverse find sequence: An input is unidirectional.";
        };
    },
    threadType: ForwardFindSequenceThread,
    stepThreads: stepFindThreads,
    reverse: function(){
        return new BackwardFindSequence(
            this.compare, this.source, this.search
        );
    },
    initialize: function(){
        if(this.search.done() || this.search.unbounded()){
            // Search subject is empty or unbounded
            this.done = () => true;
            this.front = () => undefined;
            this.popFront = () => {};
            return;
        }
        // TODO: Handle case where search length is known to be at least source length
        this.searchElement = this.search.nextFront();
        if(this.search.done()){
            // Search subject contains one element
            while(!this.source.done() && !this.currentResult){
                if(this.compare(this.source.nextFront(), this.searchElement)){
                    this.currentResult = new FindSequenceResult(
                        this.source, this.index, this.index + 1
                    );
                }
                this.index++;
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
                        this.currentResult = new FindSequenceResult(
                            this.source, this.index, this.index + 1
                        );
                    }
                    this.index++;
                }
            };
        }else{
            // Search subject contains more than one element
            this.nextSearchElement = this.search.nextFront();
            while(!this.source.done() && !this.currentResult){
                this.currentResult = this.stepThreads(this.source.nextFront());
                this.index++;
            }
            this.done = function(){
                return !this.currentResult && this.source.done();
            };
            this.front = function(){
                return this.currentResult;
            };
            this.popFront = function(){
                this.currentResult = null;
                while(!this.source.done() && !this.currentResult){
                    this.currentResult = this.stepThreads(this.source.nextFront());
                    this.index++;
                }
            };
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
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
        const copy = new ForwardFindSequence(
            this.compare, this.source.copy(), this.search.copy(), copyThreads
        );
        copy.currentResult = this.currentResult;
        copy.searchElement = this.searchElement;
        copy.nextSearchElement = this.nextSearchElement;
        copy.index = this.index;
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.index = 0;
        this.currentResult = null;
        this.searchThreads = [];
        delete this.done;
        delete this.front;
        delete this.popFront;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const BackwardFindSequence = defineSequence({
    constructor: function BackwardFindSequence(
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
        this.searchThreads = searchThreads || [];
        this.index = source.nativeLength();
        if(!source.copy) this.copy = null;
        if(!source.reset) this.reset = null;
    },
    threadType: BackwardFindSequenceThread,
    stepThreads: stepFindThreads,
    reverse: function(){
        return new ForwardFindSequence(
            this.compare, this.source, this.search
        );
    },
    initialize: function(){
        if(this.search.done() || this.search.unbounded()){
            // Search subject is empty or unbounded
            this.done = () => true;
            this.front = () => undefined;
            this.popFront = () => {};
            return;
        }
        // TODO: Handle case where search length is known to be at least source length
        this.searchElement = this.search.nextBack();
        if(this.search.done()){
            // Search subject contains one element
            while(!this.source.done() && !this.currentResult){
                if(this.compare(this.source.nextBack(), this.searchElement)){
                    this.currentResult = new FindSequenceResult(
                        this.source, this.index - 1, this.index
                    );
                }
                this.index--;
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
                        this.currentResult = new FindSequenceResult(
                            this.source, this.index - 1, this.index
                        );
                    }
                    this.index--;
                }
            };
        }else{
            // Search subject contains more than one element
            this.nextSearchElement = this.search.nextBack();
            while(!this.source.done() && !this.currentResult){
                this.currentResult = this.stepThreads(this.source.nextBack());
                this.index--;
            }
            this.done = function(){
                return !this.currentResult && this.source.done();
            };
            this.front = function(){
                return this.currentResult;
            };
            this.popFront = function(){
                this.currentResult = null;
                while(!this.source.done() && !this.currentResult){
                    this.currentResult = this.stepThreads(this.source.nextBack());
                    this.index--;
                }
            };
        }
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
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
        const copy = new ForwardFindSequence(
            this.compare, this.source.copy(), this.search.copy(), copyThreads
        );
        copy.currentResult = this.currentResult;
        copy.searchElement = this.searchElement;
        copy.nextSearchElement = this.nextSearchElement;
        copy.index = this.index;
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        return copy;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Find all occurrences of a substring as judged by a comparison function.
export const findAll = wrap({
    name: "findAll",
    attachSequence: true,
    async: false,
    sequences: [
        ForwardFindSequence,
        BackwardFindSequence
    ],
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2
        }
    },
    implementation: (compare, sequences) => {
        const source = sequences[0];
        const search = sequences[1];
        return new ForwardFindSequence(
            compare || ((a, b) => a === b), source, search
        );
    },
});

export default findAll;
