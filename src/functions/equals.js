import {isEqual} from "../core/isEqual";
import {wrap} from "../core/wrap";

export const defaultEqualityComparison = isEqual;

// This function differs from sequencesEqual in core in that:
// This function has full argument validation; the function in core does not.
// This function accepts a custom comparison; the function in core does not.
// This function is attached to the sequence prototype; the function in core is not.
export const equals = wrap({
    name: "equals",
    summary: "Compare the contents of some sequences for equality.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects any number of sequences and an optional
            comparison function as input.
            At least one of the input sequences must be known-bounded.
            When no comparison function was provided, @isEqual is used as
            a default.
        `),
        returns: (`
            The function returns #true when the input sequences were all
            equal and #false otherwise.
            Equality is determined by invoking the comparison function for
            every corresponding group of elements.
            When there was one input sequence or no input sequences, the
            function always returns #true.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage",
        ],
        related: [
            "startsWith", "endsWith",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.comparison},
            sequences: {
                amount: "*",
                any: wrap.expecting.boundedSequence,
            },
        }
    },
    implementation: (compare, sources) => {
        const compareFunc = compare || isEqual;
        if(sources.length <= 1){
            return true;
        // Optimized implementation for the very common case where there are
        // exactly two inputs.
        }else if(sources.length === 2){
            if(
                sources[0].nativeLength && sources[1].nativeLength &&
                sources[0].length() !== sources[1].length()
            ){
                return false;
            }
            while(!sources[0].done() && !sources[1].done()){
                if(!compareFunc(sources[0].nextFront(), sources[1].nextFront())){
                    return false;
                }
            }
            return sources[0].done() && sources[1].done();
        // Generalized implementation when any number of sources greater than two.
        }else{
            let sameLength = undefined;
            // Short-circuit when some of the sources have different known lengths
            // or are known-unbounded.
            for(const source of sources){
                if(source.nativeLength){
                    if(sameLength === undefined) sameLength = source.length();
                    else if(source.length() !== sameLength) return false;
                }else if(source.unbounded()){
                    return false;
                }
            }
            while(!sources[0].done()){
                const elements = [sources[0].nextFront()];
                for(let i = 1; i < sources.length; i++){
                    if(sources[i].done()) return false;
                    elements.push(sources[i].nextFront());
                }
                if(!compareFunc(...elements)){
                    return false;
                }
            }
            for(const source of sources){
                if(!source.done()) return false;
            }
            return true;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.range(8).equals([0, 1, 2, 3, 4, 5, 6, 7]));
        },
        "noInputs": hi => {
            hi.assert(hi.equals());
        },
        "oneInput": hi => {
            hi.assert(hi.equals("hello"));
            hi.assert(hi.equals([1, 2, 3]));
        },
        "emptyInput": hi => {
            hi.assert(hi.emptySequence().equals());
            hi.assert(hi.emptySequence().equals([]));
            hi.assert(hi.emptySequence().equals(hi.emptySequence()));
            hi.assert(hi.emptySequence().equals(hi.emptySequence(), []));
            hi.assert(hi.emptySequence().equals(hi.emptySequence(), hi.emptySequence()));
            hi.assert(hi.emptySequence().equals([], [], [], [], []));
            hi.assertNot(hi.emptySequence().equals([], [], [], [], [1]));
        },
        "differingKnownLengthInputs": hi => {
            hi.assertNot(hi.range(4).equals(hi.range(6)));
            hi.assertNot(hi.range(4).equals(hi.range(2)));
            hi.assertNot(hi.range(4).equals(hi.range(2), hi.range(6)));
            hi.assertNot(hi.range(4).equals(hi.range(4), hi.range(6)));
            hi.assertNot(hi.range(4).equals(hi.range(2), hi.range(4)));
        },
        "differingUnknownLengthInputs": hi => {
            const a = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            const b = hi.range(8);
            hi.assert(hi.equals(a, b));
        },
        "unboundedInput": hi => {
            hi.assertNot(hi.counter().equals(hi.range(10)));
        },
        "allBoundedInputs": hi => {
            hi.assert(hi.range(10).equals(hi.range(10)));
            hi.assert(hi("hello").equals("hello"));
            hi.assertNot(hi("hello").equals("hello world"));
            hi.assertNot(hi("hello").equals("he"));
        },
        "allUnboundedInputs": hi => {
            hi.assertFail(() => hi.repeat("ok").equals(hi.repeat("okok")));
        },
    },
});

export default equals;
