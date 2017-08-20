import {wrap} from "../core/wrap";

import {defaultEqualityComparison} from "./equals";

// Determine equality of one or more sequences given a comparison function.
// When only one sequence is given as input, the output is always true.
export const endsWith = wrap({
    name: "endsWith",
    summary: "Get whether the the end of one sequence is equivalent to another.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects two sequences and one optional comparison
            function as input. The first input sequence must be either
            known-bounded or bidirectional, and at least one of the input
            sequences must be known-bounded.
            When no comparison function was given, @isEqual is used as a default.
        `),
        returns: (`
            The function returns #true when the back of the first input
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
            "startsWith",
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
                first: wrap.expecting.either(
                    wrap.expecting.bidirectionalSequence,
                    wrap.expecting.boundedSequence
                ),
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
        const compareFunc = compare || defaultEqualityComparison;
        if(source.back && search.back){
            while(!search.done()){
                if(source.done() || !compareFunc(source.nextBack(), search.nextBack())){
                    return false;
                }
            }
            return true;
        }else if(source.back && search.bounded()){
            const searchArray = [];
            for(const element of search) searchArray.push(element);
            for(let i = searchArray.length - 1; i >= 0; i--){
                if(source.done() || !compareFunc(source.nextBack(), searchArray[i])){
                    return false;
                }
            }
            return true;
        }else if(search.back && source.bounded()){
            const sourceArray = [];
            for(const element of source) sourceArray.push(element);
            for(let i = sourceArray.length - 1; i >= 0; i--){
                if(search.done()) return true;
                if(!compareFunc(sourceArray[i], search.nextBack())) return false;
            }
            return search.done();
        }else{ // Argument validation implies source.bounded()
            const sourceArray = [];
            for(const element of source) sourceArray.push(element);
            const searchArray = [];
            for(const element of search) searchArray.push(element);
            if(searchArray.length > sourceArray.length){
                return false;
            }
            let i = sourceArray.length - searchArray.length;
            let j = 0;
            while(i < sourceArray.length){
                if(!compareFunc(sourceArray[i++], searchArray[j++])) return false;
            }
            return true;
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const array = [1, 2, 3, 4, 5];
            hi.assert(hi.endsWith(array, [3, 4, 5]));
        },
        "basicUsageCaseInsensitive": hi => {
            const asciiCaseInsensitive = (a, b) => a.toUpperCase() === b.toUpperCase();
            const seq = hi("Hello World");
            hi.assert(seq.endsWith("World", asciiCaseInsensitive));
        },
        "searchInEmptySequence": hi => {
            hi.assertNot(hi.emptySequence().endsWith("!"));
            hi.assertNot(hi.emptySequence().endsWith([1, 2, 3]));
        },
        "searchForEmptySequence": hi => {
            hi.assert(hi.emptySequence().endsWith(hi.emptySequence()));
            hi.assert(hi.range(10).endsWith(hi.emptySequence()));
            hi.assert(hi.repeat("hello").endsWith(hi.emptySequence()));
        },
        "searchInUnboundedSequence": hi => {
            hi.assert(hi.repeat("abc").endsWith("abcabcabc"));
            hi.assertNot(hi.repeat("xyz").endsWith("000xyzxyz"));
        },
        "searchForUnboundedSequence": hi => {
            hi.assertNot(hi.range(10).endsWith(hi.counter()));
        },
        "searchInAndForUnboundedSequence": hi => {
            hi.assertFail(() => hi.repeat([0, 1, 2, 3]).endsWith(hi.counter()));
        },
        "searchInNotKnownBoundedSequence": hi => {
            const seq = hi.recur(i => i + 1).seed(0).until(i => i >= 8);
            hi.assertFail(() => seq.endsWith([4, 5, 6, 7]));
        },
        "searchForNotKnownBoundedSequence": hi => {
            const seq = hi.recur(i => i + 1).seed(3).until(i => i >= 8);
            hi.assert(hi.range(8).endsWith(seq));
        },
        "searchInAndForNotKnownBoundedSequence": hi => {
            const seq = n => hi.recur(i => i + 1).seed(0).until(i => i >= n);
            hi.assertFail(() => n(10).endsWith(n(5)));
        },
        "searchForLongerSequence": hi => {
            hi.assertNot(hi.range(10).endsWith(hi.range(20)));
        },
    },
});

export default endsWith;
