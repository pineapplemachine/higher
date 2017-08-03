import {wrap} from "../core/wrap";

export const time = wrap({
    name: "time",
    summary: "Get the time in milliseconds that it takes to evaluate a function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single function as input.
        `),
        returns: (`
            The function returns the amount of time in milliseconds that it
            took to evaluate the input function once.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "benchmark",
        ],
    },
    attachSequence: false,
    async: true,
    arguments: {
        ordered: [wrap.expecting.function]
    },
    implementation: (typeof performance === "undefined" ?
        call => {
            const start = performance.now();
            call();
            return performance.now() - start;
        } :
        call => {
            const start = new Date().getTime();
            call();
            return new Date().getTime() - start;
        }
    ),
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const call = () => 10 + 10;
            const millisecs = hi.time(call);
            hi.assert(millisecs < 10);
        },
    },
});

export default time;
