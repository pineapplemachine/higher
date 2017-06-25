function isString(value){
    return value instanceof String || typeof value === "string";
}
function isArray(value){
    return value instanceof Array;
}
function isObject(value){
    return Object.prototype.toString.call(value) === "[object Object]";
}
function isFunction(value){
    return value instanceof Function;
}
function isIterable(value){
    return isFunction(value[Symbol.iterator]);
}
function isSequence(value){
    return isIterable(value) && (
        isFunction(value.front) &&
        isFunction(value.popFront) &&
        isFunction(value.nextFront) &&
        isFunction(value.consume) &&
        isFunction(value.done) &&
        isFunction(value.array) &&
        isFunction(value.object)
    );
}

const validateArguments = function(args, expected, callback){
    let error = false;
    let numbers = [];
    let functions = [];
    let sequences = [];
    let totalNumbers = 0;
    let totalFunctions = 0;
    let totalSequences = 0;
    let totalInvalid = 0;
    let expectedNumbers = expected.numbers || 0;
    let expectedFunctions = expected.functions || 0;
    let expectedSequences = expected.sequences || 0;
    let allowIterables = expected.allowIterables;
    for(let i = 0; i < args.length; i++){
        if(isFunction(args[i])){
            totalFunctions++;
            if(functions.length >= expectedFunctions){
                error = true;
            }else if(!error){
                functions.push(args[i]);
            }
        }else if(validAsSequence(args[i])){
            totalSequences++;
            if(sequences.length >= expectedSequences){
                error = true;
            }else if(!error){
                sequences.push(allowIterables ? args[i] : asSequence(args[i]));
            }
        }else if(!isNaN(args[i])){
            totalNumbers++;
            if(numbers.length >= expectedNumbers){
                error = true;
            }else if(!error){
                numbers.push(+args[i]);
            }
        }else{
            totalInvalid++;
            error = true;
        }
    }
    function compareExpected(total, expected, singular, plural){
        let found = () => total == 0 ? "none" : (
            `${total} ${total == 1 ? singular : plural}`
        );
        if(!isNaN(expected)){
            return total === expected ? null : (
                `Expected ${expected} ${expected == 1 ? singular : plural} ` +
                `but found ${found()}.`
            );
        }else if(expected === "+"){
            return total === n ? null : (
                `Expected at least one ${singular} but found ${found()}.`
            );
        }else if(expected === "*"){
            return null;
        }
    }
    if(error || (
        totalNumbers < expected.numbers ||
        totalFunctions < expected.functions ||
        totalSequences < expected.sequences
    )){
        let messages = [];
        let compareNumbers = compareExpected(
            totalNumbers, expectedNumbers, "number", "numbers"
        );
        if(compareNumbers) messages.push(compareNumbers);
        let compareFunctions = compareExpected(
            totalFunctions, expectedFunctions, "function", "functions"
        );
        if(compareFunctions) messages.push(compareFunctions);
        let compareSequences = compareExpected(
            totalSequences, expectedSequences, "sequence", "sequences"
        );
        if(compareSequences) messages.push(compareSequences);
        if(totalInvalid) messages.push(
            `Found ${totalInvalid} ${totalInvalid == 1 ? "argument" : "arguments"} ` +
            `that are invalid because they are of unrecognized types.`
        );
        throw messages.join(" ") || "Unknown error."
    }else{
        let args = [];
        if(totalNumbers) args.push(
            expected.numbers === 1 ? numbers[0] : numbers
        );
        if(totalFunctions) args.push(
            expected.functions === 1 ? functions[0] : functions
        );
        if(totalSequences) args.push(
            expected.sequences === 1 ? sequences[0] : sequences
        );
        return callback.apply(this, args);
    }
}

const validAsSequence = function(value){
    return isIterable(value) || isObject(value);
};

