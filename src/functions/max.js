import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const max = wrap({
    name: "max",
    summary: "Get the maximum element in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        expects: (`
            The function expects a sequence as input and an optional
            [relational function].
            If no relational function was passed, the default relational
            function \`(a, b) => (a < b)\` is used.
        `),
        returns: (`
            The function returns the maximum element in the sequence according
            to the relational function. Functionally, this would be the same
            as [stable-sorting](stable sort) the sequence according to that
            function and taking its back element.
        `),
        related: [
            "min"
        ],
        examples: [
            "basicUsage", "withRelationalFunction"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 1,
            allowIterables: true,
        },
    },
    implementation: (relate, source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to find a maximum element"
        });
        const relateFunc = relate || constants.defaults.relationalFunction;
        let max = undefined;
        let first = true;
        for(const element of source){
            if(first){
                max = element;
                first = false;
            }else if(relateFunc(max, element)){
                max = element;
            }
        }
        return max;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.max([1, 2, 3, 4, 5]) === 5);
        },
        "withRelationalFunction": hi => {
            const strings = ["hello", "how", "goes", "it"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.max(strings, byLength) === "hello");
        },
        "stability": hi => {
            const strings = ["abc", "hello", "xyz", "world"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.max(strings, byLength) === "hello");
            hi.assert(hi.reverse(strings).max(byLength) === "world");
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().max());
        },
        "notKnownBoundedInput": hi => {
            hi.assertFail(
                (error) => (error.type === "NotBoundedError"),
                () => hi.recur(i => i + 1).seed(0).until(i => i === 20).max()
            );
        },
        "unboundedInput": hi => {
            hi.assertFail(
                (error) => (error.type === "NotBoundedError"),
                () => hi.counter().max()
            );
        },
    },
});

export default max;
