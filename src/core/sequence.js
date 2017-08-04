import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {error} from "./error";
import {lightWrap} from "./lightWrap";
import {isArray, isObject, isString} from "./types";

import {cleanDocs} from "../docs/cleanString";

export const defineSequence = lightWrap({
    summary: "Extend the @Sequence prototype.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineSequence(methods){
        const constructor = methods.constructor;
        constructor.prototype = Object.create(Sequence.prototype);
        Object.assign(constructor.prototype, methods);
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

export const attachSequenceMethods = lightWrap({
    summary: "Attach methods to the @Sequence prototype.",
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

export const sequenceTypes = {};

export const Sequence = function(){};
Sequence.extend = defineSequence;

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

// TODO: Stop using this
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

export default Sequence;
