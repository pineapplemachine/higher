import {wrap} from "../core/wrap";

export const nonePass = wrap({
    name: "nonePass",
    summary: "Get a predicate that passes when none of the input predicates pass.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects any number of predicate functions as input.
        `),
        returns: (`
            The function returns a predicate function which is satisfied by an
            input when at none of the input predicates were satisfied.
            When there were no input predicates, the output predicate returns
            #true for all inputs.
        `),
        developers: (`
            The outputted predicate function evaluates the input predicates in
            order from first to last and, the first time that any predicate
            produces a truthy value, the function then returns #false without
            evaluating any more predicates.
        `),
        returnType: "function",
        examples: [
            "basicUsage",
        ],
        related: [
            "anyPass", "allPass", "none",
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
            return (...args) => (!predicates[0](...args));
        }else if(predicates.length === 2){
            const a = predicates[0];
            const b = predicates[1];
            return (...args) => (!a(...args) && !b(...args));
        }else{
            return (...args) => {
                for(const predicate of predicates){
                    if(predicate(...args)) return false;
                }
                return true;
            };
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const positive = i => i > 0;
            const nethierEvenNorPositive = hi.nonePass(even, positive);
            hi.assertNot(nethierEvenNorPositive(2));
            hi.assertNot(nethierEvenNorPositive(3));
            hi.assertNot(nethierEvenNorPositive(-4));
            hi.assert(nethierEvenNorPositive(-5));
        },
        "noInputs": hi => {
            const pred = hi.nonePass();
            hi.assert(pred(true));
            hi.assert(pred(false));
            hi.assert(pred(1));
            hi.assert(pred(undefined));
        },
        "oneInput": hi => {
            const even = i => i % 2 === 0;
            const pred = hi.nonePass(even);
            hi.assert(pred(3));
            hi.assert(pred(5));
            hi.assertNot(pred(2));
            hi.assertNot(pred(4));
        },
        "twoInputs": hi => {
            const a = (i) => (i[0] === "h");
            const b = (i) => (i[1] === "e");
            const pred = hi.nonePass(a, b);
            hi.assertNot(pred("hello"));
            hi.assertNot(pred("helium"));
            hi.assertNot(pred("hi"));
            hi.assertNot(pred("me"));
            hi.assert(pred(""));
            hi.assert(pred("boop"));
        },
        "threeInputs": hi => {
            const a = i => i[0] === "a";
            const b = i => i[0] === "b";
            const c = i => i[0] === "c";
            const pred = hi.nonePass(a, b, c);
            hi.assertNot(pred("apple"));
            hi.assertNot(pred("banana"));
            hi.assertNot(pred("cherry"));
            hi.assert(pred("mango"));
            hi.assert(pred("pear"));
        },
        "noInputsSatisfied": hi => {
            const never = i => false;
            const pred = hi.nonePass(never, never, never, never);
            hi.assert(pred(true));
            hi.assert(pred(false));
            hi.assert(pred(1));
            hi.assert(pred(undefined));
        },
    },
});

export default nonePass;
