import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const countBy = wrap({
    name: "countBy",
    summary: "Get an object associating keys with the number of corresponding elements.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded input sequence and a
            transformation function.
        `),
        returns: (`
            The function constructs and returns an object whose keys are the
            values returned by applying the transformation function to the
            elements of the input and whose values are integer counts of those
            elements which produced the corresponding key.
        `),
        related: [
            "groupBy"
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
            object[key] = (object[key] || 0) + 1;
        }
        return object;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const firstLetter = (i) => (i[0]);
            const strings = ["hello", "and", "how", "are", "you"];
            hi.assertEqual(hi.countBy(strings, firstLetter),
                {"h": 2, "a": 2, "y": 1}
            );
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().countBy(i => i), {});
        },
        "unboundedInput": hi => {
            hi.assertFailWith(NotBoundedError,
                () => hi.counter().countBy(i => i)
            );
        },
    },
});

export default countBy;
