import {addSequenceConverter} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {normalizeExpecting} from "./expecting";
import {lightWrap} from "./lightWrap";
import {Sequence} from "./sequence";
import {appliedSequenceSupports} from "./sequence";
import {isArray, isNumber} from "./types";
import {getWrappedFunction, getWrappedFunctionAsync} from "./wrapFunction";

import {cleanDocs, cleanString} from "../docs/cleanString";

export const sequenceTypes = {};

const sequenceTypeAttributes = {
    done: {
        native: "nativeDone",
        constructor: false,
        prototype: true,
    },
    length: {
        native: "nativeLength",
        constructor: false,
        prototype: true,
    },
    front: {
        native: "nativeFront",
        constructor: false,
        prototype: true,
    },
    popFront: {
        native: "nativePopFront",
        constructor: false,
        prototype: true,
    },
    back: {
        native: "nativeBack",
        constructor: false,
        prototype: true,
    },
    popBack: {
        native: "nativePopBack",
        constructor: false,
        prototype: true,
    },
    index: {
        native: "nativeIndex",
        constructor: false,
        prototype: false,
    },
    indexNegative: {
        native: "nativeIndexNegative",
        constructor: false,
        prototype: false,
    },
    slice: {
        native: "nativeSlice",
        constructor: false,
        prototype: false,
    },
    sliceNegative: {
        native: "nativeSliceNegative",
        constructor: false,
        prototype: false,
    },
    sliceMixed: {
        native: "nativeSliceMixed",
        constructor: false,
        prototype: false,
    },
    has: {
        native: "nativeHas",
        constructor: false,
        prototype: true,
    },
    get: {
        native: "nativeGet",
        constructor: false,
        prototype: true,
    },
    copy: {
        native: "nativeCopy",
        constructor: false,
        prototype: true,
    },
    overrides: {
        constructor: true,
        prototype: true,
    },
    supportRequired: {
        constructor: true,
        supportObject: true,
    },
    supportsWith: {
        constructor: true,
        supportObject: true,
    },
    summary: {
        constructor: true,
    },
    docs: {
        constructor: true,
    },
    tests: {
        constructor: true,
    },
    getSequence: {
        constructor: true,
    },
    supportsAlways: {
        constructor: true,
    },
    supportComplicated: {
        constructor: true,
    },
    converter: {
        constructor: true,
    },
    supportDescription: {
        constructor: true,
        cleanString: true,
    },
};

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
            const info = sequenceTypeAttributes[attributeName];
            let value;
            if(!info){
                constructor.prototype[attributeName] = attribute;
            }else{
                if(info.supportObject){
                    if(isArray(attribute)){
                        value = {};
                        for(const methodName of attribute) value[methodName] = "any";
                    }else{
                        value = attribute;
                    }
                }else if(info.cleanString){
                    value = cleanString(attribute);
                }else{
                    value = attribute;
                }
                if(info.native){
                    constructor[info.native] = value;
                    constructor.prototype[info.native] = value;
                }
                if(info.constructor){
                    constructor[attributeName] = value;
                }
                if(info.prototype){
                    constructor.prototype[attributeName] = value;
                }
            }
        }
        wrapSequenceOverrides(constructor, attributes.overrides);
        constructor.test = sequenceTestRunner(constructor);
        sequenceTypes[constructor.name] = constructor;
        if(constructor.converter){
            addSequenceConverter(constructor);
        }
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

