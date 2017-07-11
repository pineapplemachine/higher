import {asSequence} from "../core/asSequence";
import {error} from "../core/error";
import {isSequence} from "../core/sequence";
import {isArray, isString} from "../core/types";

export const BoundsUnknownError = error({
    summary: "Failed because a sequence must be known to be bounded or unbounded.",
    constructor: function BoundsUnknownError(source, options){
        this.source = source;
        this.options = options || {};
        const sourceType = (isSequence(source) ?
            source.typeChainString() + " sequence" : "iterable"
        );
        this.message = (
            "The action requires knowing whether the input is bounded or " +
            "unbounded, but the ${sourceType} is not known to be either. " +
            "Try using a method such as 'head', 'limit', 'assumeBounded', or " +
            "'assumeUnbounded' to resolve this error."
        );
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
    enforce: function(source, options){
        if(
            (isSequence(source) && (source.bounded() || source.unbounded())) ||
            isArray(source) || isString(source)
        ){
            return source;
        }
        for(const converter of asSequence.converters){
            if(converter.predicate(source)){
                if(converter.bounded(source) || converter.unbounded(source)){
                    return source;
                }else{
                    break;
                }
            }
        }
        throw BoundsUnknownError(source, options);
    },
});

export default BoundsUnknownError;
