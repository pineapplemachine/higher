import {asSequence, validAsBoundedSequence} from "../core/asSequence";
import {callAsync} from "../core/callAsync";
import {constants} from "../core/constants";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const ReduceSequence = defineSequence({
    summary: "Enumerate the combinations of elements with their predecessors in a source sequence.",
    supportsWith: [
        "length", "left", "copy", "reset",
    ],
    overrides: {
        seed: {one: wrap.expecting.anything},
        unseed: {none: true},
        lastElement: {async: true, optional: wrap.expecting.predicate},
        lastElementElse: {
            async: true, unordered: {
                functions: {
                    amount: [1, 2],
                    first: wrap.expecting.callback,
                    second: wrap.expecting.predicate,
                },
            },
        },
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a combination function and a sequence as
            input.
        `),
        methods: {
            seed: {
                introduced: "higher@1.0.0",
                summary: "Modify the sequence to an initial seed value for the reduction operation.",
                expects: "The function expects one value of any kind as input.",
                returns: "The function returns the sequence itself.",
                returnType: "sequence",
                examples: ["seedBasicUsage"],
            },
            unseed: {
                introduced: "higher@1.0.0",
                summary: "Modify the sequence remove any seed value set for the reduction operation.",
                expects: "The function accepts no arguments.",
                returns: "The function returns the sequence itself.",
                returnType: "sequence",
                examples: ["unseedBasicUsage"],
            },
        },
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "seedBasicUsage": hi => {
            const sum = (a, b) => a + b;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi([1, 2, 3]));
            hi.assert(seq().lastElement() === 6);
            hi.assert(seq().seed(0).lastElement() === 6);
            hi.assert(seq().seed(20).lastElement() === 26);
        },
        "unseedBasicUsage": hi => {
            const sum = (a, b) => a + b;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi([1, 2, 3])).seed(20);
            hi.assert(seq().lastElement() === 26);
            hi.assert(seq().unseed().lastElement() === 6);
        },
        "lastElementOverrideSeeded": hi => {
            const sum = (a, b) => a + b;
            const odd = i => i % 2 === 1;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi([1, 2, 3, 4])).seed(0);
            hi.assert(seq().lastElement() === 10);
            hi.assert(seq().lastElement(odd) === 3);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "lastElementElseOverrideSeeded": hi => {
            const sum = (a, b) => a + b;
            const odd = i => i % 2 === 1;
            const bang = () => "!";
            const seq = () => new hi.sequence.ReduceSequence(sum, hi([1, 2, 3, 4])).seed(0);
            hi.assert(seq().lastElementElse(bang) === 10);
            hi.assert(seq().lastElementElse(bang, odd) === 3);
            hi.assert(seq().lastElementElse(bang, i => false) === "!");
        },
        "lastElementOverrideNotSeeded": hi => {
            const sum = (a, b) => a + b;
            const odd = i => i % 2 === 1;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi([1, 2, 3, 4]));
            hi.assert(seq().lastElement() === 10);
            hi.assert(seq().lastElement(odd) === 3);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "lastElementElseOverrideNotSeeded": hi => {
            const sum = (a, b) => a + b;
            const odd = i => i % 2 === 1;
            const bang = () => "!";
            const seq = () => new hi.sequence.ReduceSequence(sum, hi([1, 2, 3, 4]));
            hi.assert(seq().lastElementElse(bang) === 10);
            hi.assert(seq().lastElementElse(bang, odd) === 3);
            hi.assert(seq().lastElementElse(bang, i => false) === "!");
        },
        "lastElementOverrideEmptyInputSeeded": hi => {
            const sum = (a, b) => a + b;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi.emptySequence()).seed(2);
            hi.assert(seq().lastElement() === 2);
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "lastElementElseOverrideEmptyInputSeeded": hi => {
            const sum = (a, b) => a + b;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi.emptySequence()).seed(2);
            hi.assert(seq().lastElementElse(() => "!") === 2);
            hi.assert(seq().lastElementElse(() => "!", i => true) === 2);
            hi.assert(seq().lastElementElse(() => "!", i => false) === "!");
        },
        "lastElementOverrideEmptyInputNotSeeded": hi => {
            const sum = (a, b) => a + b;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi.emptySequence());
            hi.assertUndefined(seq().lastElement());
            hi.assertUndefined(seq().lastElement(i => false));
        },
        "lastElementElseOverrideEmptyInputNotSeeded": hi => {
            const sum = (a, b) => a + b;
            const seq = () => new hi.sequence.ReduceSequence(sum, hi.emptySequence());
            hi.assert(seq().lastElementElse(() => "!") === "!");
            hi.assert(seq().lastElementElse(() => "!", i => true) === "!");
            hi.assert(seq().lastElementElse(() => "!", i => false) === "!");
        },
        "lastElementOverrideUnboundedInput": hi => {
            const sum = (a, b) => a + b;
            const seq = new hi.sequence.ReduceSequence(sum, hi.counter());
            hi.assertFailWith(NotBoundedError, () => seq.lastElement());
            hi.assertFailWith(NotBoundedError, () => seq.lastElement(i => true));
            hi.assertFailWith(NotBoundedError, () => seq.lastElement(i => false));
        },
        "lastElementElseOverrideUnboundedInput": hi => {
            const sum = (a, b) => a + b;
            const bang = () => "!";
            const seq = new hi.sequence.ReduceSequence(sum, hi.counter());
            hi.assertFailWith(NotBoundedError, () => seq.lastElementElse(bang));
            hi.assertFailWith(NotBoundedError, () => seq.lastElementElse(bang, i => true));
            hi.assertFailWith(NotBoundedError, () => seq.lastElementElse(bang, i => false));
        },
    },
    constructor: function ReduceSequence(
        combine, source, seedValue = undefined,
        hasSeed = undefined, isDone = undefined
    ){
        this.combine = combine;
        this.source = source;
        this.accumulator = seedValue;
        this.seedValue = seedValue;
        this.hasSeed = hasSeed || false;
        this.isDone = isDone || false;
        this.maskAbsentMethods(source);
    },
    lastElement: function(predicate){
        if(!this.source.bounded()) throw NotBoundedError(this.source, {
            message: "Failed to reduce sequence",
        });
        if(predicate){
            if(this.hasSeed){
                let accumulator = this.seedValue;
                let lastElement = predicate(accumulator) ? accumulator : undefined;
                for(const element of this.source){
                    accumulator = this.combine(accumulator, element);
                    if(predicate(accumulator)) lastElement = accumulator;
                }
                return lastElement;
            }else{
                let first = true;
                let accumulator = undefined;
                let lastElement = undefined;
                for(const element of this.source){
                    if(first){
                        accumulator = element;
                        first = false;
                    }else{
                        accumulator = this.combine(accumulator, element);
                    }
                    if(predicate(element)) lastElement = element;
                }
                return lastElement;
            }
        }else{
            if(this.hasSeed){
                let accumulator = this.seedValue;
                for(const element of this.source){
                    accumulator = this.combine(accumulator, element);
                }
                return accumulator;
            }else{
                let first = true;
                let accumulator = undefined;
                for(const element of this.source){
                    if(first){
                        accumulator = element;
                        first = false;
                    }else{
                        accumulator = this.combine(accumulator, element);
                    }
                }
                return accumulator;
            }
        }
    },
    lastElementElse: function(functions){
        if(!this.source.bounded()) throw NotBoundedError(this.source, {
            message: "Failed to reduce sequence",
        });
        const callback = functions[0];
        const predicate = functions[1];
        if(predicate){
            if(this.hasSeed){
                let accumulator = this.seedValue;
                let anyElement = predicate(accumulator);
                let lastElement = anyElement ? accumulator : undefined;
                for(const element of this.source){
                    accumulator = this.combine(accumulator, element);
                    if(predicate(accumulator)){
                        lastElement = accumulator;
                        anyElement = true;
                    }
                }
                return anyElement ? lastElement : callback();
            }else{
                let first = true;
                let accumulator = undefined;
                let lastElement = undefined;
                let anyElement = false;
                for(const element of this.source){
                    if(first){
                        accumulator = element;
                        first = false;
                    }else{
                        accumulator = this.combine(accumulator, element);
                    }
                    if(predicate(element)){
                        lastElement = element;
                        anyElement = true;
                    }
                }
                return anyElement ? lastElement : callback();
            }
        }else{
            if(this.hasSeed){
                let accumulator = this.seedValue;
                for(const element of this.source){
                    accumulator = this.combine(accumulator, element);
                }
                return accumulator;
            }else{
                let first = true;
                let accumulator = undefined;
                for(const element of this.source){
                    if(first){
                        accumulator = element;
                        first = false;
                    }else{
                        accumulator = this.combine(accumulator, element);
                    }
                }
                return first ? callback() : accumulator;
            }
        }
    },
    initialize: function(){
        if(!this.hasSeed){
            if(this.source.done()){
                this.isDone = true;
            }else{
                this.accumulator = this.source.nextFront();
            }
        }
        this.done = function(){
            return this.isDone && this.source.done();
        };
        this.front = function(){
            return this.accumulator;
        };
        this.popFront = function(){
            if(this.source.done()){
                this.isDone = true;
            }else{
                this.accumulator = this.combine(
                    this.accumulator, this.source.nextFront()
                );
            }
        };
    },
    seed: function(value){
        this.accumulator = value;
        this.seedValue = value;
        this.hasSeed = true;
        return this;
    },
    unseed: function(){
        this.hasSeed = false;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        this.initialize();
        return this.isDone && this.source.done();
    },
    length: function(){
        return Math.max(0, this.source.nativeLength() - 1 + this.hasSeed);
    },
    left: function(){
        return Math.max(0, this.source.left() - 1 + this.hasSeed);
    },
    front: function(){
        this.initialize();
        return this.accumulator;
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    copy: function(){
        const copy = new ReduceSequence(
            this.combine, this.source.copy(),
            this.seedValue, this.hasSeed, this.isDone
        );
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        return copy;
    },
    reset: function(){
        this.source.reset();
        this.accumulator = this.seedValue;
        delete this.done;
        delete this.front;
        delete this.popFront;
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const reduce = wrap({
    names: ["reduce", "fold"],
    summary: "Get a sequence enumerating combinations of elements in an input sequence with their predecessors.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a [combination function] and a sequence as input.
        `),
        returns: (`
            The function returns a sequence wherein the first element is the
            first element of the input sequence (if the output sequence is not
            seeded) or a given seed value (if the output was seeded), the
            second element is the result of invoking the combination function
            with the first element and the following element of the input
            sequence, the third element the result of invoking the combination
            function with the second element and the following element of the
            input sequence, and so on.
            /The last element in the output sequence is the result of applying
            the combination function to every element in the input sequence
            in series.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "sumLinear", "product",
        ],
        links: [
            {
                description: "Fold higher-order function on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Fold_(higher-order_function)",
            },
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: {one: wrap.expecting.combination},
            sequences: 1,
        }
    },
    implementation: (combine, source) => {
        return new ReduceSequence(combine, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 10];
            const sum = (acc, next) => acc + next;
            hi.assert(hi.reduce(array, sum).lastElement() === 20);
        },
        "emptyInputSeeded": hi => {
            hi.assertEqual(hi.emptySequence().reduce(() => 0).seed("!"), "!");
        },
        "emptyInputNotSeeded": hi => {
            hi.assertEmpty(hi.emptySequence().reduce(() => 0));
        },
        "unboundedInputSeeded": hi => {
            const sum = (a, b) => a + b;
            const seq = hi.counter().reduce(sum).seed(100);
            hi.assert(seq.startsWith([100, 100, 101, 103, 106, 110, 115]));
        },
        "unboundedInputNotSeeded": hi => {
            const sum = (a, b) => a + b;
            const seq = hi.counter().reduce(sum);
            hi.assert(seq.startsWith([0, 1, 3, 6, 10, 15]));
        },
    },
});

export const fold = reduce;

export default reduce;
