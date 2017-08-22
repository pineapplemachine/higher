import {error} from "../core/error";
import {isArray, isString} from "../core/types";

export const BoundsUnknownError = error({
    summary: "Failed because a sequence must be known to be bounded or unbounded.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence which was
            required to be known to be bounded or unbounded, but was not.
        `),
    },
    constructor: function BoundsUnknownError(source, options){
        this.source = source;
        this.options = options || {};
        this.message = (
            "The action requires knowing whether the input is bounded or " +
            "unbounded, but the sequence is not known to be either. " +
            "The \`head\`, \`limit\`, \`assumeBounded\` and \`assumeBounded\` " +
            "functions are some options for resolving this error by acquiring a " +
            "known-bounded or known-unbounded sequence from one whose bounds " +
            "are not otherwise known."
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
