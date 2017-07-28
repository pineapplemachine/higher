import {error} from "../core/error";

export const ArgumentsError = error({
    summary: "Function was called with invalid arguments.",
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
    constructor: function ArgumentsError(options = undefined){
        this.options = options || {};
        this.message = (
            `The ${options.isConstructor ? "constructor" : "function"} received ` +
            "invalid arguments."
        );
        if(this.options.detail){
            this.message += " " + this.options.detail;
        }
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
});

export default ArgumentsError;
