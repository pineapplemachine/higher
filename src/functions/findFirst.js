import {asSequence} from "../core/asSequence";
import {constants} from "../core/constants";
import {canGetLength, getLength} from "../core/length";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {equals} from "./equals";
import {FindSequenceResult, ForwardFindSequenceThread, stepFindThreads} from "./findAll";

import {NotBoundedError} from "../errors/NotBoundedError";

// Find the first occurrence of a substring as judged by a comparison function.
// Finding the first instance of a substring is overwhelmingly the most
// common use case for substring searching, so alias "find" to "findFirst"
// for maximum user convenience and minimum user confusion.
export const findFirst = wrap({
    names: ["findFirst", "find"],
    summary: "Finds the first occurrence of a substring as judged by a comparison function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects as input a comparison function and a sequence array
            which should contain a source sequence and a bounded search sequence.
            /The function expects as input a sequence known to be bounded and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns a @FindSequenceResult if an occurrence of the
            provided substring can be found. If none can be found, or the sequence
            is empty, returns @undefined.
        `),
        throws: (`
            The function throws a @NotBoundedError when the input sequence was
            not known to be bounded or when the search sequence is empty.
        `),
    },
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2,
            allowIterables: true
        }
    },
    implementation: (compare, sequences) => {
        const source = sequences[0];
        let search = asSequence(sequences[1]);
        const compareFunc = compare || constants.defaults.comparisonFunction;

        // simply return undefined if the search input is empty
        if (search.done()){
            return undefined;
        }

        // ... however throw a NotBoundedError if the search input is unbounded
        if(search.unbounded()){
            throw NotBoundedError(search, {
                message: "Search sequence is either empty or unbounded"
            });
        }

        // Handle case where search length is known to be at least source length
        if(search.length && canGetLength(source)){
            const searchLength = search.length();
            const sourceLength = getLength(source);
            if(searchLength === sourceLength && equals(compareFunc, [search, source])){
                return new FindSequenceResult(asSequence(source), 0, sourceLength);
            }else if(searchLength > sourceLength){
                return undefined;
            }
        }
        // Search sequence absolutely must be copyable
        search = copyable(search);
        const searchElement = search.nextFront();
        // Handle single-element search subject
        if(search.done()){
            let index = 0;
            for(const element of source){
                if(compareFunc(element, searchElement)){
                    return new FindSequenceResult(
                        asSequence(source), index, index + 1
                    );
                }
                index++;
            }
            return undefined;
        }
        // Handle search subject of two or more elements
        const findObject = {
            threadType: ForwardFindSequenceThread,
            stepThreads: stepFindThreads,
            compare: compareFunc,
            source: source,
            search: search,
            searchElement: searchElement,
            nextSearchElement: search.nextFront(),
            searchThreads: [],
            index: 0,
        };
        for(const element of source){
            const result = findObject.stepThreads(element);
            if(result){
                result.source = asSequence(source);
                return result;
            }
            findObject.index++;
        }
        return undefined;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": (hi) => {
            hi.assert(hi("hello world").findFirst("world").index === 6);
            hi.assertUndefined(hi("hello again").findFirst("nope"));
        },
        "onlyFindsFirstOccurrence": (hi) => {
            const result = hi("hi higher higher higher higher").findFirst("higher");
            hi.assert(result, (r) => r.index === 3);
        },
        "undefinedWhenSubstringNotPresent": (hi) => {
            const seq = hi("not gonna find this").findFirst("hello?");
            hi.assertUndefined(seq);
        },
        "undefinedWhenSequenceIsEmpty": (hi) => {
            const seq = hi("").findFirst("missing");
            hi.assertUndefined(seq);
        },
        "indexesCorrect": (hi) => {
            const result = hi("lorem ipsum dolar sit amet").findFirst("ipsum");
            hi.assert(result, (r) => r.low === 6 && r.high === 11);
        },
        "searchLengthCorrect": (hi) => {
            const result = hi("a string to be searched").findFirst("string");
            hi.assert(result, (r) => r.length === 6);
        },
        "caseInsensitiveSearch": (hi) => {
            const asciiCaseInsensitive = (a, b) => (a.toUpperCase() === b.toUpperCase());
            const found = hi("hello world").findFirst("World", asciiCaseInsensitive);
            hi.assert(found.index === 6);
            hi.assert(found.string() === "world");
        },
        "singleLength": (hi) => {
            const result = hi("abcabc").findFirst("a");
            hi.assert(result.index === 0);
            hi.assert(result.high === 1);
        },
        "overlapping": (hi) => {
            const result = hi("etetet").findFirst("etet");
            hi.assert(result.index === 0);
            hi.assert(result.high === 4);
        },
        "emptySearchString": (hi) => {
            hi.assertUndefined(hi("test").findFirst(""));
        },
        "unboundedSearchInput": (hi) => {
            hi.assertFailWith(NotBoundedError, () => {
                return hi("test").findFirst(hi.repeatElement({
                    key: "hello",
                    value: "world"
                }));
            });
        },
        "nonStringSearchSequence": (hi) => {
            hi.assertUndefined(hi("test").findFirst({}));
            hi.assertUndefined(hi("test").findFirst([]));
        }
    },
});

export const find = findFirst;

export default findFirst;
