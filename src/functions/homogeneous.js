import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const homogeneous = wrap({
    name: "homogeneous",
    summary: "Get whether all elements in a sequence are equivalent.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether all the elements in the input sequence following the
            first element are equal to that first element according to a
            comparison function.
        `),
        expects: (`
            The function expects one known-bounded input sequence and an
            optional comparison function.
            When no comparison function is provided, the function uses the
            default comparison \`a === b\`.
        `),
        returns: (`
            The function returns true when all elements following the first
            element were equivalent to that first element according to the
            comparison function and false otherwise.
            The function returns true when the input was an empty sequence,
            or when there was only one element.
        `),
        throws: (`
            The function throws a @NotBoundedError when the input sequence was
            not known to be bounded.
        `),
        examples: [
            "basicUsage",
        ],
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
    implementation: (compare, source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to determine sequence homogeneity",
        });
        const compareFunc = compare || constants.defaults.comparisonFunction;
        let first = true;
        let firstElement = null;
        for(const element of source){
            if(first){
                firstElement = element;
                first = false;
            }else if(!compareFunc(element, firstElement)){
                return false;
            }
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const differentStrings = ["how", "are", "you", "?"];
            hi.assertNot(hi.homogeneous(differentStrings));
            const sameStrings = ["he", "he", "he"];
            hi.assert(hi.homogeneous(sameStrings));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().homogeneous());
        },
        "singleLengthInput": hi => {
            hi.assert(hi.homogeneous("!"));
            hi.assert(hi.homogeneous([0]));
            hi.assert(hi.homogeneous("?", (a, b) => false));
        },
        "compareArrays": hi => {
            hi.assert(hi.homogeneous([[0, 1], [0, 1]], hi.isEqual));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().homogeneous());
        },
    },
});

export default homogeneous;
