import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {normalizeExpecting} from "./expecting";
import {lightWrap} from "./lightWrap";
import {Sequence} from "./sequence";
import {isArray, isNumber} from "./types";
import {getWrappedFunction, getWrappedFunctionAsync} from "./wrapFunction";

import {ArgumentsError} from "../errors/ArgumentsError";
import {NotBoundedError} from "../errors/NotBoundedError";

import {cleanDocs} from "../docs/cleanString";

export const sequenceTypes = {};

export const defineSequence = lightWrap({
    summary: "Extend the @Sequence prototype.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineSequence(attributes){
        const constructor = attributes.constructor;
        attributes.overrides = attributes.overrides || [];
        constructor.prototype = Object.create(Sequence.prototype);
        for(const attributeName in attributes){
            const attribute = attributes[attributeName];
            if(attributeName === "done"){
                constructor.prototype.nativeDone = attribute;
                constructor.prototype.done = attribute;
            }else if(attributeName === "length"){
                constructor.prototype.nativeLength = attribute;
                constructor.prototype.length = attribute;
            }else if(attributeName === "front"){
                constructor.prototype.nativeFront = attribute;
                constructor.prototype.front = attribute;
            }else if(attributeName === "popFront"){
                constructor.prototype.nativePopFront = attribute;
                constructor.prototype.popFront = attribute;
            }else if(attributeName === "back"){
                constructor.prototype.nativeBack = attribute;
                constructor.prototype.back = attribute;
            }else if(attributeName === "popBack"){
                constructor.prototype.nativePopBack = attribute;
                constructor.prototype.popBack = attribute;
            }else if(attributeName === "index"){
                constructor.prototype.nativeIndex = attribute;
                constructor.prototype.index = attribute;
            }else if(attributeName === "slice"){
                constructor.prototype.nativeSlice = attribute;
            }else if(attributeName === "copy"){
                constructor.prototype.nativeCopy = attribute;
                constructor.prototype.copy = attribute;
            }else if(attributeName === "overrides"){
                constructor.prototype.overrides = attribute;
                constructor.overrides = attribute;
            }else if(
                attributeName === "docs" ||
                attributeName === "tests" ||
                attributeName === "getSequence" ||
                attributeName === "supportRequired" ||
                attributeName === "supportsWith" ||
                attributeName === "supportsAlways"
            ){
                constructor[attributeName] = attribute;
            }else{
                constructor.prototype[attributeName] = attribute;
            }
        }
        addStandardSequenceInterface(constructor);
        wrapSequenceOverrides(constructor, attributes.overrides);
        constructor.test = sequenceTestRunner(constructor);
        sequenceTypes[constructor.name] = constructor;
        return constructor;
    },
});

