import {wrap} from "../core/wrap";

// Get a relational function given an ordering function.
export const orderingToRelational = wrap({
    name: "orderingToRelational",
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function
    },
    implementation: (order) => {
        return (a, b) => (order(a, b) < 0);
    },
});

export default orderingToRelational;
