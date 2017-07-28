import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";

// Map sequence optimized for one input sequence.
export const SingularMapSequence = Sequence.extend({
    summary: "Enumerate transformed elements of a source sequence.",
    supportsWith: [
        "length", "left", "back", "index", "slice", "has", "get", "copy", "reset"
    ],
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new SingularMapSequence(i => i, hi.emptySequence()),
        hi => new SingularMapSequence(i => i, hi([0, 1, 2, 3, 4, 5])),
        hi => new SingularMapSequence(i => 0, hi([0, 1, 2, 3, 4, 5])),
        hi => new SingularMapSequence(i => i + i, hi([0, 1, 2, 3, 4, 5])),
        hi => new SingularMapSequence(i => i, hi.range(0, 10)),
        hi => new SingularMapSequence(i => -i, hi.recur(j => j * j).seed(3)),
        hi => new SingularMapSequence(i => i * i, hi.repeat([0, 1, 2, 3])),
    ],
    constructor: function SingularMapSequence(transform, source){
        this.source = source;
        this.transform = transform;
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
        return this.transform(this.source.front());
    },
    popFront: function(){
        this.source.popFront();
    },
    back: function(){
        return this.transform(this.source.back());
    },
    popBack: function(){
        this.source.popBack();
    },
    index: function(i){
        return this.transform(this.source.index(i));
    },
    slice: function(i, j){
        return new SingularMapSequence(this.transform, this.source.slice(i, j));
    },
    has: function(i){
        return this.source.has(i);
    },
    get: function(i){
        return this.transform(this.source.get(i));
    },
    copy: function(){
        return new SingularMapSequence(this.transform, this.source.copy());
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

// Map sequence for any number of input sequences.
export const PluralMapSequence = Sequence.extend({
    summary: "Enumerate transformed elements of any number of source sequences.",
    supportsWith: {
        "length": "all", "left": "all", "index": "all", "slice": "all",
        "has": "all", "get": "all", "copy": "all", "reset": "all",
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        // No sources
        hi => new PluralMapSequence(i => i, []),
        // One source
        hi => new PluralMapSequence(i => i, [hi.emptySequence()]),
        hi => new PluralMapSequence(i => i, [hi([0, 1, 2, 3])]),
        hi => new PluralMapSequence(i => i, [hi.range(0, 10)]),
        hi => new PluralMapSequence(i => i, [hi.counter()]),
        // Two sources
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.emptySequence(), hi.emptySequence()
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.emptySequence(), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi([20, 30, 40, 50]), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.counter(), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.counter(100), hi.counter(300)
        ]),
        // Three sources
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.emptySequence(), hi.emptySequence(), hi.emptySequence()
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.emptySequence(), hi.emptySequence(), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.emptySequence(), hi([20, 30, 40, 50]), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi([200, 300, 400, 500]), hi([20, 30, 40, 50]), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.counter(), hi.counter(), hi([0, 1, 2, 3])
        ]),
        hi => new PluralMapSequence((i, j) => (i + j), [
            hi.counter(10), hi.counter(100), hi.counter(300)
        ]),
    ],
    constructor: function PluralMapSequence(transform, sources){
        this.sources = sources;
        this.source = sources[0];
        this.transform = transform;
        for(const source of sources){
            this.maskAbsentMethods(source);
        }
        if(sources.length === 0){
            this.rebase = null;
        }
    },
    bounded: function(){
        for(const source of this.sources){
            if(!source.bounded()) return false;
        }
        return true;
    },
    unbounded: function(){
        for(const source of this.sources){
            if(!source.unbounded()) return false;
        }
        return this.sources.length !== 0;
    },
    done: function(){
        for(const source of this.sources){
            if(source.done()) return true;
        }
        return this.sources.length === 0;
    },
    length: function(){
        if(this.sources.length === 0) return 0;
        let min = this.sources[0].length();
        for(let i = 1; i < this.sources.length; i++){
            min = Math.min(min, this.sources[i].length());
        }
        return min;
    },
    left: function(){
        if(this.sources.length === 0) return 0;
        let min = this.sources[0].left();
        for(let i = 1; i < this.sources.length; i++){
            min = Math.min(min, this.sources[i].left());
        }
        return min;
    },
    front: function(){
        const elements = [];
        for(const source of this.sources) elements.push(source.front());
        return this.transform.apply(this, elements);
    },
    popFront: function(){
        for(const source of this.sources){
            source.popFront();
        }
    },
    back: null,
    popBack: null,
    index: function(i){
        const elements = [];
        for(const source of this.sources) elements.push(source.index(i));
        return this.transform.apply(this, elements);
    },
    slice: function(i, j){
        const slices = [];
        for(const source of this.sources) slices.push(source.slice(i, j));
        return new PluralMapSequence(this.transform, slices);
    },
    has: function(i){
        for(const source of this.sources){
            if(!source.has(i)) return false;
        }
        return this.sources.length !== 0;
    },
    get: function(i){
        const elements = [];
        for(const source of this.sources) elements.push(source.get(i));
        return this.transform.apply(this, elements);
    },
    copy: function(){
        const copies = [];
        for(const source of this.sources) copies.push(source.copy());
        return new PluralMapSequence(this.transform, copies);
    },
    reset: function(){
        for(const source of this.sources) source.reset();
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.sources[0] = source;
        return this;
    },
});

