import {asSequence} from "../core/asSequence";
import {constants} from "../core/constants";
import {canGetLength, getLength} from "../core/length";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {equals} from "./equals";
import {FindSequenceResult, ForwardFindSequenceThread, stepFindThreads} from "./findAll";

export const findFirst = wrap({
    names: ["findFirst", "find"],
    summary: "Finds the first occurrance of a substring as judged by a comparison function.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        detail: (`

        `),
        expects: (`
            The function expects as input a comparison function and a sequence array
            which should contain a source sequence and a bounded search sequence.

            The function expects as input a sequence known to be bounded and
            an optional predicate function to apply to each element.
        `),
        returns: (`
            The function returns a @FindSequenceResult if an occurrance of the
            provided substring can be found. If none can be found, or the sequence
            is empty, returns @undefined.
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
        // Handle empty or unbounded search subject
        if(search.done() || search.unbounded()){
            return undefined;
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
        search = copyable.implementation(search);
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
            const seq = hi("a string to be searched").findFirst("to be");
            hi.assert(seq, (r) => r.index === 9);
        },
        "onlyFindsFirstOccurrance": (hi) => {
            const result = hi("hi higher higher higher higher").findFirst("higher");
            hi.assert(result, (r) => r.index === 3);
        },
        "undefinedWhenSubstringNotPresent": (hi) => {
            const seq = hi("not gonna find this").findFirst("hello?");
            hi.assertUndefined(seq);
        },
        "undefinedWhenSearchIsEmpty": (hi) => {
            const seq = hi([]).findFirst("missing");
            hi.assertUndefined(seq);
        },
        "indexesCorrect": (hi) => {
            const result = hi("lorem ipsum dolar sit amet").findFirst("ipsum");
            hi.assert(result, (r) => r.low === 6 && r.high === 11);
        },
        "searchLengthCorrect": (hi) => {
            const result = hi("a string to be searched").findFirst("string");
            hi.assert(result, (r) => r.length === 6);
        }
    },
});

export const find = findFirst;

export default findFirst;
