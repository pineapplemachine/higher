import {lightWrap} from "./lightWrap";
import {isNumber} from "./types";

import {BoundsUnknownError} from "../errors/BoundsUnknownError";
import {NotBoundedError} from "../errors/NotBoundedError";

export const isSequence = lightWrap({
    summary: "Determine whether a value is some @Sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function accepts one argument of any kind.
        `),
        returns: (`
            The function returns true when the input was a @Sequence and false
            otherwise.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "asSequence", "validAsSequence",
        ],
    },
    implementation: function isSequence(value){
        return value instanceof Sequence;
    },
    tests: {
        "basicUsage": hi => {
            const seq = hi.range(10);
            hi.assert(hi.isSequence(seq));
            const array = [1, 2, 3, 4];
            hi.assertNot(hi.isSequence(array));
        },
    },
});

export const attachSequenceMethods = lightWrap({
    summary: "Attach a method from a wrapped function to the @Sequence prototype.",
    internal: true,
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a wrapped function as produced by a call to
            @wrap.
        `),
        returns: (`
            The function returns its input.
        `),
    },
    implementation: function attachSequenceMethods(wrapped){
        if(wrapped.method){
            for(const name of wrapped.names){
                Sequence.prototype[name] = wrapped.method;
                if(wrapped.method.async){
                    Sequence.prototype[name + "Async"] = wrapped.method.async;
                }
            }
        }
        return wrapped;
    },
});

export const Sequence = function(){};

// Make all sequences iterables
Sequence.prototype[Symbol.iterator] = function(){
    return this;
};
// Make all sequences iterators
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

Sequence.prototype.cacheUntilIndex = function(i){
    if(i <= 0){
        return undefined;
    }else if(!this.elementCache){
        this.elementCache = [];
        this.elementCacheFrontIndex = 0;
    }else if(this.done() || this.elementCache.length >= i){
        return this.elementCache;
    }
    while(!this.nativeDone()){
        this.elementCache.push(this.nativeFront());
        this.nativePopFront();
        if(this.elementCache.length >= i) break;
    }
    this.elementCacheBackIndex = this.elementCache.length;
    this.done = function(){
        return (
            this.elementCacheFrontIndex >= this.elementCacheBackIndex &&
            this.nativeDone()
        );
    };
    this.front = function(){
        if(this.elementCacheFrontIndex < this.elementCache.length){
            return this.elementCache[this.elementCacheFrontIndex];
        }else{
            return this.nativeFront();
        }
    };
    this.popFront = function(){
        this.elementCacheFrontIndex++;
        if(this.elementCacheFrontIndex >= this.elementCache.length){
            return this.nativePopFront();
        }
    };
    if(this.back){
        this.back = function(){
            if(this.nativeDone()){
                return this.elementCache[this.elementCacheBackIndex - 1];
            }else{
                return this.nativeBack();
            }
        };
        this.popBack = function(){
            if(this.nativeDone()){
                this.elementCacheBackIndex--;
            }else{
                return this.nativePopBack();
            }
        };
    }
    if(this.copy){
        const copyMethod = function(){
            const copy = this.nativeCopy();
            copy.elementCache = this.elementCache.slice();
            copy.elementCacheFrontIndex = this.elementCacheFrontIndex;
            copy.elementCacheBackIndex = this.elementCacheBackIndex;
            copy.done = this.done;
            copy.front = this.front;
            copy.popFront = this.popFront;
            copy.back = this.back;
            copy.popBack = this.popBack;
            copy.copy = copyMethod;
            return copy;
        };
        this.copy = copyMethod;
    }
    return this.elementCache;
};

// TODO: Stop using this
// https://github.com/pineapplemachine/higher/issues/53
Sequence.prototype.maskAbsentMethods = function(source){
    if(!source.back){
        this.back = undefined;
        this.popBack = undefined;
        this.nextBack = undefined;
    }
    if(this.length && !source.nativeLength){
        this.nativeLength = undefined;
    }
    if(this.index && !source.nativeIndex){
        this.nativeIndex = undefined;
    }
    if(this.slice && !source.nativeSlice){
        this.nativeSlice = undefined;
    }
    if(this.has && !source.has) this.has = undefined;
    if(this.get && !source.get) this.get = undefined;
    if(this.copy && !source.copy) this.copy = undefined;
};

// Get the root of a sequence.
Sequence.prototype.root = function(){
    let source = this;
    while(source && isSequence(source)){
        source = source.source;
    }
    return source;
};

// Get a string indicating the sequence type chain represented by sources.
// TODO: This probably doesn't need to be in the prototype, honestly
Sequence.prototype.typeChainString = function(){
    if(this.sources){
        const sourceStrings = [];
        for(const source of this.sources){
            sourceStrings.push(source.typeChainString());
        }
        return `[${sourceStrings.join(", ")}].${this.constructor.name}`;
    }else if(this.source && isSequence(this.source)){
        return this.source.typeChainString() + "." + this.constructor.name;
    }else{
        return this.constructor.name;
    }
};

export const nativeMethodNameMap = {
    "done": "nativeDone",
    "front": "nativeFront",
    "popFront": "nativePopFront",
    "back": "nativeBack",
    "popBack": "nativePopBack",
    "copy": "nativeCopy",
    "length": "nativeLength",
    "index": "nativeIndex",
    "indexNegative": "nativeIndexNegative",
    "slice": "nativeSlice",
    "sliceNegative": "nativeSliceNegative",
    "sliceMixed": "nativeSliceMixed",
};

export const appliedSequenceSupportsMethod = function(
    methodName, sequenceType, sourceTypes
){
    const nativeMethodName = nativeMethodNameMap[methodName];
    const supportedMethod = sequenceType[nativeMethodName];
    for(const supportsAlways of sequenceType.supportsAlways){
        if(methodName === supportsAlways) return supportedMethod;
    }
    const supportsWith = sequenceType.supportsWith[methodName];
    if(supportsWith === "any"){
        const nativeMethodName = nativeMethodNameMap[methodName];
        for(const sourceType of sourceTypes){
            if(sourceType[nativeMethodName]) return supportedMethod;
        }
        return undefined;
    }else if(supportsWith === "all"){
        const nativeMethodName = nativeMethodNameMap[methodName];
        for(const sourceType of sourceTypes){
            if(!sourceType[nativeMethodName]) return undefined;
        }
        return supportedMethod;
    }else if(supportsWith && supportsWith instanceof Array){
        for(const withMethodName of supportsWith){
            const withNativeMethodName = nativeMethodNameMap[withMethodName];
            for(const sourceType of sourceTypes){
                if(!sourceType[withNativeMethodName]) return undefined;
            }
        }
        return supportedMethod;
    }else if(supportsWith && typeof(supportsWith) !== "string"){
        for(const withMethodName in supportsWith){
            const withNativeMethodName = nativeMethodNameMap[withMethodName];
            if(supportsWith[withMethodName] === "any"){
                for(const sourceType of sourceTypes){
                    if(sourceType[withNativeMethodName]) return supportedMethod;
                }
                return undefined;
            }else if(supportsWith[withMethodName] === "all"){
                for(const sourceType of sourceTypes){
                    if(!sourceType[withNativeMethodName]) return undefined;
                }
                return supportedMethod;
            }else{
                return undefined;
            }
        }
        return supportedMethod;
    }else{
        return undefined;
    }
};

export const appliedSequenceSupports = function(sequenceType, sourceTypes){
    return {
        nativeDone: sequenceType.nativeDone,
        nativeFront: sequenceType.nativeFront,
        nativePopFront: sequenceType.nativePopFront,
        nativeCopy: appliedSequenceSupportsMethod("copy", sequenceType, sourceTypes),
        nativeLength: appliedSequenceSupportsMethod("length", sequenceType, sourceTypes),
        nativeIndex: appliedSequenceSupportsMethod("index", sequenceType, sourceTypes),
        nativeIndexNegative: appliedSequenceSupportsMethod("indexNegative", sequenceType, sourceTypes),
        nativeSlice: appliedSequenceSupportsMethod("slice", sequenceType, sourceTypes),
        nativeSliceNegative: appliedSequenceSupportsMethod("sliceNegative", sequenceType, sourceTypes),
        nativeSliceMixed: appliedSequenceSupportsMethod("sliceMixed", sequenceType, sourceTypes),
        nativeBack: appliedSequenceSupportsMethod("back", sequenceType, sourceTypes),
        nativePopBack: (
            appliedSequenceSupportsMethod("back", sequenceType, sourceTypes) &&
            sequenceType.nativePopBack
        ),
    };
};

export default Sequence;
