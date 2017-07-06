import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {NgramSequence} from "./ngrams";

export const bigrams = wrap({
    name: "bigrams",
    attachSequence: true,
    async: false,
    sequences: [
        NgramSequence
    ],
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return new NgramSequence(2, source);
    },
});

export default bigrams;
