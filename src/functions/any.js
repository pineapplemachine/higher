import {wrap} from "../core/wrap";

export const any = wrap({
    name: "any",
    summary: "Get whether any elements in a sequence satisfy a predicate.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        detail: (`
            Get whether any of the elements in an input sequence satisfy an
            optional predicate or, if no predicate was provided, whether any
            elements of the input are truthy.
        `),
        expects: (`
            The function expects as input a sequence known to be bounded and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns @true when any element in the sequence
            satisfied the predicate or, if no predicate was given, if any of the
            elements were truthy. The function returns @false otherwise, or
            if the sequence was empty.
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
                message: "Failed to determine whether any elements satisfied the predicate"
            });
            for(const element of source){
                if(predicate(element)) return true;
            }
        }else{
            NotBoundedError.enforce(source, {
                message: "Failed to determine whether any elements were truthy"
            });
            for(const element of source){
                if(element) return element;
            }
        }
        return false;
    },
});

export default any;
