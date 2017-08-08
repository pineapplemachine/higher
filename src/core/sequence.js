import {lightWrap} from "./lightWrap";

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

export const sequenceTypes = {};

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

// TODO: Stop using this
// https://github.com/pineapplemachine/higher/issues/53
Sequence.prototype.maskAbsentMethods = function(source){
    if(!source.back){
        this.back = undefined;
        this.popBack = undefined;
        this.nextBack = undefined;
    }
    if(this.length && !source.length) this.length = undefined;
    if(this.left && !source.left) this.left = undefined;
    if(this.index && !source.index) this.index = undefined;
    if(this.slice && !source.slice) this.slice = undefined;
    if(this.has && !source.has) this.has = undefined;
    if(this.get && !source.get) this.get = undefined;
    if(this.copy && !source.copy) this.copy = undefined;
    if(this.reset && !source.reset) this.reset = undefined;
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
