import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const min = wrap({
    name: "min",
    summary: "Get the minimum element in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence as input and an optional
            [relational function].
            If no relational function was passed, the default relational
            function \`(a, b) => (a < b)\` is used.
        `),
        returns: (`
            The function returns the minimum element in the sequence according
            to the relational function. Functionally, this would be the same
            as [stable-sorting](stable sort) the sequence according to that
            function and taking its front element.
        `),
        related: [
            "max"
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
            message: "Failed to find a minimum element"
        });
        const relateFunc = relate || constants.defaults.relationalFunction;
        let min = undefined;
        let first = true;
        for(const element of source){
            if(first){
                min = element;
                first = false;
            }else if(relateFunc(element, min)){
                min = element;
            }
        }
        return min;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.min([5, 4, 3, 2, 1]) === 1);
        },
        "withRelationalFunction": hi => {
            const strings = ["hello", "how", "goes", "it"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.min(strings, byLength) === "it");
        },
        "stability": hi => {
            const strings = ["abc", "hello", "xyz", "world"];
            const byLength = (a, b) => (a.length < b.length);
            hi.assert(hi.min(strings, byLength) === "abc");
            hi.assert(hi.reverse(strings).min(byLength) === "xyz");
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().min());
        },
        "notKnownBoundedInput": hi => {
            hi.assertFailWith(NotBoundedError,
                () => hi.recur(i => i + 1).seed(0).until(i => i === 20).min()
            );
        },
        "unboundedInput": hi => {
            hi.assertFailWith(NotBoundedError,
                () => hi.counter().min()
            );
        },
    },
});

export default min;
