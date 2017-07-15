import {wrap} from "../core/wrap";

// Get a predicate that passes when all the given predicates pass.
export const allPass = wrap({
    name: "allPass",
    summary: "Get a predicate that is the logical AND of its input functions.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`
            Combines any number of predicate functions to produce a predicate
            which is satisfied only by those inputs which satisfy all
            of those inputted functions.
        `),
        expects: (`
            The function expects any number of predicate functions.
        `),
        returns: (`
            The function returns a predicate function returning true for
            an input only when all of the inputted predicates are satisfied by
            that input and returning false otherwise.
            When exactly one predicate was passed, this function returns that
            same predicate.
            When no predicates were passed, this function returns a new
            predicate that is satisfied by all inputs.
        `),
        examples: [
            "basicUsage"
        ],
        related: [
            "negate", "anyPass", "nonePass"
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        unordered: {
            functions: "*"
        }
    },
    implementation: (predicates) => {
        if(predicates.length === 0){
            return () => true;
        }else if(predicates.length === 1){
            return predicates[0];
        }else if(predicates.length === 2){
            const a = predicates[0];
            const b = predicates[1];
            return (...args) => (a(...args) && b(...args));
        }else{
            return (...args) => {
                for(const predicate of predicates){
                    if(!predicate(...args)) return false;
                }
                return true;
            };
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const gt0 = (i) => (i > 0);
            const not2 = (i) => (i !== 2);
            const both = hi.allPass(gt0, not2);
            hi.assert(both(1));
            hi.assert(both(100));
            hi.assert(!both(-5));
            hi.assert(!both(0));
            hi.assert(!both(2));
        },
        "noInputs": hi => {
            const pred = hi.allPass();
            hi.assert(pred(0));
            hi.assert(pred(1));
            hi.assert(pred("hello"));
        },
        "oneInput": hi => {
            const gt0 = (i) => (i > 0);
            const pred = hi.allPass(gt0);
            hi.assert(pred(1));
            hi.assert(!pred(-1));
            hi.assert(pred === gt0);
        },
        "twoInputs": hi => {
            const a = (i) => (i[0] === "h");
            const b = (i) => (i[1] === "e");
            const both = hi.allPass(a, b);
            hi.assert(both("hello"));
            hi.assert(both("helium"));
            hi.assert(!both("hi"));
            hi.assert(!both("me"));
        },
        "threeInputs": hi => {
            const a = (i) => (i[0] === "h");
            const b = (i) => (i[1] === "e");
            const c = (i) => (i[2] === "l");
            const all = hi.allPass(a, b, c);
            hi.assert(all("hello"));
            hi.assert(all("help"));
            hi.assert(all("helicopter"));
            hi.assert(!all("yellow"));
            hi.assert(!all("hill"));
            hi.assert(!all("hero"));
            hi.assert(!all("gill"));
            hi.assert(!all("hint"));
            hi.assert(!all("jelly"));
            hi.assert(!all(""));
        },
    },
});

export default allPass;
