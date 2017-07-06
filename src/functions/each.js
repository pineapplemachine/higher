import {wrap} from "../core/wrap";

export const each = wrap({
    names: ["each", "forEach"],
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
