import {validAsSequence} from "../core/asSequence";
import {isEqual} from "../core/isEqual";

import {defineConsumer} from "./defineConsumer";

export const defaultConsumerComparison = isEqual;

export const ComparisonConsumer = defineConsumer({
    summary: "Match a sequence of elements equal to the corresponding elements of another sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The constructor expects a sequence and an optional comparison
            function as input.
            When no comparison function was given, @isEqual is used as a
            default.
        `),
    },
    converter: {
        predicate: validAsSequence,
        after: {
            PredicateConsumer: true,
        },
    },
    constructor: function ComparisonConsumer(
        source, compare = undefined, anyFail = undefined
    ){
        this.source = source;
        this.compare = compare || defaultConsumerComparison;
        this.anyFail = anyFail;
        if(!source.back){
            this.pushBack = undefined;
        }
    },
    pushFront: function(element){
        if(!this.anyFail){
            const match = this.compare(element, this.source.nextFront());
            if(!match){
                this.anyFail = true;
            }
        }
    },
    pushBack: function(element){
        if(!this.anyFail){
            const match = this.compare(element, this.source.nextBack());
            if(!match){
                this.anyFail = true;
            }
        }
    },
    pushEnd: function(){
        this.anyFail = this.anyFail || !this.source.done();
    },
    done: function(){
        return this.anyFail || this.source.done();
    },
    match: function(){
        return !this.anyFail && this.source.done();
    },
    copy: function(){
        return new ComparisonConsumer(this.source, this.compare, this.anyFail);
    },
});
