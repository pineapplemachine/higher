import {wrap} from "../core/wrap";

// Call the encapsulated function only once, with any arguments.
// Successive calls return the value which the first call produced without
// calling the function again.
export const once = wrap({
    name: "once",
    summary: "Wrap a function with one that only ever calls it once.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Get a function that invokes a callback the first time the
            function is called and returns its output, then returns the same
            value on every successive call without ever invoking the
            input callback again.
        `),
        expects: (`
            The function expects a single function of any kind as input.
        `),
        returns: (`
            The function returns a wrapper function around the input. The first
            time the outputted function is called, the input function is
            invoked with the same arguments and its output is returned.
            Successive calls to the outputted function return the same value
            as the first call without ever invoking the inputted function again.
        `),
        returnType: "function",
        examples: [
            "basicUsage", "notMemoization"
        ],
        related: [
            "memoize"
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        one: wrap.expecting.function
    },
    implementation:  (call) => {
        let called = false;
        let result;
        return (...args) => {
            if(!called){
                result = call(...args);
                called = true;
            }
            return result;
        };
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            let timesCalled = 0;
            const callback = () => {timesCalled++; return "hello"};
            const callOnce = hi.once(callback);
            hi.assert(callOnce() === "hello");
            hi.assert(timesCalled === 1);
            // Invoking the returned function again produces the same output,
            // but does so without calling the input again.
            hi.assert(callOnce() === "hello");
            hi.assert(timesCalled === 1);
        },
        "notMemoization": hi => {
            const callback = i => i * i;
            const callOnce = hi.once(callback);
            hi.assert(callOnce(5) === 25);
            // Successive calls produce the same output as the first regardless of arguments.
            hi.assert(callOnce(1) === 25);
            hi.assert(callOnce(100) === 25);
            hi.assert(callOnce("hello") === 25);
        },
    }
});

export default once;
