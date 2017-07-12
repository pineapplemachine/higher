import {wrap} from "../core/wrap";

export const time = wrap({
    name: "time",
    summary: "Get the time in milliseconds that it takes to evaluate a function.",
    attachSequence: false,
    async: true,
    arguments: {
        ordered: [wrap.expecting.function] // + ...args
    },
    implementation: (typeof performance === "undefined" ?
        (call, ...args) => {
            const start = performance.now();
            call(...args);
            return performance.now() - start;
        } :
        (call, ...args) => {
            const start = new Date().getTime();
            call(...args);
            return new Date().getTime() - start;
        }
    ),
});

export default time;
