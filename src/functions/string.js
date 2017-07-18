import {isString} from "../core/types";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const string = wrap({
    name: "string",
    summary: "Concatenate a string from a sequence of strings.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a known-bounded sequence as its single
            argument.
        `),
        returns: (`
            The function returns a string produced by concatenating every
            element of the input sequence. If the input was itself a string,
            the function returns that string.
        `),
        throws: (`
            The function throws a @NotBoundedError when the input sequence
            was not known to be bounded.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "array", "object"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        if(isString(source)) return source;
        NotBoundedError.enforce(source, {
            message: "Failed to create string",
        });
        let result = "";
        for(const element of source) result += element;
        return result;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const strings = ["what", "lovely", "weather"];
            const joined = hi.join(strings, " ").assumeBounded();
            hi.assert(joined.string() === "what lovely weather"); 
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().string() === "");
        },
        "stringInput": hi => {
            hi.assert(hi.string("") === "");
            hi.assert(hi.string("!") === "!");
            hi.assert(hi.string("hello") === "hello");
        },
        "stringArrayInput": hi => {
            hi.assert(hi.string(["hello", " ", "world"]) === "hello world");
        },
        "nonStringElementsInput": hi => {
            hi.assert(hi.string([10, 0, " bottles"]) === "100 bottles");
        },
        "notKnownBoundedInput": hi => {
            hi.assertFailWith(NotBoundedError,
                () => hi.recur(i => i + "!").seed("hello").until(i => i.length >= 10).string()
            );
        },
        "unboundedInput": hi => {
            hi.assertFailWith(NotBoundedError,
                () => hi.repeatElement("hi").string()
            );
        },
    },
});

export default string;
