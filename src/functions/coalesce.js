import {wrap} from "../core/wrap";

// Get the first element of a sequence that isn't null or undefined.
// When no such element exists, get the last element of the sequence.
// Returns undefined when the input sequence was empty.
export const coalesce = wrap({
    name: "coalesce",
    summary: "Get the first element in a sequence that isn't @null or @undefined.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a single known-bounded sequence as input.
        `),
        returns: (`
            The function returns the first element in the input sequence that
            wasn't either @null or @undefined. If the sequence was empty, the
            function returns @undefined. If the sequence was not empty, but
            all of its elements were either @null or @undefined, the last
            element in the sequence is returned.
        `),
        examples: [
            "basicUsage",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.boundedSequence
    },
    implementation: (source) => {
        let last = undefined;
        for(const element of source){
            if(element !== undefined && element !== null) return element;
            last = element;
        }
        return last;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.coalesce([null, undefined, "hello", "world"]) === "hello");
        },
        "falseyInputs": hi => {
            hi.assert(hi.coalesce([null, false, "hello"]) === false);
            hi.assert(hi.coalesce([undefined, 0]) === 0);
            hi.assert(hi.coalesce([""]) === "");
        },
        "allNilInputs": hi => {
            hi.assert(hi.coalesce([null, null, undefined]) === undefined);
            hi.assert(hi.coalesce([undefined, null]) === null);
        },
        "emptyInput": hi => {
            hi.assertUndefined(hi.emptySequence().coalesce());
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.recur(i => i + "!").coalesce())
        },
    },
});

export default coalesce;
