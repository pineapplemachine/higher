export const hi = (source) => {
    return hi.asSequence(source);
};

export default hi;

Object.assign(hi, {
    version: "0.1.0",
    // Registered functions will be placed here.
    functions: [],
    // Receives an object or objects returned by the wrap function.
    register: function(...fancyFunctions){
        for(const fancy of fancyFunctions){
            this.functions.push(fancy);
            for(const name of fancy.names){
                this[name] = fancy;
                if(fancy.async){
                    this[name + "Async"] = fancy.async;
                }
            }
        }
        return fancyFunctions[0];
    },
    // Run function unit tests
    testFunctions: process.env.NODE_ENV !== "development" ? undefined : function(){
        const result = {
            functions: {},
            failures: [],
        };
        for(const func of this.functions){
            if(func.test){
                const status = func.test(this);
                result.functions[func.name] = status;
                for(const failure of status.fail) result.failures.push(failure);
            }
        }
        return result;
    },
    // Run sequence contract tests
    testSequences: process.env.NODE_ENV !== "development" ? undefined : function(){
        const result = {
            sequences: {},
            failures: [],
        };
        for(const sequenceName in this.sequences){
            const sequence = this.sequences[sequenceName];
            if(sequence.test){
                const status = sequence.test(this);
                result.sequences[sequenceName] = status;
                for(const failure of status.fail) result.failures.push(failure);
            }
        }
        return result;
    },
    // Run all tests
    test: process.env.NODE_ENV !== "development" ? undefined : function(){
        const functions = this.testFunctions();
        const sequences = this.testSequences();
        const result = {
            functions: functions.functions,
            sequences: sequences.sequences,
            failures: [],
        };
        result.failures.push(...functions.failures);
        result.failures.push(...sequences.failures);
        return result;
    },
});

// Core modules
import {args} from "./core/arguments";
hi.args = args;

import {
    asSequence, asImplicitSequence,
    validAsSequence, validAsImplicitSequence,
    validAsBoundedSequence, validAsUnboundedSequence,
} from "./core/asSequence";
hi.asSequence = asSequence;
hi.asImplicitSequence = asImplicitSequence;
hi.validAsSequence = validAsSequence;
hi.validAsImplicitSequence = validAsImplicitSequence;
hi.validAsBoundedSequence = validAsBoundedSequence;
hi.validAsUnboundedSequence = validAsUnboundedSequence;

import {
    assert, assertNot, assertUndefined,
    assertEqual, assertNotEqual, assertEmpty, assertFail
} from "./core/assert";
hi.assert = assert;
hi.assertNot = assertNot;
hi.assertUndefined = assertUndefined;
hi.assertEqual = assertEqual;
hi.assertNotEqual = assertNotEqual;
hi.assertEmpty = assertEmpty;
hi.assertFail = assertFail;

import {callAsync} from "./core/callAsync";
hi.callAsync = callAsync;

import {constants} from "./core/constants";
hi.constants = constants;

import {error} from "./core/error";
hi.errors = error; // This attribute will contain all error types

import {isSequence, Sequence} from "./core/sequence";
hi.isSequence = isSequence;
hi.Sequence = Sequence;
hi.sequences = Sequence.types; // This attribute will contain all sequence types

import {
    isUndefined, isBoolean, isNumber, isInteger, isString, isArray,
    isObject, isFunction, isIterable,
} from "./core/types";
hi.isUndefined = isUndefined;
hi.isBoolean = isBoolean;
hi.isNumber = isNumber;
hi.isInteger = isInteger;
hi.isString = isString;
hi.isArray = isArray;
hi.isObject = isObject;
hi.isFunction = isFunction;
hi.isIterable = isIterable;

import {wrap} from "./core/wrap";
hi.wrap = wrap;

// Tests and documentation modules
import {coreDocs} from "./docs/coreDocs";
import {glossary} from "./docs/glossary";
import {contract} from "./test/contracts";
if(process.env.NODE_ENV === "development"){
    hi.coreDocs = coreDocs;
    hi.glossary = glossary;
    hi.contract = contract;
    hi.contracts = contract.contracts;
}

// Core sequence types
import {arrayAsSequence} from "./core/arrayAsSequence"; hi.register(arrayAsSequence);
import {stringAsSequence} from "./core/stringAsSequence"; hi.register(stringAsSequence);
import {iterableAsSequence} from "./core/iterableAsSequence"; hi.register(iterableAsSequence);
import {objectAsSequence} from "./core/objectAsSequence"; hi.register(objectAsSequence);

