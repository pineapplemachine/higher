import {wrap} from "../core/wrap";

// Get a predicate that passes when at least one of the given predicates pass.
export const anyPass = wrap({
    name: "anyPass",
    summary: "Get a predicate that passes when any of the input predicates pass.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects any number of predicate functions as input.
        `),
        returns: (`
            The function returns a predicate function which is satisfied by an
            input when at least one of the input predicates was satisfied.
            When there were no input predicates, the output predicate returns
            #undefined for all inputs. Behaves like the \`||\` operator.
        `),
        developers: (`
            The outputted predicate function evaluates the input predicates in
            order from first to last and, the first time that any predicate
            produces a truthy value, the function then returns that produced
            value without evaluating any more predicates.
        `),
        returnType: "function",
        examples: [
            "basicUsage",
        ],
        related: [
            "allPass", "nonePass", "any",
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
            return () => undefined;
        }else if(predicates.length === 1){
            return predicates[0];
        }else if(predicates.length === 2){
            const a = predicates[0];
            const b = predicates[1];
            return (...args) => (a(...args) || b(...args));
        }else{
            return (...args) => {
                let result = undefined;
                for(const predicate of predicates){
                    result = predicate(...args);
                    if(result) return result;
                }
                return result;
            };
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const even = i => i % 2 === 0;
            const positive = i => i > 0;
            const evenOrPositive = hi.anyPass(even, positive);
            hi.assert(evenOrPositive(2));
            hi.assert(evenOrPositive(3));
            hi.assert(evenOrPositive(-4));
            hi.assertNot(evenOrPositive(-5));
        },
        "noInputs": hi => {
            const pred = hi.anyPass();
            hi.assertNot(pred(true));
            hi.assertNot(pred(false));
            hi.assertNot(pred(1));
            hi.assertNot(pred(undefined));
        },
        "oneInput": hi => {
            const even = i => i % 2 === 0;
            hi.assert(hi.anyPass(even) === even);
        },
        "twoInputs": hi => {
            const a = (i) => (i[0] === "h");
            const b = (i) => (i[1] === "e");
            const pred = hi.anyPass(a, b);
            hi.assert(pred("hello"));
            hi.assert(pred("helium"));
            hi.assert(pred("hi"));
            hi.assert(pred("me"));
            hi.assertNot(pred(""));
            hi.assertNot(pred("boop"));
        },
        "threeInputs": hi => {
            const a = i => i[0] === "a";
            const b = i => i[0] === "b";
            const c = i => i[0] === "c";
            const pred = hi.anyPass(a, b, c);
            hi.assert(pred("apple"));
            hi.assert(pred("banana"));
            hi.assert(pred("cherry"));
            hi.assertNot(pred("mango"));
            hi.assertNot(pred("pear"));
        },
        "noInputsSatisfied": hi => {
            const never = i => false;
            const pred = hi.anyPass(never, never, never, never);
            hi.assertNot(pred(true));
            hi.assertNot(pred(false));
            hi.assertNot(pred(1));
            hi.assertNot(pred(undefined));
        },
        "returnsFirstTruthy": hi => {
            const firstElement = i => i && i[0];
            const testProperty = i => i && i.test;
            const lengthProperty = i => i && i.length;
            const pred2 = hi.anyPass(firstElement, testProperty);
            hi.assert(pred2(["hello"]) === "hello");
            hi.assert(pred2({test: 1}) === 1);
            const pred3 = hi.anyPass(firstElement, testProperty, lengthProperty);
            hi.assert(pred3(["hello"]) === "hello");
            hi.assert(pred3({test: 1}) === 1);
            hi.assert(pred3([0, 1, 2, 3]) === 4);
        },
        "returnsLastFalsey": hi => {
            const never = i => false;
            const modThree = i => [false, null, undefined][i];
            const pred2 = hi.anyPass(never, modThree);
            hi.assert(pred2(0) === false);
            hi.assert(pred2(1) === null);
            hi.assert(pred2(2) === undefined);
            const pred4 = hi.anyPass(never, never, never, modThree);
            hi.assert(pred4(0) === false);
            hi.assert(pred4(1) === null);
            hi.assert(pred4(2) === undefined);
        },
    },
});

export default anyPass;
