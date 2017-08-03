import {wrap} from "../core/wrap";

import {time} from "./time";

// Get the time in milliseconds it takes to call a function a given number of
// times.
export const benchmark = wrap({
    name: "benchmark",
    summary: "Get the time in milliseconds it takes to repeatedly evaluate a function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a number and a function as input.
        `),
        returns: (`
            The function returns the amount of time in milliseconds that it
            took to evaluate the input function the given number of times.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "time",
        ],
    },
    attachSequence: false,
    async: true,
    arguments: {
        ordered: [wrap.expecting.number, wrap.expecting.function]
    },
    implementation: (repetitions, call) => {
        return time(() => {
            for(let i = 0; i < repetitions; i++) call();
        });
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const call = () => 5 + 5;
            const millisecs = hi.benchmark(100, call);
            hi.assert(millisecs < 100);
        },
    },
});

export default benchmark;
