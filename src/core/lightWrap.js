import {cleanDocs} from "../docs/cleanString";

// Get a test runner function for a wrapped function
export const wrappedTestRunner = (name, tests) => {
    if(!tests) return undefined;
    return hi => {
        const result = {
            pass: [],
            fail: [],
        };
        for(const testName in tests){
            const test = tests[testName];
            let success = true;
            try{
                test(hi);
            }catch(error){
                success = false;
                result.fail.push({name: testName, error: error});
            }
            if(success){
                result.pass.push({name: testName});
            }
        }
        return result;
    };
};

// Like wrap, but more lightweight. Intended only for internal functions.
export const lightWrap = function lightWrap(info){
    if(!info.implementation){
        throw new Error("Missing implementation for wrapped function.");
    }
    const wrapped = info.implementation;
    wrapped.summary = info.summary;
    wrapped.internal = info.internal;
    if(process.env.NODE_ENV === "development"){
        wrapped.docs = cleanDocs(info.docs);
        wrapped.test = wrappedTestRunner(wrapped.name, info.tests);
    }
    return wrapped;
};

// Make lightWrap behave like any wrapped function that it would return
lightWrap.summary = "Get a lightly wrapped function from a function descriptor.";
if(process.env.NODE_ENV === "development"){
    lightWrap.docs = {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a function descriptor as its single argument.
            A function descriptor has at minimum an \`implementation\`
            attribute which is some named function.
            A function descriptor passed to the function should also have
            a \`summary\` attribute which is a brief description of the function,
            a \`docs\` attribute documenting the function, and a \`tests\`
            attribute containing unit tests to validate the function's behavior.
        `),
        returns: (`
            The function returns a wrapped function which may be registered with
            the @hi object.
        `),
        related: [
            "wrap",
        ],
        examples: [
            "basicUsage"
        ],
    };
    lightWrap.tests = {
        "basicUsage": hi => {
            // Get a wrapped function
            const equalsFive = hi.lightWrap({
                summary: "Get whether an input is equal to 5.",
                docs: process.env.NODE_ENV !== "development" ? undefined : {
                    introduced: "higher@1.0.0",
                    expects: (`
                        The function expects a single argument of any type
                        as input.
                    `),
                    returns: (`
                        The function returns true when the input value was
                        equal to the number five and false otherwise.
                    `),
                    examples: [
                        "basicUsage",
                    ],
                },
                implementation: function equalsFive(value){
                    return value === 5;
                },
                tests: process.env.NODE_ENV !== "development" ? undefined : {
                    "basicUsage": hi => {
                        hi.assert(equalsFive(5));
                        hi.assertNot(equalsFive(4));
                    },
                },
            });
            // Get the function summary
            hi.assert(equalsFive.summary === "Get whether an input is equal to 5.");
            // Inspect the function documetnation
            hi.assert(equalsFive.docs.expects.startsWith(
                "The function expects a single argument"
            ));
            // Invoke the function against an input
            hi.assert(equalsFive(5));
            // Evaluate the function's unit tests
            const status = equalsFive.test(hi);
            hi.assert(status.pass.length === 1);
            hi.assert(status.fail.length === 0);
        },
    };
    lightWrap.test = wrappedTestRunner(
        "lightWrap", lightWrap.tests
    );
}
