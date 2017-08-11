import {wrap} from "../core/wrap";

import {asObject} from "./object";

export const newObject = wrap({
    name: "newObject",
    summary: "Get a new object from key, value pairs.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects either an object or a known-bounded sequence
            of key, value pairs.
            Key, value pairs are objects with a \`key\` attribute or arrays with
            at least one element. Elements of the input sequence not qualifying
            as key, value pairs are ignored.
        `),
        returns: (`
            The function returns an object with the key, value pairs as
            described by the input.
        `),
        examples: [
            "basicUsage", "objectInput"
        ],
        related: [
            "object",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.boundedSequence,
    },
    implementation: (source) => {
        return asObject(source);
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi.range(0, 10).map(i => ({key: i, value: i * i}));
            const obj = seq.newObject();
            hi.assert(obj["0"] === 0);
            hi.assert(obj["2"] === 4);
            hi.assert(obj["9"] === 81);
        },
        "arrayKeyValuePairs": hi => {
            const pairs = [["x", 1], ["y", 2]];
            hi.assertEqual(hi.newObject(pairs), {x: 1, y:2});
        },
        "objectInput": hi => {
            // This behavior is due to an override associated with ObjectSequence.
            const obj = {a: 0, b:1};
            hi.assert(hi.newObject(obj) !== obj);
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().newObject(), {});
        },
        "unboundedInput": hi => {
            hi.assertFail(
                () => hi.newObject(hi.repeatElement({key: "hello", value: "world"}))
            );
        },
        "nonKeyValuePairsInput": hi => {
            // Ignore things that aren't key, value pairs
            hi.assertEqual(hi.newObject([1, 2, 3]), {});
            hi.assertEqual(hi.newObject("ok"), {});
            hi.assertEqual(hi.newObject(["hello", "world"]), {});
        },
    },
});

export default newObject;
