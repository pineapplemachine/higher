import {constants} from "../core/constants";
import {isEqual} from "../core/isEqual";
import {wrap} from "../core/wrap";

export const defaultUniformComparison = isEqual;

export const uniform = wrap({
    name: "uniform",
    summary: "Get whether all elements in a sequence are equivalent.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one known-bounded input sequence and an
            optional comparison function.
            When no comparison function was provided, @isEqual is used as
            a default.
        `),
        returns: (`
            The function returns #true when all elements following the first
            element were equivalent to their respecting preceding elements,
            according to the comparison function.
            The function returns #false when any element was not equivalent to
            its predecessor. It returns #true when the input sequence was empty
            or contained only one element.
        `),
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.comparison},
            sequences: {one: wrap.expecting.boundedSequence},
        }
    },
    implementation: (compare, source) => {
        const compareFunc = compare || defaultUniformComparison;
        let first = true;
        let lastElement = undefined;
        for(const element of source){
            if(first){
                first = false;
            }else if(!compareFunc(element, lastElement)){
                return false;
            }
            lastElement = element;
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const differentStrings = ["how", "are", "you", "?"];
            hi.assertNot(hi.uniform(differentStrings));
            const sameStrings = ["he", "he", "he"];
            hi.assert(hi.uniform(sameStrings));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().uniform());
        },
        "singleLengthInput": hi => {
            hi.assert(hi.uniform("!"));
            hi.assert(hi.uniform([0]));
            hi.assert(hi.uniform("?", (a, b) => false));
        },
        "compareArrays": hi => {
            hi.assert(hi.uniform([[0, 1], [0, 1]]));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().uniform());
        },
    },
});

export default uniform;
