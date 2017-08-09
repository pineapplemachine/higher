import {normalizeExpecting} from "./expecting";
import {lightWrap} from "./lightWrap";
import {Sequence} from "./sequence";
import {isArray} from "./types";
import {getWrappedFunction, getWrappedFunctionAsync} from "./wrapFunction";

import {cleanDocs} from "../docs/cleanString";

export const sequenceTypes = {};

export const defineSequence = lightWrap({
    summary: "Extend the @Sequence prototype.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineSequence(methods){
        const constructor = methods.constructor;
        methods.overrides = methods.overrides || [];
        constructor.prototype = Object.create(Sequence.prototype);
        Object.assign(constructor.prototype, methods);
        wrapSequenceOverrides(constructor, methods.overrides);
        sequenceTypes[constructor.name] = constructor;
        if(process.env.NODE_ENV === "development"){
            constructor.getSequence = methods.getSequence;
            constructor.docs = cleanDocs(constructor.docs);
            constructor.tests = methods.tests;
            constructor.test = sequenceTestRunner(constructor);
        }
        return constructor;
    },
});

export const wrapSequenceOverrides = (sequence, overrides) => {
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

