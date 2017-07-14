import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

export const FilterSequence = Sequence.extend({
    summary: "Enumerate the elements of a sequence matching a predicate.",
    supportsWith: [
        "back", "has", "get", "copy", "reset"
    ],
    overrides: [
        "filter"
    ],
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new FilterSequence(() => true, hi([0, 1, 2, 3, 4, 5])),
        hi => new FilterSequence(() => false, hi([0, 1, 2, 3, 4, 5])),
        hi => new FilterSequence(i => i === 2, hi([0, 1, 2, 3, 4, 5])),
        hi => new FilterSequence(i => i % 2, hi([0, 1, 2, 3, 4, 5])),
        hi => new FilterSequence(i => i >= 3, hi([0, 1, 2, 3, 4, 5])),
        hi => new FilterSequence(i => i <= 3, hi([0, 1, 2, 3, 4, 5])),
        hi => new FilterSequence(i => i % 2, hi.range(0, 10)),
        hi => new FilterSequence(i => i % 2, hi.counter()),
        hi => new FilterSequence(i => i !== 27, hi.recur(j => j * j).seed(3)),
    ],
    constructor: function FilterSequence(predicate, source){
        this.predicate = predicate;
        this.source = source;
        this.maskAbsentMethods(source);
    },
    filter: function(predicate){
        return new FilterSequence(
            (element) => (this.predicate(element) && predicate(element)), this.source
        );
    },
    initializeFront: function(){
        while(!this.source.done() && !this.predicate(this.source.front())){
            this.source.popFront();
        }
        this.done = function(){
            return this.source.done();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            this.source.popFront();
            while(!this.source.done() && !this.predicate(this.source.front())){
                this.source.popFront();
            }
        };
    },
    initializeBack: function(){
        while(!this.source.done() && !this.predicate(this.source.back())){
            this.source.popBack();
        }
        this.done = function(){
            return this.source.done();
        };
        this.back = function(){
            return this.source.back();
        };
        this.popBack = function(){
            this.source.popBack();
            while(!this.source.done() && !this.predicate(this.source.back())){
                this.source.popBack();
            }
        };
    },
    // These methods assume that if the input is unbounded, then so will be the
    // number of elements satisfying the predicate.
    // This is probably a safe assumption since creating a filter sequence from
    // an unbounded sequence with a predicate that's never satisfied is
    // dangerous for other reasons.
    bounded: function(){
        return this.source.bounded();
    },
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        this.initializeFront();
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initializeFront();
        return this.source.front();
    },
    popFront: function(){
        this.initializeFront();
        return this.popFront();
    },
    back: function(){
        this.initializeBack();
        return this.source.back();
    },
    popBack: function(){
        this.initializeBack();
        return this.popBack();
    },
    index: null,
    slice: null,
    has: function(i){
        return this.source.has(i) && this.predicate({
            key: i, value: this.source.get(i)
        });
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new FilterSequence(
            this.predicate, this.source.copy(), false
        );
        copy.done = this.done;
        copy.front = this.front;
        copy.popFront = this.popFront;
        copy.back = this.back;
        copy.popBack = this.popBack;
        return copy;
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

export const filter = wrap({
    name: "filter",
    summary: "Get a sequence enumerating only those elements satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        expects: (`
            The function expects a sequence and a predicate function as input.
            The predicate will be applied to each element of the input sequence
            to determine whether that element should be included in the output.
        `),
        returns: (`
            The function returns a sequence enumerating only those elements of
            the input which satisfy the predicate.
        `),
        warnings: (`
            Use caution in filtering potentially unbounded sequences.
            Providing as input an unbounded sequence and a predicate that is
            satisfied by no elements in that sequence, or no elements past a
            certain point, will cause an infinite loop as soon as any
            information is requested from the outputted sequence.
        `),
        examples: [
            "basicUsage"
        ],
        related: [
            "reject"
        ],
        links: [
            "https://en.wikipedia.org/wiki/Filter_(higher-order_function)",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        return new FilterSequence(predicate, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 == 0;
            hi.assertEqual(hi.filter([0, 1, 2, 3, 4], even), [0, 2, 4]);
        },
        "noMatchingElements": hi => {
            hi.assertEmpty(hi.filter([0, 1, 2, 3, 4], i => i < 0));
            hi.assertEmpty(hi.filter([0, 1, 2, 3, 4, 5, 6, 7, 8], () => false));
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.filter([], () => true));
            hi.assertEmpty(hi.filter([], () => false));
        },
        "unboundedInput": hi => {
            const seq = () => hi.repeat(["hello", "world", "how", "do"]);
            hi.assert(seq().filter(i => i[1] === "o").unbounded())
            hi.assertEqual(seq().filter(i => i === "do").head(2), ["do", "do"])
            hi.assertEqual(seq().filter(i => i[0] === "h").head(5),
                ["hello", "how", "hello", "how", "hello"]
            );
        },
    },
});

export default filter;
