import {wrap} from "../core/wrap";

// Get the complement of a function.
export const negate = wrap({
    name: "negate",
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function
    },
    implementation: (predicate) => {
        return (...args) => (!prediate(...args));
    },
});

export default negate;
