import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {SlicingNgramSequence, TrackingNgramSequence} from "./ngrams";

export const bigrams = wrap({
    name: "bigrams",
    attachSequence: true,
    async: false,
    sequences: [
        SlicingNgramSequence,
        TrackingNgramSequence
    ],
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        if(source.length && source.slice && source.bounded()){
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
