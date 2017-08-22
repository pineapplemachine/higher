import {asSequence} from "../core/asSequence";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {FlattenSequence} from "./flatten";

export const JoinSequence = defineSequence({
    constructor: function JoinSequence(
        source, delimiter, frontSource = undefined,
        onDelimiter = undefined, initializedFront = undefined
    ){
        this.source = source;
        this.delimiter = delimiter;
        this.frontSource = frontSource;
        this.onDelimiter = onDelimiter;
        this.initializedFront = initializedFront;
    },
    initializeFront: function(){
        this.initializedFront = true;
        if(this.source.done()){
            this.frontSource = this.source;
        }else if(this.delimiter.done()){
            this.frontSource = asSequence(this.source.nextFront());
            while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
                this.frontSource = asSequence(this.source.nextFront());
            }
        }else{
            this.frontDelimiter = this.delimiter.copy();
            this.frontSource = asSequence(this.source.nextFront());
            this.onDelimiter = this.frontSource.done();
        }
    },
    bounded: () => false,
    unbounded: function(){
        return this.source.unbounded();
    },
    done: function(){
        if(this.initializedFront){
            return this.source.done() && this.frontSource.done();
        }else{
            return this.source.done() && this.delimiter.done();
        }
    },
    front: function(){
        if(!this.initializedFront) this.initializeFront();
        return this.frontSource.front();
    },
    popFront: function(){
        if(!this.initializedFront) this.initializeFront();
        this.frontSource.popFront();
        if(this.frontSource.done()){
            if(this.onDelimiter){
                this.frontSource = asSequence(this.source.nextFront());
                if(!this.frontSource || this.frontSource.done()){
                    this.onDelimiter = true;
                    this.frontSource = this.delimiter.copy();
                }else{
                    this.onDelimiter = false;
                }
            }else if(this.delimiter.done()){
                while((!this.frontSource || this.frontSource.done()) && !this.source.done()){
                    this.frontSource = asSequence(this.source.nextFront());
                }
            }else if(!this.source.done()){
                this.frontSource = this.delimiter.copy();
                this.onDelimiter = true;
            }
        }
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const join = wrap({
    name: "join",
    summary: "Get a sequence from a sequence of sequences, joined by some delimiter.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence of sequences and an optional
            delimiter sequence as input.
        `),
        returns: (`
            The function returns a sequence which enumerates the elements of
            the subsequences of the first input sequence, with the elements
            of the delimiter sequence added in between every subsequence.
            /When no delimiter was provided, the output sequence behaves as
            though it received an empty delimiter.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "concat", "flatten", "split",
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.sequence,
            wrap.expecting.optional(wrap.expecting.sequence)
        ],
    },
    implementation: (source, delimiter) => {
        if(delimiter){
            return new JoinSequence(source, copyable(delimiter));
        }else{
            // Optimized implementation for when there is no delimiter
            return new FlattenSequence(source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["one", "two", "three"];
            hi.assertEqual(hi(strings).join(", "), "one, two, three");
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().join());
            hi.assertEmpty(hi.emptySequence().join(hi.emptySequence()));
            hi.assertEmpty(hi.emptySequence().join(","));
            hi.assertEmpty(hi.emptySequence().join(",,,,,"));
        },
        "noDelimiter": hi => {
            hi.assertEqual(hi([[1, 2], [3, 4]]).join(), [[1, 2], [3, 4]]);
        },
        "emptyDelimiter": hi => {
            hi.assertEqual(hi([[1, 2], [3, 4]]).join([]), [[1, 2], [3, 4]]);
        },
    },
});

export default join;
