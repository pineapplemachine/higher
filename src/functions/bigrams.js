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
});

export default bigrams;
