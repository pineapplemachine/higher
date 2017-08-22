import {error} from "../core/error";
import {isArray, isString} from "../core/types";

export const NotBoundedError = error({
    summary: "Action would require fully consuming a sequence not known to be bounded.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The error function expects as an argument the sequence which was
            required to be known to be bounded, but was not.
        `),
    },
    constructor: function NotBoundedError(source, options = undefined){
        this.source = source;
        this.options = options || {};
        const knownBounded = (source.unbounded() ?
            "known to be unbounded" : "not known to be bounded"
        );
        this.message = (
            "The action requires fully consuming a sequence that is " +
            `${knownBounded}. ` +
            "The \`head\`, \`limit\`, and \`assumeBounded\` functions are some " +
            "options for resolving this error by acquiring a known-bounded " +
            "sequence from one not otherwise known to be bounded."
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
