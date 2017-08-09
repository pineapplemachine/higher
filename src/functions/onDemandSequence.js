import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {ArraySequence} from "./arrayAsSequence";

export const OnDemandSequence = defineSequence({
    summary: "Eagerly compute the contents of a sequence, but only when first needed.",
    supportsAlways: [
        "length", "left", "back", "index", "slice", "copy", "reset",
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    constructor: function OnDemandSequence(methods){
        this.dumpOnDemand = methods.dump;
        this.doneOnDemand = methods.done;
        this.lengthOnDemand = methods.length;
        this.frontOnDemand = methods.front;
        this.backOnDemand = methods.back;
        this.hasOnDemand = methods.has;
        this.getOnDemand = methods.get;
        if(this.doneOnDemand) this.done = function(){
            return this.doneOnDemand();
        };
        if(this.lengthOnDemand) this.length = function(){
            return this.lengthOnDemand();
        };
        if(this.lengthOnDemand) this.left = function(){
            return this.lengthOnDemand();
        };
        if(this.frontOnDemand) this.front = function(){
            return this.frontOnDemand();
        };
        if(this.backOnDemand) this.back = function(){
            return this.backOnDemand();
        };
        if(this.hasOnDemand) this.has = function(i){
            return this.hasOnDemand(i);
        };
        if(this.getOnDemand) this.get = function(i){
            return this.getOnDemand(i);
        };
    },
    initialize: function(){
        this.source = this.dumpOnDemand();
        this.done = function(){
            return this.source.done();
        };
        this.length = function(){
            return this.source.length();
        };
        this.left = function(){
            return this.source.left();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            return this.source.popFront();
        };
        this.back = function(){
            return this.source.back();
        };
        this.popBack = function(){
            return this.source.popBack();
        };
        this.index = function(i){
            return this.source.index(i);
        };
        this.slice = function(i, j){
            return this.source.index(i, j);
        };
        this.copy = function(){
            return this.source.copy();
        };
        this.reset = function(){
            this.source.reset();
            return this;
        };
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        this.initialize();
        return this.source.done();
    },
    length: function(){
        this.initialize();
        return this.source.length();
    },
    left: function(){
        this.initialize();
        return this.source.left();
    },
    front: function(){
        this.initialize();
        return this.source.front();
    },
    popFront: function(){
        this.initialize();
        return this.source.popFront();
    },
    back: function(){
        this.initialize();
        return this.source.back();
    },
    popBack: function(){
        this.initialize();
        return this.source.popBack();
    },
    index: function(i){
        this.initialize();
        return this.source.index(i);
    },
    slice: function(i, j){
        this.initialize();
        return this.source.slice(i, j);
    },
    copy: function(){
        return new OnDemandSequence({
            dump: this.dumpOnDemand,
            done: this.doneOnDemand,
            length: this.lengthOnDemand,
            front: this.frontOnDemand,
            back: this.backOnDemand,
            has: this.hasOnDemand,
            get: this.getOnDemand,
        });
    },
    reset: function(){
        return this;
    },
});

export const expectingOnDemandObject = wrap.Expecting({
    article: "an",
    singular: "on-demand object",
    plural: "on-demand objects",
    short: "object",
    adjective: "an on-demand object",
    suggestion: (
        `An on-demand object is any object with at least a "dump" ` +
        "function attribute."
    ),
    validate: value => {
        if(!value || !value.dump) throw new Error();
        return value;
    },
});

// TODO: More thoroughly document on-demand object spec somewhere
export const onDemandSequence = wrap({
    name: "onDemandSequence",
    summary: "Eagerly compute the contents of a sequence, but only when first needed.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an object as its single input. The object
            must have a #dump function attribute. Other specially-regonized but
            not mandatory attributes are #done, #length, #front, #back, #has,
            and #get. The more such properties that can be provided, the
            fewer cases that will require computing the whole contents of the
            output sequence.
        `),
        returns: (`
            The function returns a sequence whose contents are described by the
            sequence returned by the input object's #dump function attribute.
            The contents of the sequence will be fully computed using that
            function as soon as any contents of the output sequence are
            accessed, except for the #done, #length, #left, #front, or #back
            attributes when the inputted object provided implementations for
            these properties that did not require fully computing the sequence.
        `),
        returnType: "OnDemandSequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "eagerSequence",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        one: expectingOnDemandObject,
    },
    implementation: (object) => {
        return new OnDemandSequence(object);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            // Real use cases won't be so simple!
            let hasBeenComputed = false;
            const seq = hi.onDemandSequence({
                // Get the whole contents as a sequence
                dump: () => {
                    hasBeenComputed = true;
                    return hi([1, 2, 3, 4, 5, 6, 7]);
                },
                // Get whether the sequence is initially empty
                done: () => false,
                // Get the length of the sequence
                length: () => 7,
                // Get the initial front element of the sequence
                front: () => 1,
                // Get the initial back element of the sequence
                back: () => 7,
            });
            // The full contents aren't computed until really necessary.
            hi.assert(seq.front() === 1);
            hi.assert(seq.back() === 7);
            hi.assertNot(hasBeenComputed);
            // Actually attempting to consume the sequence will require dumping.
            hi.assertEqual(seq, [1, 2, 3, 4, 5, 6, 7]);
            hi.assert(hasBeenComputed);
        },
    },
});
    
