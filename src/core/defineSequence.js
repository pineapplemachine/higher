import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {normalizeExpecting} from "./expecting";
import {lightWrap} from "./lightWrap";
import {Sequence} from "./sequence";
import {appliedSequenceSupports} from "./sequence";
import {isArray, isNumber} from "./types";
import {getWrappedFunction, getWrappedFunctionAsync} from "./wrapFunction";

import {ArgumentsError} from "../errors/ArgumentsError";
import {NotBoundedError} from "../errors/NotBoundedError";

import {cleanDocs, cleanString} from "../docs/cleanString";

export const sequenceTypes = {};

// TODO: Thoroughly document sequence type creation somewhere
export const defineSequence = lightWrap({
    summary: "Extend the @Sequence prototype.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineSequence(attributes){
        const constructor = attributes.constructor;
        attributes.overrides = attributes.overrides || [];
        constructor.prototype = Object.create(Sequence.prototype);
        constructor.definedAttributes = attributes;
        constructor.appliedTo = function(sourceTypes){
            return appliedSequenceSupports(constructor,
                isArray(sourceTypes) ? sourceTypes : [sourceTypes]
            );
        };
        for(const attributeName in attributes){
            const attribute = attributes[attributeName];
            if(attributeName === "done"){
                constructor.nativeDone = attribute;
                constructor.prototype.nativeDone = attribute;
                constructor.prototype.done = attribute;
            }else if(attributeName === "length"){
                constructor.nativeLength = attribute;
                constructor.prototype.nativeLength = attribute;
                constructor.prototype.length = attribute;
            }else if(attributeName === "front"){
                constructor.nativeFront = attribute;
                constructor.prototype.nativeFront = attribute;
                constructor.prototype.front = attribute;
            }else if(attributeName === "popFront"){
                constructor.nativePopFront = attribute;
                constructor.prototype.nativePopFront = attribute;
                constructor.prototype.popFront = attribute;
            }else if(attributeName === "back"){
                constructor.nativeBack = attribute;
                constructor.prototype.nativeBack = attribute;
                constructor.prototype.back = attribute;
            }else if(attributeName === "popBack"){
                constructor.nativePopBack = attribute;
                constructor.prototype.nativePopBack = attribute;
                constructor.prototype.popBack = attribute;
            }else if(attributeName === "index"){
                constructor.nativeIndex = attribute;
                constructor.prototype.nativeIndex = attribute;
            }else if(attributeName === "indexNegative"){
                constructor.nativeIndexNegative = attribute;
                constructor.prototype.nativeIndexNegative = attribute;
            }else if(attributeName === "slice"){
                constructor.nativeSlice = attribute;
                constructor.prototype.nativeSlice = attribute;
            }else if(attributeName === "sliceNegative"){
                constructor.nativeSliceNegative = attribute;
                constructor.prototype.nativeSliceNegative = attribute;
            }else if(attributeName === "sliceMixed"){
                constructor.nativeSliceMixed = attribute;
                constructor.prototype.nativeSliceMixed = attribute;
            }else if(attributeName === "has"){
                constructor.nativeHas = attribute;
                constructor.prototype.nativeHas = attribute;
                constructor.prototype.has = attribute;
            }else if(attributeName === "get"){
                constructor.nativeGet = attribute;
                constructor.prototype.nativeGet = attribute;
                constructor.prototype.get = attribute;
            }else if(attributeName === "copy"){
                constructor.nativeCopy = attribute;
                constructor.prototype.nativeCopy = attribute;
                constructor.prototype.copy = attribute;
            }else if(attributeName === "overrides"){
                constructor.prototype.overrides = attribute;
                constructor.overrides = attribute;
            }else if(
                attributeName === "supportRequired" ||
                attributeName === "supportsWith"
            ){
                if(isArray(attribute)){
                    const obj = {};
                    for(const methodName of attribute) obj[methodName] = "any";
                    constructor[attributeName] = obj;
                }else{
                    constructor[attributeName] = attribute;
                }
            }else if(
                attributeName === "summary" ||
                attributeName === "docs" ||
                attributeName === "tests" ||
                attributeName === "getSequence" ||
                attributeName === "supportsAlways" ||
                attributeName === "supportComplicated"
            ){
                constructor[attributeName] = attribute;
            }else if(attributeName === "supportDescription"){
                constructor[attributeName] = cleanString(attribute);
            }else{
                constructor.prototype[attributeName] = attribute;
            }
        }
        wrapSequenceOverrides(constructor, attributes.overrides);
        constructor.test = sequenceTestRunner(constructor);
        sequenceTypes[constructor.name] = constructor;
        return constructor;
    },
});

const wrapSequenceOverrides = (sequence, overrides) => {
    // TODO: Remove isArray check after all override attributes are updated
    if(overrides && !isArray(overrides)){
        for(const override in overrides){
            if(process.env.NODE_ENV === "development"){
                if(!sequence.prototype[override]){
                    throw new Error(`Invalid override method name "${override}".`);
                }
            }
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

