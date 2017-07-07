import {wrap} from "../core/wrap";

import {time} from "./time";

// Get the time in milliseconds it takes to call a function a given number of
// times.
export const benchmark = wrap({
    name: "benchmark",
    attachSequence: false,
    async: true,
    arguments: {
        ordered: [wrap.expecting.number, wrap.expecting.function] // + ...args
    },
    implementation: (count, call, ...args) => {
        return time(() => {
            for(let i = 0; i < count; i++) call(...args);
        });
    },
});

export default benchmark;
