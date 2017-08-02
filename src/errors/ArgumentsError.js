import {error} from "../core/error";

export const ArgumentsError = error({
    summary: "Function was called with invalid arguments.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    constructor: function ArgumentsError(options = undefined){
        this.options = options || {};
        this.message = (
            `The ${options.isConstructor ? "constructor" : "function"} was ` +
            "called with invalid arguments."
        );
        if(this.options.expects){
            this.message += " " + this.options.expects;
        }
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
});

export default ArgumentsError;