// Function registry
import {any} from "./functions/any"; hi.register(any);
import {anyPass} from "./functions/anyPass"; hi.register(anyPass);
import {all} from "./functions/all"; hi.register(all);
import {allPass} from "./functions/allPass"; hi.register(allPass);
import {array} from "./functions/array"; hi.register(array);
import {assumeBounded} from "./functions/assumeBounded"; hi.register(assumeBounded);
import {benchmark} from "./functions/benchmark"; hi.register(benchmark);
import {bigrams} from "./functions/bigrams"; hi.register(bigrams);
import {coalesce} from "./functions/coalesce"; hi.register(coalesce);
import {chunk} from "./functions/chunk"; hi.register(chunk);
import {collapse} from "./functions/collapse"; hi.register(collapse);
import {concat} from "./functions/concat"; hi.register(concat);
import {consume} from "./functions/consume"; hi.register(consume);
import {containsElement} from "./functions/containsElement"; hi.register(containsElement);
import {copyable} from "./functions/copyable"; hi.register(copyable);
import {count} from "./functions/count"; hi.register(count);
import {counter} from "./functions/counter"; hi.register(counter);
import {distinct} from "./functions/distinct"; hi.register(distinct);
import {dropHead} from "./functions/dropHead"; hi.register(dropHead);
import {dropTail} from "./functions/dropTail"; hi.register(dropTail);
import {each} from "./functions/each"; hi.register(each);
import {eager} from "./functions/eager"; hi.register(eager);
import {emptySequence} from "./functions/emptySequence"; hi.register(emptySequence);
import {endsWith} from "./functions/endsWith"; hi.register(endsWith);
import {enumerate} from "./functions/enumerate"; hi.register(enumerate);
import {equals} from "./functions/equals"; hi.register(equals);
import {filter} from "./functions/filter"; hi.register(filter);
import {findAll} from "./functions/findAll"; hi.register(findAll);
import {findFirst} from "./functions/findFirst"; hi.register(findFirst);
import {findLast} from "./functions/findLast"; hi.register(findLast);
import {first} from "./functions/first"; hi.register(first);
import {flatten} from "./functions/flatten"; hi.register(flatten);
import {flattenDeep} from "./functions/flattenDeep"; hi.register(flattenDeep);
import {from} from "./functions/from"; hi.register(from);
import {groupBy} from "./functions/groupBy"; hi.register(groupBy);
import {head} from "./functions/head"; hi.register(head);
import {homogenous} from "./functions/homogenous"; hi.register(homogenous);
import {identity} from "./functions/identity"; hi.register(identity);
import {isSorted} from "./functions/isSorted"; hi.register(isSorted);
import {join} from "./functions/join"; hi.register(join);
import {last} from "./functions/last"; hi.register(last);
import {lexOrder} from "./functions/lexOrder"; hi.register(lexOrder);
import {limit} from "./functions/limit"; hi.register(limit);
import {map} from "./functions/map"; hi.register(map);
import {match} from "./functions/match"; hi.register(match);
import {max} from "./functions/max"; hi.register(max);
import {min} from "./functions/min"; hi.register(min);
import {negate} from "./functions/negate"; hi.register(negate);
import {newArray} from "./functions/newArray"; hi.register(newArray);
import {newObject} from "./functions/newObject"; hi.register(newObject);
import {ngrams} from "./functions/ngrams"; hi.register(ngrams);
import {none} from "./functions/none"; hi.register(none);
import {nonePass} from "./functions/nonePass"; hi.register(nonePass);
import {object} from "./functions/object"; hi.register(object);
import {once} from "./functions/once"; hi.register(once);
import {one} from "./functions/one"; hi.register(one);
import {orderingToRelational} from "./functions/orderingToRelational"; hi.register(orderingToRelational);
import {pad} from "./functions/pad"; hi.register(pad);
import {partial} from "./functions/partial"; hi.register(partial);
import {partition} from "./functions/partition"; hi.register(partition);
import {pipe} from "./functions/pipe"; hi.register(pipe);
import {pluck} from "./functions/pluck"; hi.register(pluck);
import {product} from "./functions/product"; hi.register(product);
import {range} from "./functions/range"; hi.register(range);
import {recur} from "./functions/recur"; hi.register(recur);
import {reject} from "./functions/reject"; hi.register(reject);
import {relationalToOrdering} from "./functions/relationalToOrdering"; hi.register(relationalToOrdering);
import {repeat} from "./functions/repeat"; hi.register(repeat);
import {repeatElement} from "./functions/repeatElement"; hi.register(repeatElement);
import {reverse} from "./functions/reverse"; hi.register(reverse);
import {roundRobin} from "./functions/roundRobin"; hi.register(roundRobin);
import {sample} from "./functions/sample"; hi.register(sample);
import {shuffle} from "./functions/shuffle"; hi.register(shuffle);
import {split} from "./functions/split"; hi.register(split);
import {startsWith} from "./functions/startsWith"; hi.register(startsWith);
import {stride} from "./functions/stride"; hi.register(stride);
import {string} from "./functions/string"; hi.register(string);
import {sumKahan} from "./functions/sumKahan"; hi.register(sumKahan);
import {sumLinear} from "./functions/sumLinear"; hi.register(sumLinear);
import {sumShew} from "./functions/sumShew"; hi.register(sumShew);
import {tail} from "./functions/tail"; hi.register(tail);
import {tap} from "./functions/tap"; hi.register(tap);
import {tee} from "./functions/tee"; hi.register(tee);
import {time} from "./functions/time"; hi.register(time);
import {trigrams} from "./functions/trigrams"; hi.register(trigrams);
import {uniq} from "./functions/uniq"; hi.register(uniq);
import {until} from "./functions/until"; hi.register(until);
import {where} from "./functions/where"; hi.register(where);
import {write} from "./functions/write"; hi.register(write);
import {zip} from "./functions/zip"; hi.register(zip);
