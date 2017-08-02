import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

// Enumerate those elements of an input sequence starting from the first
// element matching a predicate.
export const FromSequence = Sequence.extend({
    constructor: function FromSequence(
        predicate, source, isInclusive = true, initialized = false
    ){
        this.predicate = predicate;
        this.source = source;
        this.isInclusive = isInclusive;
        this.initialized = initialized;
        this.maskAbsentMethods(source);
    },
    initialize: function(){
        this.initialized = true;
        while(!this.source.done()){
            if(this.predicate(this.source.front())){
                if(!this.isInclusive) this.source.popFront();
                break;
            }else{
                this.source.popFront();
            }
        }
        this.done = function(){
            return this.source.done();
        };
        this.front = function(){
            return this.source.front();
        };
        this.popFront = function(){
            return this.source.popFront();
        };
    },
    inclusive: function(){
        this.isInclusive = true;
        return this;
    },
    exclusive: function(){
        this.isInclusive = false;
        return this;
    },
    bounded: function(){
        return this.source.bounded();
    },
    // This holds if the predicate matches any element.
    // If it doesn't match any element then attempting to initialize this
    // sequence will produce an infinite loop, so I think this is a safe
    // assumption to make; users should not be producing that situation in the
    // first place.
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        this.initialize();
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.source.front();
    },
    popFront: function(){
        this.initialize();
        return this.source.popFront();
    },
    back: null,
    popBack: null,
    index: null,
    slice: null,
    has: null,
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new FromSequence(
            this.predicate, this.source.copy(),
            this.isInclusive, this.initialized
        );
        if(this.initialized){
            copy.done = this.done;
            copy.front = this.front;
            copy.popFront = this.popFront;
        }
        return this;
    },
    reset: function(){
        this.source.reset();
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

export const from = wrap({
    name: "from",
    attachSequence: true,
    async: false,
    sequences: [
        FromSequence
    ],
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1
        }
    },
    implementation: (predicate, source) => {
        return new FromSequence(predicate, source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const array = [1, 3, 9, 7, 5, 2, 1, 3, 4];
            hi.assertEqual(hi.from(array, even), [2, 1, 3, 4]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().from(i => true));
            hi.assertEmpty(hi.emptySequence().from(i => false));
        },
        "noElementsSatisfy": hi => {
            hi.assertEmpty(hi.from([1, 2, 3], i => false));
        },
    },
});

const fromFn = from; // Workaround for syntax error
export default fromFn;
