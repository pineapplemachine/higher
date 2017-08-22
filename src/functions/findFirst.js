import {asSequence} from "../core/asSequence";
import {constants} from "../core/constants";
import {canGetLength, getLength} from "../core/length";
import {wrap} from "../core/wrap";

import {copyable} from "./copyable";
import {equals} from "./equals";
import {FindSequenceResult, ForwardFindSequenceThread, stepFindThreads} from "./findAll";

// Find the first occurrence of a substring as judged by a comparison function.
// Finding the first instance of a substring is overwhelmingly the most
// common use case for substring searching, so alias "find" to "findFirst"
// for maximum user convenience and minimum user confusion.
export const findFirst = wrap({
    names: ["findFirst", "find"],
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: {optional: wrap.expecting.comparison},
            sequences: 2,
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
});

export const find = findFirst;

export default findFirst;
