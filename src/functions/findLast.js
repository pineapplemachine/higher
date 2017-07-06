import {asSequence, canGetLength, getLength} from "../core/asSequence";
import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {FindSequenceResult, BackwardFindSequenceThread, stepFindThreads} from "./findAll";
import {equals} from "./equals";

// Find the last occurrence of a substring as judged by a comparison function.
export const findLast = wrap({
    name: "findLast",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            functions: "?",
            sequences: 2
        }
    },
    implementation: (compare, sequences) => {
        const source = sequences[0];
        const search = sequences[1];
        const compareFunc = compare || constants.defaults.comparisonFunction;
        // Handle empty or unbounded search subject
        if(search.done() || search.unbounded()){
            return undefined;
        }
        // Handle case where search length is known to be at least source length
        if(search.length && canGetLength(source)){
            const searchLength = search.length();
            const sourceLength = getLength(source);
            if(searchLength === sourceLength && equals.raw(compareFunc, [search, source])){
                return new FindSequenceResult(asSequence(source), 0, sourceLength);
            }else if(searchLength > sourceLength){
                return undefined;
            }
        }
        // Source sequence absolutely must be bidirectional and have known length
        if(!source.length || !source.back){
            source.forceEager();
        }
        // Search sequence absolutely must be copyable and bidirectional
        if(!search.copy || !search.back){
            search.forceEager();
        }
        const searchElement = search.nextBack();
        // Handle single-element search subject
        if(search.done()){
            let index = 0;
            while(!source.done()){
                if(compareFunc(source.nextBack(), searchElement)){
                    return new FindSequenceResult(
                        source, index, index + 1
                    );
                }
                index++;
            }
            return undefined;
        }
        // Handle search subject of two or more elements
        const findObject = {
            threadType: BackwardFindSequenceThread,
            stepThreads: stepFindThreads,
            compare: compareFunc,
            source: source,
            search: search,
            searchElement: searchElement,
            nextSearchElement: search.nextBack(),
            searchThreads: [],
            index: source.length(),
        };
        while(!source.done()){
            const result = findObject.stepThreads(source.nextBack());
            if(result) return result;
            findObject.index--;
        }
        return undefined;
    },
});

export default findLast;
