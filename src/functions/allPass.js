import {wrap} from "../core/wrap";

// Get a predicate that passes when all the given predicates pass.
export const allPass = wrap({
    name: "allPass",
    summary: "Get a predicate that passes when all of the input predicates pass.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects any number of predicate functions as input.
        `),
        returns: (`
            The function returns a predicate function which is satisfied by an
            input when at least all of the input predicates were satisfied.
            When there were no input predicates, the output predicate returns
            #true for all inputs. Behaves like the \`&&\` operator.
        `),
        developers: (`
            The outputted predicate function evaluates the input predicates in
            order from first to last and, the first time that any predicate
            produces a falsey value, the function then returns that produced
            value without evaluating any more predicates.
        `),
        returnType: "function",
        examples: [
            "basicUsage",
        ],
        related: [
            "anyPass", "nonePass", "all",
        ],
    },
    attachSequence: false,
    async: false,
    arguments: {
        unordered: {
            functions: {anyNumberOf: wrap.expecting.predicate},
        },
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
                let result = true;
                for(const predicate of predicates){
                    result = predicate(...args);
                    if(!result) return result;
                }
                return result;
            };
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const positive = i => i > 0;
            const evenAndPositive = hi.allPass(positive, even);
            hi.assert(evenAndPositive(2));
            hi.assertNot(evenAndPositive(3));
            hi.assertNot(evenAndPositive(-4));
            hi.assertNot(evenAndPositive(-5));
        },
        "noInputs": hi => {
            const pred = hi.allPass();
            hi.assert(pred(true));
            hi.assert(pred(false));
            hi.assert(pred(1));
            hi.assert(pred(undefined));
        },
        "oneInput": hi => {
            const even = i => i % 2 === 0;
            hi.assert(hi.allPass(even) === even);
        },
        "twoInputs": hi => {
            const a = i => i[0] === "h";
            const b = i => i[1] === "e";
            const pred = hi.allPass(a, b);
            hi.assert(pred("hello"));
            hi.assert(pred("helium"));
            hi.assertNot(pred("hi"));
            hi.assertNot(pred("me"));
            hi.assertNot(pred(""));
            hi.assertNot(pred("boop"));
        },
        "threeInputs": hi => {
            const a = i => i[0] === "h";
            const b = i => i[1] === "e";
            const c = i => i[2] === "l";
            const pred = hi.allPass(a, b, c);
            hi.assert(pred("hello"));
            hi.assert(pred("help"));
            hi.assert(pred("helicopter"));
            hi.assertNot(pred("yellow"));
            hi.assertNot(pred("hill"));
            hi.assertNot(pred("hero"));
            hi.assertNot(pred("gill"));
            hi.assertNot(pred("hint"));
            hi.assertNot(pred("jelly"));
            hi.assertNot(pred(""));
        },
    },
});

export default allPass;
