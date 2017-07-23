import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {EmptySequence} from "./emptySequence";

export const RoundRobinSequence = Sequence.extend({
    summary: "Enumerate elements of several input sequences in turn.",
    supportsWith: {
        "length": "all", "left": "all", "copy": "all", "reset": "all",
    },
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects as its argument an array of input sequences.
        `),
    },
    getSequence: process.env.NODE_ENV !== "development" ? undefined : [
        hi => new RoundRobinSequence([]),
        hi => new RoundRobinSequence([hi([0, 1, 2, 3])]),
        hi => new RoundRobinSequence([hi([0, 1, 2, 3], hi([10, 12, 14, 15]))]),
        hi => new RoundRobinSequence([hi.repeat([1, 2, 3])]),
        hi => new RoundRobinSequence([hi("abc"), hi("xyz"), hi("123")]),
        hi => new RoundRobinSequence([hi("hello"), hi("how"), hi("are you")]),
        hi => new RoundRobinSequence([hi("hello"), hi("how"), hi.repeat("hi")]),
        hi => new RoundRobinSequence([hi.repeat("hi"), hi.repeat("hello")]),
    ],
    constructor: function RoundRobinSequence(
        sources, sourceIndex = undefined, activeSources = undefined
    ){
        this.sources = sources;
        this.source = sources[0];
        this.sourceIndex = sourceIndex || 0;
        this.activeSources = activeSources || [];
        for(const source of sources){
            this.maskAbsentMethods(source);
            if(!activeSources && !source.done()){
                this.activeSources.push(source);
            }
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
            if(source.unbounded()) return true;
        }
        return true;
    },
    done: function(){
        return this.activeSources.length === 0;
    },
    length: function(){
        let sum = 0;
        for(const source of this.sources) sum += source.length();
        return sum;
    },
    left: function(){
        let sum = 0;
        for(const source of this.activeSources) sum += source.left();
        return sum;
    },
    front: function(){
        return this.activeSources[this.sourceIndex].front();
    },
    popFront: function(){
        this.activeSources[this.sourceIndex].popFront();
        if(this.activeSources[this.sourceIndex].done()){
            this.activeSources.splice(this.sourceIndex, 1);
        }else{
            this.sourceIndex++;
        }
        if(this.sourceIndex >= this.activeSources.length) this.sourceIndex = 0;
    },
    back: null,
    popBack: null,
    // TODO: Implement indexing and possibly slicing (this might be tricky)
    index: null,
    slice: null,
    copy: function(){
        const sourceCopies = [];
        const activeCopies = [];
        for(const source of this.sources){
            sourceCopies.push(source.copy());
            for(const active of this.activeSources){
                if(active === source){
                    activeCopies.push(active);
                    break;
                }
            }
        }
        return new RoundRobinSequence(
            sourceCopies, this.sourceIndex, activeCopies
        );
    },
    reset: function(){
        this.sourceIndex = 0;
        this.activeSources = [];
        for(const source of this.sources){
            source.reset();
            if(!source.done()) this.activeSources.push(source);
        }
        return this;
    },
    rebase: function(source){
        this.source = source;
        this.sources[0] = source;
        if(!source.done()) this.activeSources[0] = source;
        return this;
    },
});

export const roundRobin = wrap({
    name: "roundRobin",
    summary: "Get a sequence enumerating elements of several input sequences in turn.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function accepts any number of sequences as input.
        `),
        returns: (`
            The function returns a sequence enumerating the elements of the
            input sequences in turn; the frontmost element of each input
            sequence is enumerated in order, then the next frontmost, skipping
            any emptied sequences, until all of the input sequences have been
            fully consumed.
            /When, for example, there were two input sequences, the output
            sequence enumerates the first element of the first sequence, then
            the first element of the second sequence, followed by the second
            element of the first sequence, then the second element of the
            second sequence, and so on.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "concat",
        ],
        links: [
            {
                description: "A definition of the term \"round robin\".",
                url: "http://whatis.techtarget.com/definition/round-robin",
            },
        ],
    },
    attachSequence: true,
    async: false,
    sequences: [
        RoundRobinSequence
    ],
    arguments: {
        unordered: {
            sequences: "*"
        }
    },
    implementation: (sources) => {
        if(sources.length === 0){
            return new EmptySequence();
        }else if(sources.length === 1){
            return sources[0];
        }else{
            return new RoundRobinSequence(sources);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assertEqual(hi.roundRobin("abc", "123", "XYZ"), "a1Xb2Yc3Z");
        },
        "noInputs": hi => {
            hi.assertEmpty(hi.roundRobin());
        },
        "oneInput": hi => {
            hi.assertEqual(hi.roundRobin([1, 2, 3]), [1, 2, 3]);
        },
        "differentLengthInputs": hi => {
            hi.assertEqual(hi.roundRobin("hi", "hello"), "hhiello");
            hi.assertEqual(hi.roundRobin("abc", "x"), "axbc");
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.roundRobin([]));
            hi.assertEmpty(hi.roundRobin([], []));
            hi.assertEqual(hi.roundRobin("", "hello"), "hello");
            hi.assertEqual(hi.roundRobin("aaa", "", "xyz"), "axayaz");
        },
        "unboundedInput": hi => {
            const seq0 = hi.roundRobin(hi.repeatElement("!"), "abc");
            hi.assert(seq0.unbounded());
            hi.assert(seq0.startsWith("!a!b!c!!!!!!"));
            const seq1 = hi.roundRobin("a", "xyz", hi.repeat("!?"));
            hi.assert(seq1.unbounded());
            hi.assert(seq1.startsWith("ax!y?z!?!?!?"));
            const seq2 = hi.roundRobin(hi.repeat("ab"), hi.repeat("123"));
            hi.assert(seq2.unbounded());
            hi.assert(seq2.startsWith("a1b2a3b1a2b3"));
        },
    },
});

export default roundRobin;
