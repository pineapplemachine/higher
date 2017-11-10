import {defineSequence} from "../core/defineSequence";
import {isArray, isIterable} from "../core/types";
import {wrap} from "../core/wrap";

export const IterableSequence = defineSequence({
    summary: "Enumerate the element of an input iterable.",
    overrides: [
        Symbol.iterator,
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects an iterable as its single argument.
        `),
        links: [
            {
                description: "Documentation regarding ES6 iterators and iterables",
                url: "https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols",
            },
        ],
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "iteratorOverride": hi => {
            const iter = function*(){yield 0; yield 1; yield 2;};
            const seq = new hi.sequence.IterableSequence(iter());
            const acc = []
            for(const element of seq) acc.push(element);
            hi.assertEqual(acc, [0, 1, 2]);
        },
    },
    converter: {
        implicit: true,
        after: {
            arrayAsSequence: true,
            stringAsSequence: true,
        },
        predicate: isIterable,
        bounded: () => false,
        unbounded: () => false,
    },
    constructor: function IterableSequence(
        source, first = true, item = undefined
    ){
        this.source = source;
        this.item = undefined;
    },
    [Symbol.iterator]: function(){
        return this.source[Symbol.iterator]();
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        if(!this.item) this.item = this.source.next();
        return this.item.done;
    },
    front: function(){
        if(!this.item) this.item = this.source.next();
        return this.item.value;
    },
    popFront: function(){
        if(!this.item) this.source.next();
        this.item = this.source.next();
    },
});

export const iterableAsSequence = wrap({
    name: "iterableAsSequence",
    summary: "Get a sequence for enumerating the elements of an iterable.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects an iterable as its single argument.
        `),
        returns: (`
            The function returns a sequence enumerating the elements of the
            input iterable.
        `),
        developers: (`
            As there is no standard way to indicate whether an ES6 iterator is
            bounded or unbounded, the outputted sequence will never be
            known-bounded or known-unbounded.
            This lack of available information may be compsensated for using the
            @assumeBounded or @assumeUnbounded function where knowing for sure
            the boundedness of the sequence would be beneficial.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "arrayAsSequence", "stringAsSequence",
        ],
        links: [
            {
                description: "Documentation regarding ES6 iterators and iterables",
                url: "https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols",
            },
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.iterable,
    },
    implementation: (source) => {
        return new IterableSequence(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const integersUntil = function*(i){
                let j = 0;
                while(j < i) yield j++;
            };
            const seq = hi.iterableAsSequence(integersUntil(10));
            hi.assertEqual(seq, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        },
        "emptyInput": hi => {
            const iter = function*(){};
            hi.assertEmpty(hi.iterableAsSequence(iter()));
        },
        "singleLengthInput": hi => {
            const iter = function*(){yield "!";};
            hi.assertEqual(hi.iterableAsSequence(iter()), ["!"]);
        },
        "asSequence": hi => {
            const iter = function*(){yield 1; yield 2; yield 3;};
            hi.assertEqual(hi.asSequence(iter()), [1, 2, 3]);
        },
    },
});

export default iterableAsSequence;
