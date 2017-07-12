import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const all = wrap({
    name: "all",
    summary: "Get whether all elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        detail: (`
            Get whether all the elements in an input sequence satisfy an
            optional predicate or, if no predicate was provided, whether all
            the elements of the input are truthy.
        `),
        expects: (`
            The function expects as input a sequence known to be bounded and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns @true when all the elements in the sequence
            satisfied the predicate or, if no predicate was given, if all the
            elements were truthy.
            It also returns @true if the sequence was empty.
            The function returns @false otherwise.
        `),
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (predicate, source) => {
        if(predicate){
            NotBoundedError.enforce(source, {
                message: "Failed to determine whether all elements satisfied the predicate"
            });
            for(const element of source){
                if(!predicate(element)) return false;
            }
        }else{
            NotBoundedError.enforce(source, {
                message: "Failed to determine whether all elements were truthy"
            });
            for(const element of source){
                if(element) return element;
            }
        }
        return true;
    },
});

export default all;