export const map = wrap({
    name: "map",
    summary: "Get a sequence enumerating elements with a transformation applied to each.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get a sequence enumerating the result of applying a transformation
            function to each corresponding set of elements of the input
            sequences.
        `),
        expects: (`
            The function expects as input one transformation function and any
            number of sequences. The transformation function must accept as
            many arguments as there are sequences; the corresponding elements
            of each input sequence will be passed in order as arguments to the
            transformation function.
            When there is one input sequence, each element will be passed as a
            single argument to the transformation function; the outputted
            sequence will behave like any other conventional [singular map]
            function.
        `),
        returns: (`
            The function returns a sequence enumerating the outputs of the
            transformation function as applied to each set of corresponding
            elements of the input sequences.
            The produced sequence is as long as the shortest input sequence.
            When there were no input sequences, the function returns an
            empty sequence.
        `),
        examples: [
            "basicSingularUsage", "basicPluralUsage"
        ],
        links: [
            {
                description: "Map higher-order function on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Map_(higher-order_function)",
            },
            {
                description: "Clojure's similarly-peculiar map function",
                url: "https://clojuredocs.org/clojure.core/map",
            },
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: 1,
            sequences: "*"
        }
    },
    implementation: (transform, sources) => {
        if(sources.length === 1){
            if(sources[0] instanceof SingularMapSequence){
                return SingularMapSequence(
                    element => transform(sources[0].transform(element)),
                    sources[0].source
                );
            }else if(sources[0] instanceof PluralMapSequence){
                return PluralMapSequence(
                    ...args => transform(sources[0].transform(...args)),
                    sources[0].sources
                );
            }else{
                return new SingularMapSequence(transform, sources[0]);
            }
        }else if(sources.length === 0){
            return new EmptySequence();
        }else{
            return new PluralMapSequence(transform, sources);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicSingularUsage": hi => {
            const square = (i) => (i * i);
            const seq = hi.map(square, [1, 2, 3, 4, 5]);
            hi.assertEqual(seq, [1, 4, 9, 16, 25]);
        },
        "basicPluralUsage": hi => {
            const sum = (a, b) => (a + b);
            const seq = hi.map(sum, [0, 1, 2], [10, 20, 30]);
            hi.assertEqual(seq, [10, 21, 32]);
        },
        "differingSequenceLengths": hi => {
            const sum = (a, b, c) => (a + b + c);
            hi.assertEmpty(hi.map(sum, [1, 2], [3], hi.emptySequence()));
            hi.assertEqual(hi.map(sum, [1], [2, 3, 4], [4, 5]), [7]);
            hi.assertEqual(hi.map(sum, [1, 2], [3], [3, 4, 5]), [7]);
        },
        "noInputs": hi => {
            hi.assertEmpty(hi.map(i => i));
        },
        "notKnownBoundedInputs": hi => {
            const a = hi.recur(i => i + 1).seed(0).until(i => i === 100).map(i => i);
            hi.assertNot(a.bounded());
            hi.assertNot(a.unbounded());
            const b = hi.counter().map(i => i);
            hi.assertNot(b.bounded());
            hi.assert(b.unbounded());
        },
    },
});

export default map;
