import {ArraySequence} from "../core/arrayAsSequence";
import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const EagerSequence = Sequence.extend({
    summary: "Wrap a sequence with one supporting all sequence operations.",
    supportsWith: [
        "has", "get"
    ],
    supportsAlways: [
        "length", "left", "back", "index", "slice", "copy", "reset"
    ],
    overrides: [
        "array", "newArray"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        methods: {},
    },
    constructor: function EagerSequence(
        source, originalSource = undefined, initialized = undefined
    ){
        if(!source.bounded()) throw NotBoundedError(source, {
            message: "Failed to create eager sequence",
        });
        this.source = source;
        this.originalSource = originalSource || source;
        this.initialized = intialized;
        if(!source.has) this.has = null;
        if(!source.get) this.get = null;
    },
    initialize: function(){
        const array = [];
        for(const element of this.source) array.push(element);
        this.source = new ArraySequence(array);
        this.initialized = true;
    },
    array: function(limit){
        return this.source.array(limit);
    },
    arrayAsync: function(limit){
        return this.source.arrayAsync(limit);
    },
    newArray: function(limit){
        return this.source.newArray(limit);
    },
    newArrayAsync: function(limit){
        return this.source.newArrayAsync(limit);
    },
    bounded: () => true,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: function(){
        if(!this.source.length) this.initialize();
        return this.source.length();
    },
    left: function(){
        if(!this.source.left){
            // If the source doesn't support left, it hasn't been consumed either
            if(this.source.length) return this.source.length()
            this.initialize();
        }else{
            return this.source.left();
        }
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        if(!this.initialized) this.initialize();
        return this.source.popFront();
    },
    back: function(){
        if(!this.source.back) this.initialize();
        return this.source.back();
    },
    popBack: function(){
        if(!this.initialized) this.initialize();
        return this.source.popFront();
    },
    index: function(i){
        if(!this.source.index) this.initialize();
        return this.source.index(i);
    },
    slice: function(i, j){
        if(!this.initialized) this.initialize();
        return this.source.slice(i, j);
    },
    has: function(i){
        return this.originalSource.has(i);
    },
    get: function(i){
        return this.originalSource.get(i);
    },
    copy: function(){
        if(!this.initialized) this.initialize();
        return new EagerSequence(
            this.source, this.originalSource, this.initialized
        );
    },
    reset: function(){
        // If the source can't be reset then it hasn't been consumed either
        if(this.source.reset) this.source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.originalSource = source;
        this.initialzed = true;
        return this;
    },
});

export const eager = wrap({
    name: "eager",
    summary: "Get a sequence supporting all operations via eager consumption of the source.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Given a known bounded sequence that lacks known length, known
            elements left, bidirectionality, indexing, slicing, copying,
            or resetting, get a sequence that does have all these things
            by fully consuming the input sequence any time one of these
            operations is attempted and would not otherwise be possible.
        `),
        expects: (`
            The function takes a single sequence as its input.
        `),
        returns: (`
            The function returns the same sequence as was given as input if
            it already supports length, left, back, index, slice, copy, and
            reset operations. If it lacks support for any of these, a new
            @EagerSequence is returned that will support all of them.
        `),
        warnings: (`
            The first time that an operation is attempted on the produced
            sequence that isn't supported by the source it was created from,
            or the first time the sequence is sliced or an element is popped,
            the entire source sequence is consumed.
        `),
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        if(
            source.length && source.left && source.back && source.index &&
            source.slice && source.copy && source.reset
        ){
            return source;
        }else{
            // Will throw an error if the source isn't known to be bounded
            return new EagerSequence(source);
        }
    },
});

export default eager;
