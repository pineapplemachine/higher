import {defineSequence} from "../core/defineSequence";
import {ConcatSequence} from "./concat";
import {DropHeadSequence} from "./dropHead";
import {DropTailSequence} from "./dropTail";
import {EmptySequence} from "./emptySequence";
import {wrap} from "../core/wrap";

export const DropSliceSequence = defineSequence({
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects two numbers and an input sequence as input.
            The first number, being the inclusive low bound of the slice to drop,
            must be greater than zero. The second number is the exclusive high
            bound of the slice to drop.
        `),
    },
    constructor: function DropSliceSequence(dropLow, dropHigh, source){
        this.dropLow = dropLow < 0 ? 0 : dropLow;
        this.dropHigh = dropHigh;
        if(source.length){
            const length = source.length();
            if(this.dropHigh > length) this.dropHigh = length;
        }
        this.source = source;
        this.dropLength = dropHigh - dropLow;
        this.frontIndex = 0;
        this.backIndex = 0;
        this.droppedSlice = false;
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
        return this.source.length() - this.dropLength;
    },
    left: function(){
        return this.droppedSlice ? this.source.left() : (
            this.source.left() - this.dropLength
        );
    },
    front: function(){
        return this.source.front();
    },
    popFront: function(){
        this.source.popFront();
        this.frontIndex++;
        if(!this.droppedSlice && this.frontIndex >= this.dropLow){
            for(let i = 0; i < this.dropLength && !this.source.done(); i++){
                this.source.popFront();
            }
            this.droppedSlice = true;
        }
    },
    back: function(){
        return this.source.back();
    },
    popBack: function(){
        this.source.popBack();
        this.backIndex--;
        if(!this.droppedSlice && this.backIndex <= this.dropHigh){
            for(let i = 0; i < this.dropLength && !this.source.done(); i++){
                this.source.popBack();
            }
            this.droppedSlice = true;
        }
    },
    index: function(i){
        return this.source.index(
            i < this.dropLow ? i : i + this.dropLength
        );
    },
    get: function(i){
        return this.source.get(i);
    },
    copy: function(){
        const copy = new DropSliceSequence(this.strideLength, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});

export const dropSlice = wrap({
    name: "dropSlice",
    attachSequence: true,
    async: false,
    arguments: {
        numbers: 2,
        sequences: 1
    },
    implementation: (slice, source) => {
        const dropLow = slice[0];
        const dropHigh = slice[1];
        if(dropLow >= dropHigh){
            return source;
        }else if(source.slice && source.length){
            const length = source.length();
            if(dropLow <= 0 && dropHigh >= length){
                return new EmptySequence();
            }else{
                return new ConcatSequence([
                    source.slice(0, dropLow), source.slice(dropHigh, length),
                ]);
            }
        }else if(dropLow <= 0){
            if(source.length && dropHigh >= source.length()){
                return new EmptySequence();
            }else{
                return new DropHeadSequence(dropHigh, source);
            }
        }else if(source.length){
            const length = source.length();
            if(dropHigh >= length){
                return new DropTailSequence(length - dropLow, source);
            }
        }
        return new DropSliceSequence(
            dropLow, dropHigh, source
        );
    },
});

export default dropSlice;