const addIndexPatch = function(i){
    this.indexPatchArray = [];
    while(this.indexPatchArray.length < i && !this.nativeDone()){
        this.indexPatchArray.push(this.nativeFront());
        this.nativePopFront();
    }
    this.indexPatchFrontIndex = 0;
    this.indexPatchBackIndex = this.indexPatchArray.length;
    this.done = function(){
        return (
            this.indexPatchFrontIndex >= this.indexPatchBackIndex &&
            this.nativeDone()
        );
    };
    this.front = function(){
        if(this.indexPatchFrontIndex < this.indexPatchArray.length){
            return this.indexPatchArray(this.indexPatchFrontIndex);
        }else{
            return this.nativeFront();
        }
    };
    this.popFront = function(){
        this.indexPatchFrontIndex++;
        if(this.indexPatchFrontIndex >= this.indexPatchArray.length){
            return this.nativePopFront();
        }
    };
    if(this.back){
        this.back = function(){
            if(this.nativeDone()){
                return this.indexPatchArray[this.indexPatchBackIndex - 1];
            }else{
                return this.nativeBack();
            }
        };
        this.popBack = function(){
            if(this.nativeDone()){
                this.indexPatchBackIndex--;
            }else{
                return this.nativePopBack();
            }
        };
    }
    if(this.copy){
        const copyMethod = function(){
            const copy = this.nativeCopy();
            copy.indexPatchArray = this.indexPatchArray.slice();
            copy.indexPatchFrontIndex = this.indexPatchFrontIndex;
            copy.indexPatchBackIndex = this.indexPatchBackIndex;
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
};

const adjustIndex = (sequence, index) => {
    if(process.env.NODE_ENV === "development"){
        if(!isNumber(index) || !isFinite(index)){
            throw ArgumentsError({message: "Index must be a finite number."});
        }
        if(index < 0 && !sequence.bounded()){
            throw NotBoundedError(sequence, {message: (
                "Negative indexes are not allowed for sequences not " +
                "known to be bounded."
            )});
        }
    }
    return index >= 0 ? index : sequence.length() - index - 1;
};

const sequenceLengthPatch = function(){
    if(!this.bounded()){
        throw NotBoundedError(this, {
            message: "Failed to determine sequence length",
        });
    }
    if(!this.indexPatchArray){
        addIndexPatch.call(this, Infinity);
    }
    while(!this.nativeDone()){
        this.indexPatchArray.push(this.nativeFront());
        this.nativePopFront();
        this.indexPatchBackIndex++;
    }
    return this.indexPatchArray.length;
};

const sequenceIndexWrapper = function(i){
    return this.nativeIndex(adjustIndex(this, i));
};

const sequenceIndexPatch = function(i){
    const index = adjustIndex(this, i);
    if(!this.indexPatchArray){
        addIndexPatch.call(this, index);
    }
    while(this.indexPatchArray.length <= index && !this.nativeDone()){
        this.indexPatchArray.push(this.nativeFront());
        this.nativePopFront();
        this.indexPatchBackIndex++;
    }
    return this.indexPatchArray[index];
};

const sequenceSliceWrapper = function(i, j){
    if(j === undefined){
        if(i === undefined) return this.copy();
        return this.nativeSlice(0, adjustIndex(this, i));
    }else{
        return this.nativeSlice(
            adjustIndex(this, i), adjustIndex(this, j)
        );
    }
};

const sequenceSlicePatch = function(i, j){
    let low, high;
    if(j === undefined){
        if(i === undefined) return this.copy();
        low = 0;
        high = adjustIndex(i);
    }else{
        low = adjustIndex(i);
        high = adjustIndex(j);
    }
    if(low >= high){
        return new EmptySequence();
    }
    if(!this.indexPatchArray){
        addIndexPatch.call(this, high);
    }
    while(this.indexPatchArray.length <= high && !this.nativeDone()){
        this.indexPatchArray.push(this.nativeFront());
        this.nativePopFront();
        this.indexPatchBackIndex++;
    }
    return new ArraySequence(
        this.indexPatchArray, low, high
    );
};

const addStandardSequenceInterface = (sequence) => {
    sequence.prototype.length = (
        sequence.prototype.length || sequenceLengthPatch
    );
    sequence.prototype.index = (sequence.prototype.nativeIndex ?
        sequenceIndexWrapper : sequenceIndexPatch
    );
    sequence.prototype.slice = (sequence.prototype.nativeSlice ?
        sequenceSliceWrapper : sequenceSlicePatch
    );
    sequence.prototype.lengthAsync = function(){
        return new constants.Promise((resolve, reject) => {
            callAsync(() => resolve(this.length()))
        });
    };
    sequence.prototype.indexAsync = function(i){
        return new constants.Promise((resolve, reject) => {
            callAsync(() => resolve(this.index(i)))
        });
    };
    sequence.prototype.sliceAsync = function(i, j){
        return new constants.Promise((resolve, reject) => {
            callAsync(() => resolve(this.slice(i, j)))
        });
    };
};

const wrapSequenceOverrides = (sequence, overrides) => {
    // TODO: Remove isArray check after all override attributes are updated
    if(overrides && !isArray(overrides)){
        for(const override in overrides){
            sequence.prototype[override] = getWrappedFunction({
                arguments: normalizeExpecting(overrides[override]),
                implementation: sequence.prototype[override]
            }, true);
            if(overrides[override].async){
                sequence.prototype[override + "Async"] = getWrappedFunctionAsync(
                    sequence.prototype[override]
                );
            }
        }
    }else{
        sequence.prototype.overrides = {};
    }
};

export const sequenceTestRunner = (sequence) => {
    if(process.env.NODE_ENV !== "development") return undefined;
    if(!sequence.getSequence && !sequence.tests) return undefined;
    return hi => {
        const result = {
            pass: [],
            fail: [],
        }
        if(sequence.getSequence) for(const sequenceGetter of sequence.getSequence){
            for(const contractName in hi.contract){
                const contract = hi.contract[contractName];
                let success = true;
                try{
                    contract.enforce(() => sequenceGetter(hi));
                }catch(error){
                    success = false;
                    result.fail.push({
                        name: `${sequence.name}.contract.${contractName}`,
                        sequence: sequence,
                        contract: contract,
                        sequenceGetter: sequenceGetter,
                        error: error
                    });
                }
                if(success){
                    result.pass.push({
                        name: `${sequence.name}.contract.${contractName}`,
                        sequence: sequence,
                        contract: contract,
                    });
                }
            }
        }
        if(sequence.tests) for(const testName in sequence.tests){
            const test = sequence.tests[testName];
            let success = true;
            try{
                test(hi);
            }catch(error){
                success = false;
                result.fail.push({
                    name: `${sequence.name}.test.${testName}`,
                    sequence: sequence,
                    test: test,
                    error: error,
                });
            }
            if(success){
                result.pass.push({
                    name: `${sequence.name}.test.${testName}`,
                    sequence: sequence,
                    test: test,
                });
            }
        }
        return result;
    };
};

