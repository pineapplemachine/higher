import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const isSorted = wrap({
    name: "isSorted",
    summary: "Get whether a sequence is sorted in according to a relational function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get whether the elements in a sequence are ordered according to a
            relational function.
        `),
        expects: (`
            The function expects one known-bounded input sequence and an
            optional relational function. If no relational function was
            provided then the default function \`(a, b) => (a < b)\` is
            used.
        `),
        returns: (`
            The function returns true when the input sequence was ordered
            according to the relational function and false otherwise.
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
    implementation: (relate, source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to determine whether sequence was sorted",
        });
        const relateFunc = relate || constants.defaults.relationalFunction;
        let last = undefined;
        let first = true;
        for(const element of source){
            if(first){
                first = false;
            }else if(relateFunc(element, last)){
                return false;
            }
            last = element;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const sortedArray = [0, 1, 2, 3, 4, 5];
            hi.assert(hi.isSorted(sortedArray));
            const unsortedArray = [1, 5, 2, 3, 17, 6];
            hi.assertNot(hi.isSorted(unsortedArray));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().isSorted());
            hi.assert(hi.emptySequence().isSorted((a, b) => false));
        },
        "singleLengthInput": hi => {
            hi.assert(hi.isSorted([0]));
            hi.assert(hi.isSorted(["hello"]));
        },
        "stringSequenceInput": hi => {
            hi.assert(hi.isSorted(["apples", "bears", "cougars"]));
        },
        "duplicateElementsInput": hi => {
            hi.assert(hi.isSorted([0, 0, 0, 0]));
            hi.assert(hi.isSorted((a, b) => (a.length < b.length), ["abc", "xyz"]));
        },
        "descendingOrder": hi => {
            const desc = (a, b) => (a > b);
            hi.assert(hi.isSorted(desc, [3, 2, 1]));
            hi.assertNot(hi.isSorted(desc, [2, 3, 0]));
        },
        "notKnownBoundedInput": hi => {
            hi.assertFail(() => hi.counter().until(i => i < 0).isSorted());
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.recur(i => -i).seed(1).isSorted());
        },
    },
});

export default isSorted;
