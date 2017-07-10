import {wrap} from "../core/wrap";

// A function that returns its argument.
export const identity = wrap({
    name: "identity",
    attachSequence: true,
    async: false,
    arguments: {
        anything: true
    },
    implementation: (value) => {
        return value;
    },
});

export default identity;
