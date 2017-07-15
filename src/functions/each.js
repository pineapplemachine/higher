import {wrap} from "../core/wrap";

export const each = wrap({
    names: ["each", "forEach"],
    summary: "Invoke a callback for every element in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        links: [
            "https://en.wikipedia.org/wiki/Foreach_loop",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: 1,
            sequences: 1,
            allowIterables: true
        }
    },
    implementation: (callback, source) => {
        for(const element of source) callback(element);
        return source;
    }
});

export const forEach = each;

export default each;
