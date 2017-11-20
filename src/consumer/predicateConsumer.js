import {isFunction} from "../core/types";

import {defineConsumer} from "./defineConsumer";

export const PredicateConsumer = defineConsumer({
    summary: "Match a sequence of elements all satisfying a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a predicate function as its single argument.
        `),
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "numberInputs": hi => {
            const even = new PredicateConsumer(n => n % 2 === 0);
            hi.assert(hi.match([0]), even);
            hi.assert(hi.match([0, 2, 4, 6, 8], even));
            hi.assertNot(hi.emptySequence().match(even));
            hi.assertNot(hi.match([1], even));
            hi.assertNot(hi.match([1, 2, 3, 4], even));
            hi.assertNot(hi.match([0, 2, 5, 8], even));
        },
    },
    converter: {
        predicate: isFunction,
    },
    constructor: function PredicateConsumer(
        predicate, lastMatch = undefined, anyMatch = undefined
    ){
        this.predicate = predicate;
        this.lastMatch = lastMatch;
        this.anyMatch = anyMatch;
    },
    pushFront: function(element){
        this.lastMatch = this.predicate(element);
        if(this.lastMatch){
            this.anyMatch = this.lastMatch;
        }
    },
    pushBack: function(element){
        this.lastMatch = this.predicate(element);
        if(this.lastMatch){
            this.anyMatch = this.lastMatch;
        }
    },
    pushEnd: function(){
        this.lastMatch = false;
    },
    done: function(){
        return !this.lastMatch;
    },
    match: function(){
        return this.anyMatch;
    },
    copy: function(){
        return new PredicateConsumer(
            this.predicate, this.lastMatch, this.anyMatch
        );
    },
});
