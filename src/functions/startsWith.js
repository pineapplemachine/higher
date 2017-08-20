import {asSequence} from "../core/asSequence";
import {constants} from "../core/constants";
import {isEqual} from "../core/isEqual";
import {wrap} from "../core/wrap";

// Determine equality of one or more sequences given a comparison function.
// When only one sequence is given as input, the output is always true.
export const startsWith = wrap({
    name: "startsWith",
    summary: "Get whether the the beginning of one sequence is equivalent to another.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects two sequences and one optional comparison
            function as input. One or both of the input sequences must be
            known-bounded.
            When no comparison function was given, @isEqual is used as a default.
        `),
        returns: (`
            The function returns #true when the front of the first input
            sequence was equivalent to the entirety of the second input sequence,
            using the given comparison function to compare each pair of
            corresponding elements for equality. The function returns #false
            otherwise.
            /When the second input sequence was empty, the function returns
            #true.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage", "basicUsageCaseInsensitive",
        ],
        related: [
            "endsWith",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.comparison},
            sequences: {
                amount: 2,
                any: wrap.expecting.boundedSequence,
            },
        }
    },
    implementation: (compare, sources) => {
        const search = sources[1];
        if(search.unbounded()){
            return false; // Argument validation implies source.bounded()
        }
        const source = sources[0];
        if(
            source.nativeLength && search.nativeLength &&
            source.length() < search.length()
        ){
            return false;
        }
        const compareFunc = compare || isEqual;
        for(const element of search){
            if(source.done() || !compareFunc(source.nextFront(), element)){
                return false;
            }
        }
        return true;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5];
            hi.assert(hi.startsWith(array, [1, 2, 3]));
        },
        "basicUsageCaseInsensitive": hi => {
            const asciiCaseInsensitive = (a, b) => a.toUpperCase() === b.toUpperCase();
            const seq = hi("Hello World");
            hi.assert(seq.startsWith("hello", asciiCaseInsensitive));
        },
        "searchInEmptySequence": hi => {
            hi.assertNot(hi.emptySequence().startsWith("!"));
            hi.assertNot(hi.emptySequence().startsWith([1, 2, 3]));
        },
        "searchForEmptySequence": hi => {
            hi.assert(hi.emptySequence().startsWith(hi.emptySequence()));
            hi.assert(hi.range(10).startsWith(hi.emptySequence()));
            hi.assert(hi.repeat("hello").startsWith(hi.emptySequence()));
        },
        "searchInUnboundedSequence": hi => {
            hi.assert(hi.counter().startsWith([0, 1, 2, 3, 4, 5]));
            hi.assert(hi.repeat("abc").startsWith("abcabcabc"));
            hi.assertNot(hi.repeat("xyz").startsWith("xyzxyz000"));
        },
        "searchForUnboundedSequence": hi => {
            hi.assertNot(hi.range(10).startsWith(hi.counter()));
        },
        "searchInAndForUnboundedSequence": hi => {
            hi.assertFail(() => hi.repeat([0, 1, 2, 3]).startsWith(hi.counter()));
        },
        "searchInNotKnownBoundedSequence": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assert(seq.startsWith([0, 1, 2, 3]));
        },
        "searchForNotKnownBoundedSequence": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assert(hi.range(10).startsWith(seq));
        },
        "searchInAndForNotKnownBoundedSequence": hi => {
            const seq = n => hi.recur(i => i + 1).seed(0).until(i => i >= n);
            hi.assertFail(() => n(10).startsWith(n(5)));
        },
        "searchForLongerSequence": hi => {
            hi.assertNot(hi.range(10).startsWith(hi.range(20)));
        },
    },
});

export default startsWith;
