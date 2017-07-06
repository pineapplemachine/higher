import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {NgramSequence} from "./ngrams";

export const trigrams = wrap({
    name: "trigrams",
    attachSequence: true,
    async: false,
    sequences: [
        NgramSequence
    ],
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        return new NgramSequence(3, source);
    },
});

export default trigrams;
