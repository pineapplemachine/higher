import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const groupBy = wrap({
    name: "groupBy",
    summary: "Get an object associating keys with lists of elements.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded input sequence and a
            transformation function.
        `),
        returns: (`
            The function constructs and returns an object whose keys are the
            values returned by applying the transformation function to the
            elements of the input and whose values are lists of those elements
            which produced the corresponding key.
        `),
        related: [
            "countBy"
        ],
        examples: [
            "basicUsage"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (transform, source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to group elements in sequence",
        });
        const object = {};
        for(const element of source){
            const key = transform(element);
            if(object[key]) object[key].push(element);
            else object[key] = [element];
        }
        return object;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const firstLetter = (i) => (i[0]);
            const strings = ["hello", "and", "how", "are", "you"];
            hi.assertEqual(hi.groupBy(strings, firstLetter),
                {"h": ["hello", "how"], "a": ["and", "are"], "y": ["you"]}
            );
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().groupBy(i => i), {});
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().groupBy(i => i));
        },
    },
});

export default groupBy;
