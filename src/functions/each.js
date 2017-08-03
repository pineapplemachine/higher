import {wrap} from "../core/wrap";

export const each = wrap({
    names: ["each", "forEach"],
    summary: "Invoke a callback for each element in a sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            The function invokes a callback function once for each element in
            an input sequence, in order, from front to back.
        `),
        expects: (`
            The function expects a single, optional [callback function] and a
            known-bounded sequence as input.
            If no callback was provided, then the function behaves as though
            a callback with no side effects was given as input.
        `),
        returns: (`
            The function returns the input sequence.
        `),
        examples: [
            "basicUsage", "basicUsageNoCallback",
        ],
        links: [
            {
                description: "For-each control flow construct on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Foreach_loop",
            },
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.callback},
            sequences: {one: wrap.expecting.boundedSequence},
        },
    },
    implementation: (callback, source) => {
        if(callback){
            for(const element of source) callback(element);
        }else{
            for(const element of source){}
        }
        return source;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const numbers = [1, 2, 3, 4, 5];
            let sum = 0;
            hi.each(numbers, i => {
                sum += i;
            });
            hi.assert(sum === 15);
        },
        "basicUsageNoCallback": hi => {
            const strings = ["abc", "xyz", "123"];
            let concat = "";
            // The tap function produces a sequence that lazily applies a callback.
            const seq = hi.tap(strings, i => {
                concat += i;
            });
            // That means nothing happened yet!
            hi.assert(concat === "");
            // But it will, if the sequence is consumed, such as by using each.
            seq.each();
            hi.assert(concat === "abcxyz123");
        },
        "unboundedInput": hi => {
            hi.assertFail(() => hi.counter().each());
            hi.assertFail(() => hi.counter().each(i => null));
        },
    },
});

export const forEach = each;

export default each;
