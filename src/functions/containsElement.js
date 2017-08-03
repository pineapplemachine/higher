import {isEqual} from "../core/isEqual";
import {wrap} from "../core/wrap";

export const containsElement = wrap({
    name: "containsElement",
    summary: "Get whether a sequence contains any element equal to a given value.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as inputs a known-bounded sequence and a
            value to check each element for equality with.
        `),
        returns: (`
            The function returns @true if any element in the input sequence was
            equivalent to the given value according to the @isEqual function.
            The function returns false otherwise, or if the input sequence was
            empty.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "find", "any",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        ordered: [wrap.expecting.boundedSequence, wrap.expecting.anything]
    },
    implementation: (source, element) => {
        for(const sourceElement of source){
            if(isEqual(element, sourceElement)) return true;
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["hello", "there", "friend"];
            hi.assert(hi.containsElement(strings, "friend"));
            hi.assertNot(hi.containsElement(strings, "enemy"));
        },
        "stringInput": hi => {
            hi.assert(hi("abc").containsElement("a"));
            hi.assertNot(hi("abc").containsElement("!"));
        },
        "emptyInput": hi => {
            hi.assertNot(hi.emptySequence().containsElement(null));
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.repeat("!?").containsElement("x"));
        },
    },
});

export default containsElement;
