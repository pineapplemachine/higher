import {callAsync} from "../core/callAsync";
import {wrap} from "../core/wrap";

export const SequenceCounter = function(predicate, source){
    this.predicate = predicate;
    this.source = source;
    if(!source.copy) this.copy = null;
    if(!source.reset) this.reset = null;
};

SequenceCounter.prototype.constructor = SequenceCounter;
Object.assign(SequenceCounter.prototype, {
    sum: function(){
        let i = 0;
        for(const element of this.source){
            i += this.predicate(element) ? 1 : 0;
        }
        return i;
    },
    equals: function(n){
        let i = 0;
        for(const element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i > n) return false;
        }
        return i === +n;
    },
    lessThan: function(n){
        let i = 0;
        for(const element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i >= n) return false;
        }
        return true;
    },
    lessThanEqual: function(n){
        let i = 0;
        for(const element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i > n) return false;
        }
        return true;
    },
    greaterThan: function(n){
        let i = 0;
        for(const element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i > n) return true;
        }
        return false;
    },
    greaterThanEqual: function(n){
        let i = 0;
        for(const element of this.source){
            i += this.predicate(element) ? 1 : 0;
            if(i >= n) return true;
        }
        return false;
    },
    copy: function(){
        return new SequenceCounter(this.predicate, this.source.copy());
    },
    reset: function(){
        this.source.reset();
        return this;
    },
});
Object.assign(SequenceCounter.prototype, {
    sumAsync: function(){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.sum()));
        });
    },
    equalsAsync: function(n){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.equals(n)));
        });
    },
    lessThanAsync: function(n){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.lessThan(n)));
        });
    },
    lessThanEqualAsync: function(n){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.lessThanEqual(n)));
        });
    },
    greaterThanAsync: function(n){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.greaterThan(n)));
        });
    },
    greaterThanEqualAsync: function(n){
        return new hi.Promise((resolve, reject) => {
            callAsync(() => resolve(this.greaterThanEqual(n)));
        });
    },
});

export const count = wrap({
    name: "count",
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (predicate, source) => {
        return new SequenceCounter(predicate, source);
    },
});

export default count;