const asSequence = function(value){
    if(isSequence(value)){
        return value;
    }else if(isArray(value)){
        return arrayAsSequence(value);
    }else if(isString(value)){
        return stringAsSequence(value);
    }else if(isIterable(value)){
        return iterableAsSequence(value);
    }else if(isObject(value)){
        return objectAsSequence(value);
    }else{
        throw "Value is not valid as a sequence.";
    }
};
const indexableAsSequence = function(source, low, high){
    let lowIndex = isNaN(low) ? 0 : low;
    let highIndex = isNaN(high) ? source.length : high;
    return new Sequence({
        type: "indexable",
        lowIndex: lowIndex,
        highIndex: highIndex,
        frontIndex: lowIndex,
        backIndex: highIndex,
        source: source,
        bounded: () => true,
        done: function(){
            return this.frontIndex >= this.backIndex;
        },
        length: function(){
            return this.source.length;
        },
        left: function(){
            return this.backIndex - this.frontIndex;
        },
        front: function(){
            return this.source[this.frontIndex];
        },
        popFront: function(){
            this.frontIndex++;
        },
        back: function(){
            return this.source[this.backIndex - 1];
        },
        popBack: function(){
            this.backIndex--;
        },
        index: function(i){
            return this.source[i];
        },
        slice: null,
        copy: null,
        reset: function(){
            this.frontIndex = this.lowIndex;
            this.backIndex = this.highIndex;
            return this;
        },
    });
};
const arrayAsSequence = function(source, low, high){
    let sequence = indexableAsSequence(source, low, high);
    sequence.type = "array";
    sequence.slice = function(i, j){
        return arrayAsSequence(this.source, i, j);
    };
    sequence.copy = function(){
        return arrayAsSequence(
            this.source, this.frontIndex, this.backIndex
        );
    };
    return sequence;
};
const stringAsSequence = function(source, low, high){
    let sequence = indexableAsSequence(source, low, high);
    sequence.type = "string";
    sequence.slice = function(i, j){
        return stringAsSequence(this.source, i, j);
    };
    sequence.copy = function(){
        return stringAsSequence(
            this.source, this.frontIndex, this.backIndex
        );
    };
    return sequence;
};
const objectAsSequence = function(object, keys){
    return new Sequence({
        type: "object",
        keys: keys || Object.keys(object),
        frontIndex: 0,
        source: object,
        bounded: () => true,
        done: function(){
            return this.frontIndex >= this.length;
        },
        length: function(){
            return this.keys.length;
        },
        left: function(){
            return this.length - this.frontIndex;
        },
        front: function(){
            let key = this.keys[this.frontIndex];
            return {key: key, value: this.source[key]};
        },
        popFront: function(){
            return this.frontIndex++;
        },
        back: null,
        popBack: null,
        index: function(i){
            return {key: i, value: this.source[i]}; // Nonstandard! TODO: Kill?
        },
        slice: null,
        copy: function(){
            return objectAsSequence(this.source, this.keys);
        },
        reset: function(){
            this.frontIndex = 0;
            return this;
        },
    });
};
const iterableAsSequence = function(source){
    let sequence = iteratorAsSequence(source[Symbol.iterator]);
    sequence.type = "iterable";
    sequence.reset = function(){
        this.source = source[Symbol.iterator];
        this.item = this.source.next();
    };
    return sequence;
}
const iteratorAsSequence = function(source){
    let firstItem = source.next();
    return new Sequence({
        type: "iterator",
        item: firstItem,
        source: source,
        bounded: () => false,
        done: function(){
            return this.item.done;
        },
        length: null,
        left: null,
        front: function(){
            return this.item.value;
        },
        popFront: function(){
            this.item = this.source.next();
        },
        back: null,
        popBack: null,
        index: null,
        slice: null,
        copy: null,
        reset: null,
    });
};

const registerFunction = function(name, expected, raw){
    let fancy = function(){
        return validateArguments(arguments, expected, raw);
    };
    Sequence.prototype[name] = function(){
        Array.prototype.splice.call(arguments, 0, 0, this)
        return fancy.apply(this, arguments);
    };
    fancy.expected = expected;
    fancy.raw = raw;
    return fancy;
};

function sequenceBoundsError(action, method, type, intermediate = false){
    return (
        `Failed to ${action} the sequence because to do so would ` +
        `require fully consuming an unbounded "${type}" sequence` +
        (intermediate ? " in an intermediate step." : ". Try passing " +
        "a length limit to the ${method} method to only store the " +
        "first so many elements or, if you're sure the sequence will " +
        "eventually end, use the sequence's assumeBounded method " +
        "before collapsing it.")
    );
}

