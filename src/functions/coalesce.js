import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

// Get the first element of a sequence that isn't null or undefined.
// When no such element exists, get the last element of the sequence.
// Returns undefined when the input sequence was empty.
export const coalesce = wrap({
    name: "coalesce",
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to coalesce sequence",
        });
        let last = undefined;
        for(const element of source){
            if(element !== undefined && element !== null) return element;
            last = element;
        }
        return last;
    },
});

export default coalesce;
