import {Sequence} from "../core/sequence";
import {wrap} from "../core/wrap";

import {SlicingNgramSequence, TrackingNgramSequence} from "./ngrams";

export const trigrams = wrap({
    name: "trigrams",
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
            return new SlicingNgramSequence(3, source);
        }else{
            return new TrackingNgramSequence(3, source);
        }
    },
});

export default trigrams;
