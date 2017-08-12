import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {SlicingNgramSequence, TrackingNgramSequence} from "./ngrams";

export const trigrams = wrap({
    name: "trigrams",
    summary: "Get a sequence enumerating trigrams of an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single sequence as input.
        `),
        returns: (`
            The function returns a sequence enumerating the trigrams of the
            input sequence.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "ngrams", "bigrams",
        ],
        links: [
            {
                description: "Information about trigrams on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Trigram",
            },
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: (source) => {
        if(source.length && source.slice && source.bounded()){
            return new SlicingNgramSequence(3, source);
        }else{
            return new TrackingNgramSequence(3, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const words = ["hello", "world", "how", "do?"];
            hi.assertEqual(hi.trigrams(words), [
                ["hello", "world", "how"], ["world", "how", "do?"]
            ]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().trigrams());
        },
        "unboundedInput": hi => {
            const seq = hi.counter().trigrams();
            hi.assert(seq.startsWith(hi.isEqual, [[0, 1, 2], [1, 2, 3], [2, 3, 4]]));
        },
    },
});

export default trigrams;
