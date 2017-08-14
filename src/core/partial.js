import {lightWrap} from "./lightWrap";

export const partial = lightWrap({
    names: ["partial", "partialLeft"],
    summary: "Partially apply arguments to the left of a function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one input function and then any number of
            arguments of any type as input.
        `),
        returns: (`
            The function returns a function which, when called, is the same
            as calling the input function with all the additional arguments
            prepended to the arguments passed to the outputted function.
            When there were no arguments to partially apply, the function
            returns the input function.
        `),
        returnType: "function",
        examples: [
            "basicUsage",
        ],
        related: [
            "partialRight",
        ],
        links: [
            {
                description: "Partial function application on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Partial_application",
            },
        ],
    },
    implementation: function partial(applyTo, ...partialArgs){
        if(partialArgs.length){
            return function(...args){
                args.unshift(...partialArgs);
                return applyTo.apply(this, args);
            };
        }else{
            return applyTo;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const sum = (a, b) => a + b;
            const addOne = hi.partial(sum, 1);
            hi.assert(addOne(5) === 6);
            hi.assert(addOne(10) === 11);
        },
        "noPartialArguments": hi => {
            const func = i => i;
            hi.assert(hi.partial(func) === func);
        },
        "partialWrappedFunctions": hi => {
            const squares = hi.map.partial(i => i * i);
            hi.assertEqual(squares([1, 2, 3, 4]), [1, 4, 9, 16]);
        },
    },
});

export const partialRight = lightWrap({
    summary: "Partially apply arguments to the right of a function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one input function and then any number of
            arguments of any type as input.
        `),
        returns: (`
            The function returns a function which, when called, is the same
            as calling the input function with all the additional arguments
            appended to the arguments passed to the outputted function.
            When there were no arguments to partially apply, the function
            returns the input function.
        `),
        returnType: "function",
        examples: [
            "basicUsage",
        ],
        related: [
            "partial",
        ],
        links: [
            {
                description: "Partial function application on Wikipedia",
                url: "https://en.wikipedia.org/wiki/Partial_application",
            },
        ],
    },
    implementation: function partialRight(applyTo, ...partialArgs){
        if(partialArgs.length){
            return function(...args){
                args.push(...partialArgs);
                return applyTo.apply(this, args);
            };
        }else{
            return applyTo;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const concat = (a, b) => a + b;
            const exclaim = hi.partialRight(concat, "!");
            hi.assert(exclaim("hello") === "hello!");
        },
        "noPartialArguments": hi => {
            const func = i => i;
            hi.assert(hi.partialRight(func) === func);
        },
        "partialWrappedFunctions": hi => {
            const repeatTwice = hi.repeatElement.partialRight(2);
            hi.assertEqual(repeatTwice("!"), ["!", "!"]);
        },
    },
});

export const partialLeft = partial;

export default partial;
