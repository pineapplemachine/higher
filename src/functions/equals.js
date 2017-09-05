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
            When no comparison function was provided, @isEqual is used as
            a default.
        `),
        returns: (`
            The function returns #true when the input sequences were all
            equal and #false otherwise.
            The function returns #false when any of the input sequences were
            known to be unbounded.
            Equality is determined by invoking the comparison function for
            every corresponding group of elements.
            When there was one input sequence or no input sequences, the
            function always returns #true.
        `),
        warnings: (`
            If all of the input sequences were in fact unbounded without being
            known-unbounded, then the function will produce an infinite loop.
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
            sequences: "*",
        }
    },
    implementation: (compare, sources) => {
        // Return true for zero or one input sequences.
        if(sources.length <= 1) return true;
        const compareFunc = compare || isEqual;
        // Optimized implementation for the very common case where there are
        // exactly two inputs.
        if(sources.length === 2){
            if((sources[0].unbounded() || sources[1].unbounded()) || (
                sources[0].nativeLength && sources[1].nativeLength &&
                sources[0].nativeLength() !== sources[1].nativeLength()
            )){
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
                    if(sameLength === undefined) sameLength = source.nativeLength();
                    else if(source.nativeLength() !== sameLength) return false;
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
            hi.assertNot(hi.repeat("ok").equals(hi.repeat("okok")));
        },
    },
});

export default equals;
