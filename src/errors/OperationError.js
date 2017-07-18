import {error} from "../core/error";

export const OperationError = error({
    summary: "Action failed because a sequence did not support the required operations.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as arguments the sequence which was
            required to support the operations and an array containing as strings
            all the operations the sequence was expected to support.
            The function also accepts an options object which may have a message
            attribute providing additional error information.
        `),
    },
    constructor: function OperationError(
        sequence, operations, options = undefined
    ){
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
            if(!sequence[operation]) throw OperationError(
                sequence, operations, options
            );
        }
        return sequence;
    },
});

export default OperationError;
