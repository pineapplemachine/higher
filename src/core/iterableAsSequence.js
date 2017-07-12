import {Sequence} from "./sequence";
import {isArray, isIterable} from "../core/types";
import {wrap} from "../core/wrap";

export const IterableSequence = Sequence.extend({
    summary: "Enumerate the items of an iterable.",
    supportsWith: [],
    supportsAlways: [],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        detail: (`
            An IterableSequence is a light wrapper around any object with a
            "next" method returning objects with "item" and "done" attributes.
            It allows these iterables to be interfaced with the same as any
            other sequence type, though only the bare minimum of sequence
            operations are supported.
        `),
        methods: {},
    },
    constructor: function IterableSequence(
        source, first = true, item = undefined
    ){
        this.source = source;
        this.item = undefined;
    },
    initialize: function(){
        this.item = this.source.next();
        this.done = function(){
            return this.item.done;
        };
        this.front = function(){
            return this.item.value;
        };
        this.popFront = function(){
            this.item = this.source.next();
        };
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        this.initialize();
        return this.item.done;
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.item.value;
    },
    popFront: function(){
        this.initialize();
        this.item = this.source.next();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: null,
    copy: null,
    reset: null,
    rebase: null,
});

export const iterableAsSequence = wrap({
    name: "iterableAsSequence",
    summary: "Get a sequence enumerating the items of an iterable.",
    attachSequence: false,
    async: false,
    asSequence: {
        // Extremely low priority converter due to how generic it is.
        // Second-last priority of all core converters, before objectAsSequence.
        implicit: true,
        priority: 800,
        predicate: isIterable,
        bounded: () => false,
        unbounded: () => false,
    },
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        return new IterableSequence(source);
    },
});

export default iterableAsSequence;