function Sequence(seed){
    for(key in seed){
        this[key] = seed[key];
    }
    return this;
}

Sequence.prototype[Symbol.iterator] = function(){
    return this;
};
Sequence.prototype.nextFront = function(){
    let value = this.front();
    this.popFront();
    return value;
};
Sequence.prototype.next = function(){
    let done = this.done();
    let value = done ? undefined : this.nextFront();
    return {value: value, done: done};
};
Sequence.prototype.consume = function(){
    while(!this.done()){
        this.popFront();
    }
    return this;
};
Sequence.prototype.array = function(limit = -1){
    if(limit < 0 && !this.bounded()){
        throw sequenceBoundsError("write", "array", this.type);
    }
    let result = [];
    while(!this.done()){
        if(limit >= 0 && result.length >= limit) break;
        result.push(this.nextFront());
    }
    return result;
};
Sequence.prototype.write = function(target, limit = -1){
    if(limit < 0 && !this.bounded()){
        throw sequenceBoundsError("write", "write", this.type);
    }
    let i = 0;
    while(!sequence.done()){
        if(limit >= 0 && i.length >= limit) break;
        let value = sequence.nextFront();
        if(i < target.length) target[i] = value;
        else target.push(value);
        i += 1;
    }
    if(i < target.length){
        target.splice(i);
    }
    return target;
};
Sequence.prototype.object = function(){
    let result = {};
    while(!this.done()){
        let pair = this.nextFront();
        if(isIterable(pair)){
            let first = pair.next();
            if(first.done) continue;
            let second = pair.next();
            if(second.done) result[first.value] = null;
            else result[first.value] = second.value;
        }else if(isObject(pair) && "key" in pair){
            result[pair.key] = pair.value;
        }else{
            result[pair] = null;
        }
    }
    return result;
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
        arraySequence.backIndex = i;
    }
    if(!breaks.length){
        write(this, limit, false);
    }else{
        for(let j = breaks.length - 1; j >= 0; j--){
            let breakIndex = breaks[i];
            let breaking = stack[breakIndex];
            let prev = stack[breakIndex + 1];
            let next = stack[breakIndex - 1];
            if(!prev.copy){
                throw (
                    `Collapsing the sequence failed because one of the ` +
                    `intermediate sequences of type "${prev.type}" does ` +
                    `not support copying even though it appears before a ` +
                    `special collapse behavior sequence "${breaking.type}".`
                );
            }
            write(prev.copy(), -1, true);
            breaking.collapseBreak(source, i);
            if(next) next.source = arraySequence;
        }
        if(breaks[0] < stack.length - 1){
            write(stack[0], limit, false);
        }
    }
    if(i < source.length){
        source.splice(i);
    }
    return source;
};
Sequence.prototype.nextBack = function(){
    let value = this.back();
    this.popBack();
    return value;
};
Sequence.prototype.assumeBounded = function(){
    this.bounded = () => true;
    return this;
};

// Create an error sequence.
const ErrorSequence = function(message){
    return new Sequence({
        type: "error",
        error: message || true,
        source: null,
        bounded: () => true,
        done: () => true,
        length: () => 0,
        left: () => 0,
        front: () => null,
        popFront: () => {},
        back: () => null,
        popBack: () => {},
        index: (i) => null,
        slice: function(i, j){
            return this;
        },
        copy: function(){
            return this;
        },
        reset: function(){
            return this;
        },
    });
};

const filter = registerFunction("filter", {
    functions: 1,
    sequences: 1,
}, function(predicate, source){
    while(!predicate(source.front())){
        source.popFront();
    }
    if(source.back) while(!predicate(source.back())){
        source.popBack();
    }
    return new Sequence({
        type: "filter",
        predicate: predicate,
        source: source,
        bounded: function(){
            return this.source.bounded();
        },
        done: function(){
            return this.source.done();
        },
        length: null,
        left: null,
        front: function(){
            return this.source.front();
        },
        popFront: function(){
            this.source.popFront();
            while(!this.source.done() && !this.predicate(this.source.front())){
                this.source.popFront();
            }
        },
        back: !source.back ? null : function(){
            return this.source.back();
        },
        popBack: !source.back ? null : function(){
            this.source.popBack();
            while(!this.source.done() && !this.predicate(this.source.back())){
                this.source.popBack();
            }
        },
        index: null,
        slice: null,
        copy: !source.copy ? null : function(){
            return filter.raw(this.predicate, this.source.copy());
        },
        reset: !source.rest ? null : function(){
            this.source.reset();
            return this;
        },
    });
});

