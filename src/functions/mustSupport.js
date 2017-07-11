import {wrap} from "../core/wrap";

import {EagerSequence} from "./eager";

// TODO: It's probably possible to also cause not-known-bounded sequences
// to support index and slice via traversal, and copy and reset via TeeSequences.
export const mustSupport = wrap({
    name: "mustSupport",
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [wrap.expecting.sequence] // + ...args
    },
    implementation: (source, ...operations) => {
        for(const operation of operations){
            if(!source[operation]) return new EagerSequence(source);
        }
        return source;
    },
});

export default mustSupport;
