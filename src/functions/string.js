import {isSequence} from "../core/sequence";
import {isString} from "../core/types";
import {wrap} from "../core/wrap";

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
            Elements that are themselves bounded sequences are flattened,
            having their own contents recursively written as strings and
            appended to the output string.
        `),
        examples: [
            "basicUsage", "flattenSubSequences",
        ],
        related: [
            "array", "object"
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.boundedSequence,
    },
    implementation: (source) => {
        if(isString(source)) return source;
        let result = "";
        for(const element of source){
            if(isSequence(element) && element.bounded()){
                result += string(element);
            }else{
                result += String(element);
            }
        }
        return result;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const seq = hi(["what", " ", "lovely", " ", "weather"]);
            hi.assert(seq.string() === "what lovely weather"); 
        },
        "flattenSubSequences": hi => {
            const sub = hi(["hello", " ", "world"]);
            const seq = hi([sub, "!"]);
            hi.assert(seq.string() === "hello world!");
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
            hi.assertFail(
                () => hi.recur(i => i + "!").seed("hello").until(i => i.length >= 10).string()
            );
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.repeatElement("hi").string());
        },
    },
});

export default string;
