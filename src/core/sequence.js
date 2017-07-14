import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {error} from "./error";
import {isArray, isObject, isString} from "./types";
import {joinSeries} from "./joinSeries";

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
    if(process.env.NODE_ENV === "development"){
        constructor.test = !methods.getSequence ? undefined : hi => {
            console.log("Testing a sequence!", constructor.name);
            const result = {
                pass: [],
                fail: [],
            }
            for(const contract of hi.contracts){
                let success = true;
                try{
                    for(const getter of methods.getSequence){
                        contract.enforce(() => getter(hi));
                    }
                }catch(error){
                    success = false;
                    result.fail.push({name: contract.name, error: error});
                }
                if(success){
                    result.pass.push({name: contract.name});
                }
            }
            return result;
        };
    }
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

// Get a string indicating the sequence type chain represented by sources.
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
