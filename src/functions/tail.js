import {wrap} from "../core/wrap";

import {EmptySequence} from "./empty";

// Get a sequence for enumerating the last so many elements of the input.
// The resulting sequence may be shorter than the length specified, but
// will never be longer.
export const tail = wrap({
    name: "tail",
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (elements, source) => {
        if(elements < 1){
            return new EmptySequence();
        }else if(source.length && source.slice){
            const length = source.length();
            const slice = length < elements ? length : elements;
            return source.slice(length - slice, length);
        }else if(source.bounded()){
            source.forceEager();
            return source.slice(source.length() - elements);
        }else{
            throw "Failed to get tail: Input must be known to be bounded.";
        }
    },
});

export default tail;
