import {expecting, wrap} from "../core/wrap";

export const time = wrap({
    name: "time",
    attachSequence: false,
    async: true,
    arguments: {
        ordered: [expecting.function] // + ...args
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
