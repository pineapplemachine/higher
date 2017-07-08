import {wrap} from "../core/wrap";

import {SingularMapSequence} from "./map";

export const pluck = wrap({
    name: "pluck",
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [wrap.expecting.sequence, wrap.expecting.anything]
    },
    implementation: (source, property) => {
        return new SingularMapSequence(element => element[property], source);
    },
});

export default pluck;
