import {wrap} from "../core/wrap";

// Get an ordering function given a relational function.
// Calling the produced ordering function once entails calling the inputted
// relational function at least once and up to twice.
export const relationalToOrdering = wrap({
    name: "relationalToOrdering",
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function
    },
    implementation: (relate) => {
        return (a, b) => {
            if(relate(a, b)) return -1;
            else if(relate(b, a)) return +1;
            else return 0;
        };
    },
});

export default relationalToOrdering;
