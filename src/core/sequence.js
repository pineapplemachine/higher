import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {error} from "./error";
import {isArray} from "./types";
import {ArraySequence} from "./asSequence";

// Error thrown when an operation would involve fully consuming a potentially
// unbounded input sequence.
export const NotBoundedError = error({
    url: "", // TODO
    constructor: function NotBoundedError(source, options){
        this.source = source;
        this.options = options || {};
        const knownBounded = (isSequence(source) && source.unbounded() ?
            "known to be unbounded" : "not known to be bounded"
        );
        const sourceType = (isSequence(source) ?
            "a " + source.typeChainString() + " sequence" : "an iterable"
        );
        this.message = (
            `The action requires fully consuming ${sourceType} that is ` +
            `${knownBounded}. ` +
            "Try using a method such as 'head', 'limit', or 'assumeBounded' to " +
            "resolve this error."
        );
        if(this.options.limitArgument) this.message += " " + (
            "You could alternatively pass a single numeric argument indicating " +
            "the maximum number of elements of the sequence to consume."
        );
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
    enforce: function(source, options){
        if(
            (isSequence(source) && !source.bounded()) ||
            (!isArray(source) && !isString(source) && !isObject(source))
        ) throw NotBoundedError(source, options);
        return source;
    },
});

// Error thrown when a sequence operation or operations must be supported in
// order for an action to be valid, yet the requirement wasn't met.
export const OperationNotSupportedError = error({
    url: "", // TODO
    constructor: function OperationNotSupportedError(sequence, operations, options){
        this.sequence = sequence;
        this.operations = isString(operations) ? [operations] : operations;
        this.options = options || {};
        this.message = (
            `The action requires ${joinSeries(this.operations)} operations, ` +
            `but the ${sequence.typeChainString()} input sequence does not ` +
            `support all of them.`
        );
        if(options.message){
            this.message = options.message + ": " + this.message;
        }
    },
    enforce: function(sequence, operations, options){
        for(const operation of operations){
            if(!sequence[operation]) throw OperationNotSupportedError(
                sequence, operations, options
            );
        }
        return sequence;
    },
});

export const CollapseRootError = error({
    url: "", // TODO
    constructor: function CollapseRootError(sequence){
        this.sequence = sequence;
        this.message = (
            "Only sequences which have an array at their root may be " +
            `collapsed, but this is not true of the ${sequence.typeChainString()} ` +
            "input sequence. To acquire other sequences in-memory, try the " +
            "'array', 'write', 'string', and 'object' methods."
        );
    },
});

export const Sequence = function(){};

export const isSequence = (value) => {
    return value instanceof Sequence;
};

// Accepts a fancy function wrapper object returned by the wrap function.
// Attaches methods to the sequence prototype for method chaining.
Sequence.attach = function(fancy){
    if(fancy.method){
        for(const name of fancy.names){
            Sequence.prototype[name] = fancy.method;
            if(fancy.method.async){
                Sequence.prototype[name + "Async"] = fancy.method.async;
            }
        }
    }
    return fancy;
};

// Helper for creating a type which inherits the Sequence prototype.
Sequence.types = {};
Sequence.extend = function(methods){
    const constructor = methods.constructor;
    constructor.prototype = Object.create(Sequence.prototype);
    Object.assign(constructor.prototype, methods);
    Sequence.types[constructor.name] = constructor;
    return constructor;
};

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

Sequence.prototype.root = function(){
    let source = this;
    while(source && isSequence(source)){
        source = source.source;
    }
    return source;
};

// Here be dragons
Sequence.prototype.collapse = function(limit = -1){
    if(limit < 0 && !this.bounded()) throw NotBoundedError(this, {
        message: "Failed to collapse sequence",
        limitArgument: true,
    });
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
        throw CollapseRootError(source);
    }
    const arraySequence = stack[stack.length - 1];
    function write(seq, limit, intermediate){
        if(limit < 0 && !seq.bounded()) throw NotBoundedError(this, {
            message: "Failure handling intermediate sequence during collapse",
            limitArgument: true,
        });
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
                    if(!prev.copy) prev.forceEager();
                    write(prev.copy(), -1, true);
                }
            }else{
                i = source.length;
            }
            i = breaking.collapseBreak(source, i);
            if(next){
                // TODO: Better thrown error
                if(!next.rebase) throw OperationNotSupportedError(next, "rebase", {
                    message: "Failure handling intermediate sequence during collapse",
                });
                next.rebase(arraySequence);
                arraySequence.backIndex = i;
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
    return new constants.Promise((resolve, reject) => {
        callAsync(function(){
            resolve(this.collapse(limit));
        });
    });
};

// Turn a lazy sequence into an array-based one.
// Used internally by functions when a purely lazy implementation won't work
// because a sequence doesn't support the necessary operations.
// Not necessarily intended for external use.
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

// Get a string indicating the sequence type chain represented by sources.
Sequence.prototype.typeChainString = function(){
    if(this.sources){
        const sourceStrings = [];
        for(const source of this.sources){
            sourceStrings.push(source.typeChainString());
        }
        return `[${sourceStrings.join(", ")}].${this.constructor.name}`;
    }else if(this.source && isSequence(source)){
        return this.source.typeChainString() + "." + this.constructor.name;
    }else{
        return this.constructor.name;
    }
};

export default Sequence;
