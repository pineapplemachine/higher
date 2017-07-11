import {error} from "../core/error";

export const OperationError = error({
    summary: "Action failed because a sequence did not support the required operations.",
    constructor: function OperationNotSupportedError(sequence, operations, options){
        this.sequence = sequence;
        this.operations = isString(operations) ? [operations] : operations;
        this.options = options || {};
        this.message = (
            `The action requires ${joinSeries(this.operations)} operations, ` +
            `but the ${sequence.typeChainString()} input sequence does not ` +
            `support all of them.`
        );
        if(options.message){
            this.message = options.message + ": " + this.message;
        }
    },
    enforce: function(sequence, operations, options){
        for(const operation of operations){
            if(!sequence[operation]) throw OperationNotSupportedError(
                sequence, operations, options
            );
        }
        return sequence;
    },
});

export default OperationError;
