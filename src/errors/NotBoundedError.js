import {error} from "../core/error";
import {isArray, isString} from "../core/types";

export const NotBoundedError = error({
    summary: "Action would require fully consuming a sequence not known to be bounded.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence which was
            required to be known to be bounded, but was not.
            The function also accepts an options object which may have a message
            attribute providing additional error information, and an optional
            limitArgument which, when true, causes the error message to include
            passing a limit argument as a possible way to resolve the issue.
        `),
    },
    constructor: function NotBoundedError(source, options = undefined){
        this.source = source;
        this.options = options || {};
        const knownBounded = (source.unbounded() ?
            "known to be unbounded" : "not known to be bounded"
        );
        this.message = (
            `The action requires fully consuming a sequence that is ` +
            `${knownBounded}. ` +
            "Try using a method such as 'head', 'limit', or 'assumeBounded' to " +
            "resolve this error."
        );
        if(this.options.limitArgument) this.message += " " + (
            "You could alternatively pass a single numeric argument indicating " +
            "the maximum number of elements of the sequence to consume."
        );
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
    enforce: function(source, options){
        if(source.bounded()) return source;
        throw NotBoundedError(source, options);
    },
});

export default NotBoundedError;