const reverse = registerFunction("reverse", {
    sequences: 1,
}, function(source){
    if(source.type === "reverse") return source.source;
    if(!source.back) throw "TODO";
    return new Sequence({
        type: "reverse",
        source: source,
        bounded: function(){
            return this.source.bounded;
        },
        done: function(){
            return this.source.done();
        },
        length: !source.length ? null : function(){
            return this.source.length;
        },
        left: !source.left ? null : function(){
            return this.source.left;
        },
        front: function(){
            return this.source.back();
        },
        popFront: function(){
            return this.source.popBack();
        },
        back: function(){
            return this.source.front();
        },
        popBack: function(){
            return this.source.popFront();
        },
        index: !(source.index && source.length) ? null : function(i){
            return this.source.index(this.source.length - i - 1);
        },
        slice: !(source.slice && source.length) ? null : function(i, j){
            return reverse.raw(this.source.slice(
                this.source.length - j - 1,
                this.source.length - i - 1
            ));
        },
        copy: !source.copy ? null : function(){
            return reverse.raw(this.source.copy());
        },
        reset: !source.rest ? null : function(){
            this.source.reset();
            return this;
        },
        collapseBreak: function(target, length){
            let i = 0;
            let j = length;
            while(i < j){
                let t = target[i];
                target[i] = target[j - 1];
                target[j - 1] = t;
                i++;
                j--;
            }
        },
    });
});

const map = registerFunction("map", {
    functions: 1,
    sequences: "*",
}, function(transform, sources){
    if(sources.length === 1){
        return mapSingular(transform, sources[0]);
    }else if(sources.length === 0){
        return mapNull(transform);
    }else{
        return mapPlural(transform, sources);
    }
});
const mapNull = function(transform){
    return new Sequence({
        type: "map",
        transform: transform,
        sources: [],
        bounded: () => true,
        done: () => true,
        length: () => 0,
        left: () => 0,
        front: () => null,
        popFront: () => {},
        back: () => null,
        popBack: () => {},
        index: (i) => null,
        slice: function(i, j){
            return this;
        },
        copy: function(){
            return this;
        },
        reset: function(){
            return this;
        },
    });
};
const mapSingular = function(transform, source){
    return new Sequence({
        type: "map",
        transform: transform,
        source: source,
        sources: [source],
        bounded: function(){
            return this.source.bounded();
        },
        done: function(){
            return this.source.done();
        },
        length: !source.length ? null : function(){
            return this.source.length();
        },
        left: !source.left ? null : function(){
            return this.source.left();
        },
        front: function(){
            return this.transform(this.source.front());
        },
        popFront: function(){
            this.source.popFront();
        },
        back: !source.back ? null : function(){
            return this.transform(this.source.back());
        },
        popBack: !source.back ? null : function(){
            this.source.popBack();
        },
        index: !source.index ? null : function(i){
            return this.transform(this.source.index(i));
        },
        slice: !source.slice ? null : function(i, j){
            return mapSingular(this.transform, this.source.slice(i, j));
        },
        copy: !source.copy ? null : function(){
            return mapSingular(this.transform, this.source.copy());
        },
        reset: !source.rest ? null : function(){
            this.source.reset();
            return this;
        },
    });
};
const mapPlural = function(transform, sources){
    let hasLength = true;
    let hasLeft = true;
    let hasBack = true;
    let hasIndex = true;
    let hasSlice = true;
    let hasCopy = true;
    let hasReset = true;
    for(let source of sources){
        if(!source.length) hasLength = false;
        if(!source.left) hasLeft = false;
        if(!source.back) hasBack = false;
        if(!source.index) hasIndex = false;
        if(!source.slice) hasSlice = false;
        if(!source.copy) hasCopy = false;
        if(!source.reset) hasReset = false;
    }
    return new Sequence({
        type: "map",
        transform: transform,
        sources: sources,
        bounded: function(){
            for(let source of this.sources){
                if(!source.bounded()) return false;
            }
            return true;
        },
        done: function(){
            for(let source of this.sources){
                if(source.done()) return true;
            }
            return false;
        },
        length: !hasLength ? null : function(){
            let min = this.sources[0].length;
            for(let i = 1; i < this.sources.length; i++){
                min = Math.min(min, this.sources[i].length);
            }
            return min;
        },
        left: !hasLeft ? null : function(){
            let min = this.sources[0].left;
            for(let i = 1; i < this.sources.length; i++){
                min = Math.min(min, this.sources[i].left);
            }
            return min;
        },
        front: function(){
            let elements = [];
            for(let i = 0; i < this.sources.length; i++){
                elements[i] = this.sources[i].front();
            }
            return this.transform.apply(this, elements);
        },
        popFront: function(){
            for(let source of this.sources){
                source.popFront();
            }
        },
        back: !hasBack ? null : function(){
            let elements = [];
            for(let i = 0; i < this.sources.length; i++){
                elements[i] = this.sources[i].back();
            }
            return this.transform.apply(this, elements);
        },
        popBack: !hasBack ? null : function(){
            for(let source of this.sources){
                source.popBack();
            }
        },
        index: !hasIndex ? null : function(x){
            let elements = [];
            for(let i = 0; i < this.sources.length; i++){
                elements[i] = this.sources[i].index(x);
            }
            return this.transform.apply(this, elements);
        },
        slice: !hasSlice ? null : function(x, y){
            let slices = [];
            for(let i = 0; i < this.sources.length; i++){
                slices[i] = this.sources[i].slice(x, y);
            }
            return mapPlural(this.transform, slices);
        },
        copy: !hasCopy ? null : function(){
            let copies = [];
            for(let i = 0; i < this.sources.length; i++){
                copies[i] = this.sources[i].copy();
            }
            return mapPlural(this.transform, copies);
        },
        reset: !hasReset ? null : function(){
            for(let i = 0; i < this.sources.length; i++){
                this.sources[i].reset();
            }
            return this;
        },
    });
};

