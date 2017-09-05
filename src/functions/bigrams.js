import {defineSequence} from "../core/defineSequence";
import {wrap} from "../core/wrap";

import {SlicingNgramSequence, TrackingNgramSequence} from "./ngrams";

export const bigrams = wrap({
    name: "bigrams",
    summary: "Get a sequence enumerating bigrams of an input sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single sequence as input.
        `),
        returns: (`
            The function returns a sequence enumerating the bigrams of the
            input sequence.
        `),
        returnType: "sequence",
        examples: [
            "basicUsage",
        ],
        related: [
            "ngrams", "trigrams",
        ],
        links: [
            {
                description: "Information about bigrams on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Bigram",
            },
        ],
    },
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence,
    },
    implementation: (source) => {
        if(source.nativeLength && source.nativeSlice){
            return new SlicingNgramSequence(2, source);
        }else{
            return new TrackingNgramSequence(2, source);
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const words = ["hello", "world", "how", "do?"];
            hi.assertEqual(hi.bigrams(words), [
                ["hello", "world"], ["world", "how"], ["how", "do?"]
            ]);
        },
        "emptyInput": hi => {
            hi.assertEmpty(hi.emptySequence().bigrams());
        },
        "unboundedInput": hi => {
            const seq = hi.counter().bigrams();
            hi.assert(seq.startsWith(hi.isEqual, [[0, 1], [1, 2], [2, 3], [3, 4]]));
        },
    },
});

export default bigrams;
