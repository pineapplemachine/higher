const registeredFunctions = {};

const getPrototypeWrapperFunction = function(name, expected, implementation){
    if(expectSingularArgument(expected.sequences)){
        const numbers = expectArgumentCountType(expected.numbers);
        const functions = expectArgumentCountType(expected.functions);
        if(numbers === 0 && functions === 0){
            return function(){
                return implementation(this);
            };
        }else if(numbers === 0 || functions === 0){
            const validate = function(args){
                const found = countArgumentTypes(args);
                const error = compareExpectedArguments(
                    expected, found.numbers, found.functions,
                    1 + found.sequences, found.invalid
                );
                if(error) throw (
                    `Error validating arguments for function "${name}": ${error}`
                );
            };
            if(numbers === 1 || functions === 1){
                return function(){
                    validate(arguments);
                    return implementation(arguments[0], this);
                };
            }else{
                return function(){
                    validate(arguments);
                    return implementation(arguments, this);
                };
            }
        }
    }
    return function(){
        Array.prototype.splice.call(arguments, 0, 0, this)
        return validateArguments(expected, arguments, implementation, function(error){
            throw `Error validating arguments for function "${name}": ${error}`;
        });
    };
};

const getFancyWrapperFunction = function(name, expected, implementation){
    const numbers = expectArgumentCountType(expected.numbers);
    const functions = expectArgumentCountType(expected.functions);
    const sequences = expectArgumentCountType(expected.sequences);
    const validate = function(args){
        const found = countArgumentTypes(args);
        const error = compareExpectedArguments(
            expected, found.numbers, found.functions,
            found.sequences, found.invalid
        );
        if(error) throw (
            `Error validating arguments for function "${name}": ${error}`
        );
    };
    if(numbers + functions + sequences === 1){
        if(sequences === 1 && !expected.allowIterables){
            return function(){
                validate(arguments);
                return implementation(asSequence(arguments[0]));
            };
        }else{
            return function(){
                validate(arguments);
                return implementation(arguments[0]);
            };
        }
    }else if(
        (numbers + functions === 0) ||
        (functions + sequences === 0) ||
        (sequences + numbers === 0)
    ){
        if(sequences > 0 && !expected.allowIterables){
            return function(){
                validate(arguments);
                let sequences = [];
                for(let arg of arguments) sequences.push(asSequence(arg));
                return implementation(sequences);
            };
        }else{
            return function(){
                validate(arguments);
                return implementation(arguments);
            };
        }
    }
    return function(){
        return validateArguments(expected, arguments, implementation, function(error){
            throw `Error validating arguments for function "${name}": ${error}`;
        });
    };
};

const getAsyncWrapperFunction = function(callback){
    return function(){
        return new Promise((resolve, reject) => {
            let args = arguments;
            hi.callAsync(() => resolve(callback(this, args)));
        });
    };
};

const registerFunction = function(name, expected, func){
    let fancy = getFancyWrapperFunction(name, expected, func);
    let prototypeMethod = null;
    if(!expectNoArgument(expected.sequences)){
        prototypeMethod = getPrototypeWrapperFunction(name, expected, func);
        Sequence.prototype[name] = prototypeMethod;
    }
    fancy.implementation = func;
    fancy.prototypeMethod = prototypeMethod;
    registeredFunctions[name] = fancy;
    if(expected.async){
        const fasync = getAsyncWrapperFunction(function(caller, args){
            return fancy.apply(caller, args);
        });
        fancy.async = fasync;
        registeredFunctions[name + "Async"] = fasync;
        if(prototypeMethod){
            const pasync = getAsyncWrapperFunction(function(caller, args){
                return prototypeMethod.apply(caller, args);
            });
            prototypeMethod.async = pasync;
            Sequence.prototype[name + "Async"] = pasync;
        }
    }
    return fancy;
};

function sequenceBoundsError(action, method, type, intermediate = false){
    return (
        `Failed to ${action} the sequence because to do so would require ` +
        `fully consuming an unbounded ${type ? type + " " : ""}sequence` +
        (intermediate ? " in an intermediate step." : ". Try passing " +
        `a length limit to the "${method}" call to only store the ` +
        "first so many elements or, if you're sure the sequence will " +
        "eventually end, use the sequence's assumeBounded method " +
        "before collapsing it.")
    );
}
function sequenceCollapseCopyError(prevType, breakingType){
    return (
        `Collapsing the sequence failed because one of the ` +
        `intermediate sequences of type "${prevType}" does ` +
        `not support copying even though it appears before a ` +
        `special collapse behavior sequence "${breakingType}".`
    );
}

function Sequence(seed){
    for(key in seed){
        this[key] = seed[key];
    }
}

Sequence.prototype[Symbol.iterator] = function(){
    return this;
};
Sequence.prototype.next = function(){
    let done = this.done();
    let value = done ? undefined : this.nextFront();
    return {value: value, done: done};
};
Sequence.prototype.nextFront = function(){
    let value = this.front();
    this.popFront();
    return value;
};
Sequence.prototype.nextBack = function(){
    let value = this.back();
    this.popBack();
    return value;
};
Sequence.prototype.maskAbsentMethods = function(source){
    if(!source.back){
        this.back = null;
        this.popBack = null;
        this.nextBack = null;
    }
    if(!source.length) this.length = null;
    if(!source.left) this.left = null;
    if(!source.index) this.index = null;
    if(!source.slice) this.slice = null;
    if(!source.has) this.has = null;
    if(!source.get) this.get = null;
    if(!source.copy) this.copy = null;
    if(!source.reset) this.reset = null;
};
Sequence.prototype.collapse = function(limit = -1){
    if(limit < 0 && !this.bounded()){
        throw sequenceBoundsError("collapse", "collapse", this.type);
    }
    let source = this;
    let stack = [];
    let breaks = [];
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
    let arraySequence = stack[stack.length - 1];
    function write(seq, limit, intermediate){
        if(limit < 0 && !seq.bounded()) throw sequenceBoundsError(
            "collapse", "collapse", seq.type, intermediate
        );
        i = 0;
        while(!seq.done()){
            let value = seq.nextFront();
            if(i < source.length) source[i] = value;
            else source.push(value);
            i++;
        }
    }
    if(!breaks.length){
        write(this, limit, false);
    }else{
        for(let j = breaks.length - 1; j >= 0; j--){
            let breakIndex = breaks[j];
            let breaking = stack[breakIndex];
            let prev = stack[breakIndex + 1];
            let next = stack[breakIndex - 1];
            if(prev){
                if(!prev.collapseBreak){
                    if(!prev.copy) throw breakCollapseCopyError(
                        prev.type, breaking.type
                    );
                    write(prev.copy(), -1, true);
                }
            }else{
                i = source.length;
            }
            i = breaking.collapseBreak(source, i);
            if(next){
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
    return new Promise((resolve, reject) => {
        hi.callAsync(function(){
            resolve(this.collapse(limit));
        });
    });
};
