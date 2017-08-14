import {wrap} from "../core/wrap";

// Returns a function which, when called the left-most function passed at
// creation is evaluated, then that result is passed to the next function,
// that result passed to the next, etc., until a final value is acquired.
export const pipe = wrap({
    name: "pipe",
    summary: "Get a function which calls the input functions in sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects at least one function as input.
        `),
        returns: (`
            The function returns a function which, for any arguments, returns
            the value produced by first applying the first input function to
            those arguments, and then the second input function to the returned
            value, and the third input function to that returned value, and so
            on, until the last function is reached; the outputted function
            forwards the return value of that last input function.
        `),
        returnType: "function",
        examples: [
            "basicUsage", "basicUsageSequence",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        ordered: {
            first: wrap.expecting.function,
            plusVariadic: {
                amount: "*",
                type: wrap.expecting.function,
            },
        },
    },
    implementation: (rootFunction, ...moreFunctions) => {
        if(!moreFunctions.length){
            return rootFunction;
        }else{
            return (...args) => {
                let value = rootFunction(...args);
                for(const func of moreFunctions){
                    value = func(value);
                }
                return value;
            };
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const square = i => i * i;
            const negate = i => -i;
            const negativeSquare = hi.pipe(square, negate);
            hi.assert(negativeSquare(2) === -4);
            hi.assert(negativeSquare(5) === -25);
        },
        "basicUsageSequence": hi => {
            const odd = i => i % 2 !== 0;
            const square = i => i * i;
            const oddSquares = hi.pipe(
                seq => seq.filter(odd),
                seq => seq.map(square)
            );
            hi.assertEqual(oddSquares([2, 3, 4, 5, 6, 7]), [9, 25, 49]);
        },
        "singleFunctionInput": hi => {
            const func = i => i;
            hi.assert(hi.pipe(func) === func);
        },
        "noFunctionInputs": hi => {
            hi.assertFail(() => hi.pipe());
        },
    },
});

export default pipe;
