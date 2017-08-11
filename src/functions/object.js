import {isArray, isObject} from "../core/types";
import {wrap} from "../core/wrap";

export const asObject = (pairs) => {
    const result = {};
    for(const pair of pairs){
        if(isObject(pair) && "key" in pair){
            result[pair.key] = pair.value;
        }else if(isArray(pair) && pair.length){
            result[pair[0]] = pair[1];
        }
    }
    return result;
};

export const object = wrap({
    name: "object",
    summary: "Get an object from key, value pairs.",
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
            described by the input sequence.
        `),
        examples: [
            "basicUsage", "objectInput"
        ],
        related: [
            "newObject",
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
            const obj = seq.object();
            hi.assert(obj["0"] === 0);
            hi.assert(obj["2"] === 4);
            hi.assert(obj["9"] === 81);
        },
        "arrayKeyValuePairs": hi => {
            const pairs = [["x", 1], ["y", 2]];
            hi.assertEqual(hi.object(pairs), {x: 1, y:2});
        },
        "objectInput": hi => {
            // This behavior is due to an override associated with ObjectSequence.
            const obj = {a: 0, b:1};
            hi.assert(hi.object(obj) === obj);
        },
        "emptyInput": hi => {
            hi.assertEqual(hi.emptySequence().object(), {});
        },
        "unboundedInput": hi => {
            hi.assertFail(
                () => hi.object(hi.repeatElement({key: "hello", value: "world"}))
            );
        },
        "nonKeyValuePairsInput": hi => {
            // Ignore things that aren't key, value pairs
            hi.assertEqual(hi.object([1, 2, 3]), {});
            hi.assertEqual(hi.object("ok"), {});
            hi.assertEqual(hi.object(["hello", "world"]), {});
        },
    },
});

export default object;
