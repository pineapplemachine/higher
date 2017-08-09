import {asSequence} from "../core/asSequence";
import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {ForwardFlattenSequence} from "./flatten";

export const ForwardJoinSequence = defineSequence({
    constructor: function ForwardJoinSequence(
        source, delimiter, frontSource = undefined,
        frontDelimiter = undefined, onDelimiter = undefined
    ){
        this.source = source;
        this.delimiter = delimiter;
        this.frontSource = frontSource;
        this.frontDelimiter = frontDelimiter;
        this.onDelimiter = onDelimiter;
    },
    reverse: function(){
        return new BackwardJoinSequence(this.source, this.delimiter);
    },
    initialize: function(){
        if(this.source.done()){
            this.front = () => undefined;
            this.popFront = () => {};
        }else if(this.delimiter.done()){
            this.frontSource = asSequence(this.source.nextFront());
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = asSequence(this.source.nextFront());
            }
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return this.frontSource.front();
            };
            this.popFront = function(){
                this.frontSource.popFront();
                while(this.frontSource.done() && !this.source.done()){
                    this.frontSource = asSequence(this.source.nextFront());
                }
            };
        }else{
            this.frontDelimiter = this.delimiter.copy();
            this.frontSource = asSequence(this.source.nextFront());
            this.onDelimiter = this.frontSource.done();
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return (this.onDelimiter ?
                    this.frontDelimiter.front() : this.frontSource.front()
                );
            };
            this.popFront = function(){
                if(this.onDelimiter){
                    this.frontDelimiter.popFront();
                    if(this.frontDelimiter.done()){
                        this.frontDelimiter = this.delimiter.copy();
                        this.onDelimiter = false;
                    }
                }else if(!this.frontSource.done()){
                    this.frontSource.popFront();
                    if(this.frontSource.done() && !this.source.done()){
                        this.frontSource = asSequence(this.source.nextFront());
                        this.onDelimiter = true;
                    }
                }else if(!this.source.done()){
                    this.frontSource = asSequence(this.source.nextFront());
                    this.onDelimiter = true;
                }
            };
        }
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const BackwardJoinSequence = defineSequence({
    constructor: function BackwardJoinSequence(
        source, delimiter, frontSource = undefined,
        frontDelimiter = undefined, onDelimiter = undefined
    ){
        this.source = source;
        this.delimiter = delimiter;
        this.frontSource = frontSource;
        this.frontDelimiter = frontDelimiter;
        this.onDelimiter = onDelimiter;
    },
    reverse: function(){
        return new ForwardJoinSequence(this.source, this.delimiter);
    },
    initialize: function(){
        if(this.source.done()){
            this.front = () => undefined;
            this.popFront = () => {};
        }else if(this.delimiter.done()){
            this.frontSource = asSequence(this.source.nextBack());
            while(this.frontSource.done() && !this.source.done()){
                this.frontSource = asSequence(this.source.nextBack());
            }
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return this.frontSource.back();
            };
            this.popFront = function(){
                this.frontSource.popBack();
                while(this.frontSource.done() && !this.source.done()){
                    this.frontSource = asSequence(this.source.nextBack());
                }
            };
        }else{
            this.frontDelimiter = this.delimiter.copy();
            this.frontSource = asSequence(this.source.nextBack());
            this.onDelimiter = this.frontSource.done();
            this.done = function(){
                return this.source.done() && this.frontSource.done();
            };
            this.front = function(){
                return (this.onDelimiter ?
                    this.frontDelimiter.back() : this.frontSource.back()
                );
            };
            this.popFront = function(){
                if(this.onDelimiter){
                    this.frontDelimiter.popBack();
                    if(this.frontDelimiter.done()){
                        this.frontDelimiter = this.delimiter.copy();
                        this.onDelimiter = false;
                    }
                }else if(!this.frontSource.done()){
                    this.frontSource.popBack();
                    if(this.frontSource.done() && !this.source.done()){
                        this.frontSource = asSequence(this.source.nextBack());
                        this.onDelimiter = true;
                    }
                }else if(!this.source.done()){
                    this.frontSource = asSequence(this.source.nextBack());
                    this.onDelimiter = true;
                }
            };
        }
    },
    bounded: () => false,
    unbounded: () => false,
    done: function(){
        return this.source.done();
    },
    length: null,
    left: null,
    front: function(){
        this.initialize();
        return this.front();
    },
    popFront: function(){
        this.initialize();
        return this.popFront();
    },
    rebase: function(source){
        this.source = source;
        return this;
    },
});

export const join = wrap({
    name: "join",
    attachSequence: true,
    async: false,
    sequences: [
        ForwardJoinSequence,
        BackwardJoinSequence
    ],
    arguments: {
        ordered: [wrap.expecting.sequence, wrap.expecting.sequence]
    },
    implementation: (source, delimiter) => {
        if(delimiter && !delimiter.done()){
            return new ForwardJoinSequence(source, copyable(delimiter));
        }else{
            // Optimized implementation for when there is no delimiter
            // or when the delimiter is an empty sequence.
            return new ForwardFlattenSequence(source);
        }
    },
});

export default join;
