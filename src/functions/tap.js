import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

export const TapSequence = defineSequence({
    summary: "Enumerate elements of the input, invoking a callback per element when consumed.",
    supportsWith: [
        "length", "left", "back", "index", "slice", "has", "get", "copy", "reset"
    ],
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Enumerates the elements of the source sequence and invokes a callback
            every time an element is popped from the front or back, passing the
            popped element as an argument to that callback.
        `),
    },
    constructor: function TapSequence(callback, source){
        this.callback = callback;
        this.source = source;
        this.maskAbsentMethods(source);
    },
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        return this.source.done();
    },
    length: function(){
        return this.source.length();
    },
    left: function(){
        return this.source.left();
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        return this.callback(this.source.nextFront());
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        return this.callback(this.source.nextBack());
    },
    index: function(i){
        return this.source.index(i);
    },
    slice: function(i, j){
        return new TapSequence(this.callback, this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        return new TapSequence(this.callback, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

// Like each, except the callbacks are invoked as the sequence is consumed,
// as opposed to the sequence being consumed immediately.
export const tap = wrap({
    name: "tap",
    summary: "Get a sequence invoking a callback for each element of the input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and a callback as input.
            The callback will be invoked once for every element in the input
            sequence, receiving that element as an argument.
            There are no limitations on what sequence the function will accept.
        `),
        returns: (`
            A new @TapSequence which will apply the callback to every element
            of the input at the time that the element is consumed.
        `),
        examples: [
            "basicUsage"
        ],
        related: [
            "each"
        ],
    },
    attachSequence: true,
    async: false,
    sequences: [
        TapSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (callback, source) => {
        return new TapSequence(callback, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            let sum = 0;
            const array = [1, 2, 3, 4];
            const seq = hi.tap(array, i => {sum += i;});
            hi.assert(seq.front() === 1);
            hi.assert(sum === 0);
            seq.popFront(); // Invoke callback for the first element
            hi.assert(sum === 1);
            while(!seq.done()) seq.popFront();
            hi.assert(sum === 1 + 2 + 3 + 4);
        },
    },
});

export default tap;
