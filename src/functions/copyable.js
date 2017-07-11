import {wrap} from "../core/wrap";

import {EagerSequence} from "./eager";
import {getTeeBuffer} from "./tee";

export const copyable = wrap({
    name: "copyable",
    summary: "Get a copyable sequence.",
    attachSequence: true,
    async: false,
    arguments: {
        one: wrap.expecting.sequence
    },
    implementation: (source) => {
        if(source.copy) return source;
        else if(source.bounded()) return new EagerSequence(source);
        else return getTeeBuffer(source).sequences[0];
    },
});
