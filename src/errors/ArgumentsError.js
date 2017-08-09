import {error} from "../core/error";
import {describeExpecting, describeExpectingViolation} from "../core/describeExpecting";

export const ArgumentsError = error({
    summary: "Function was called with invalid arguments.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    constructor: function ArgumentsError(options = undefined){
        this.options = options || {};
        this.expects = this.options.expects;
        this.violation = this.options.violation;
        this.message = (
            `The ${options.isConstructor ? "constructor" : "function"} was ` +
            "called with invalid arguments."
        );
        if(this.violation){
            this.violationInfo = describeExpectingViolation(
                options.expects, options.violation
            );
            this.message += " " + this.violationInfo.message;
        }
        if(this.expects){
            this.message += " " + describeExpecting(options.expects);
        }
        if(this.violationInfo && this.violationInfo.suggestion){
            this.message += " " + this.violationInfo.suggestion;
        }
        if(this.options.message){
            this.message = this.options.message + ": " + this.message;
        }
    },
});

export default ArgumentsError;