const zip = function(){
    let transform = function(){return Array.prototype.slice(arguments);};
    return map.raw(transform, arguments);
}

const tap = registerFunction("tap", {
    functions: 1,
    sequences: 1,
}, function(callback, source){
    return new Sequence({
        type: "map",
        frontValue: null,
        backValue: null,
        cachedFront: false,
        cachedBack: false,
        transform: transform,
        source: source,
        sources: [source],
        bounded: function(){
            return this.source.bounded();
        },
        done: function(){
            return this.source.done();
        },
        length: !source.length ? null : function(){
            return this.source.length();
        },
        left: !source.left ? null : function(){
            return this.source.left();
        },
        front: function(){
            this.frontValue = this.source.front();
            this.cachedFront = true;
            return this.frontValue;
        },
        popFront: function(){
            this.callback(this.cachedFront ? this.frontValue : this.source.front());
            this.source.popFront();
            this.cachedFront = false;
        },
        back: !source.back ? null : function(){
            this.backValue = this.source.back();
            this.cachedBack = true;
            return this.backValue;
        },
        popBack: !source.back ? null : function(){
            this.callback(this.cachedBack ? this.backValue : this.source.back());
            this.source.popBack();
            this.cachedBack = false;
        },
        index: !source.index ? null : function(i){
            return this.source.index(i);
        },
        slice: !source.slice ? null : function(i, j){
            return tap.raw(this.callback, this.source.slice(i, j));
        },
        copy: !source.copy ? null : function(){
            return tap.raw(this.callback, this.source.copy());
        },
        reset: !source.rest ? null : function(){
            this.source.reset();
            return this;
        },
    });
});

const each = registerFunction("each", {
    functions: 1,
    sequences: 1,
    // Don't waste time coercing non-sequence iterables to sequences
    allowIterables: true,
}, function(callback, source){
    for(let element of source){
        callback(element);
    }
    return source;
});

const ngrams = registerFunction("ngrams", {
    numbers: 1,
    sequences: 1,
}, function(size, source){
    size = Math.floor(size);
    if(size <= 0) throw "TODO";
    else if(size === 1) return source;
});
