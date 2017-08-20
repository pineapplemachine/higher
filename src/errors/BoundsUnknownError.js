import {error} from "../core/error";
import {isArray, isString} from "../core/types";

export const BoundsUnknownError = error({
    summary: "Failed because a sequence must be known to be bounded or unbounded.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence which was
            required to be known to be bounded or unbounded, but was not.
            The function also accepts an options object which may have a message
            attribute providing additional error information.
        `),
    },
    constructor: function BoundsUnknownError(source, options){
        this.source = source;
        this.options = options || {};
        this.message = (
            "The action requires knowing whether the input is bounded or " +
            "unbounded, but the sequence is not known to be either. " +
            "Try using a method such as 'head', 'limit', 'assumeBounded', or " +
            "'assumeUnbounded' to resolve this error."
        );
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
    enforce: function(source, options){
        if(source.bounded() || source.unbounded()) return source;
        throw BoundsUnknownError(source, options);
    },
});

export default BoundsUnknownError;
