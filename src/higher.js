import {lightWrap} from "./core/lightWrap";

export const hi = (source) => {
    return hi.asSequence(source);
};

export default hi;

Object.assign(hi, {
    version: "0.1.0",
    function: {},
});

hi.register = lightWrap({
    summary: "Register a wrapped function with the @hi object.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function register(...functions){
        for(const wrapped of functions){
            this.function[wrapped.name] = wrapped;
            if(wrapped.internal){
                // Do nothing
            }else if(wrapped.names){
                for(const name of wrapped.names){
                    this[name] = wrapped;
                    if(wrapped.async) this[name + "Async"] = wrapped.async;
                }
            }else{
                this[wrapped.name] = wrapped;
            }
        }
        return functions[0];
    },
});

if(process.env.NODE_ENV === "development") hi.testFunctions = lightWrap({
    summary: "Run function tests.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function testFunctions(){
        const result = {
            functions: {},
            failures: [],
        };
        for(const functionName in this.function){
            const func = this.function[functionName];
            if(func.test){
                const status = func.test(this);
                result.functions[func.name] = status;
                for(const failure of status.fail) result.failures.push(failure);
            }
        }
        return result;
    },
});
    
if(process.env.NODE_ENV === "development") hi.testSequences = lightWrap({
    summary: "Run sequence tests.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function testSequences(){
        const result = {
            sequences: {},
            failures: [],
        };
        for(const sequenceName in this.sequence){
            const sequence = this.sequence[sequenceName];
            if(sequence.test){
                const status = sequence.test(this);
                result.sequences[sequenceName] = status;
                for(const failure of status.fail) result.failures.push(failure);
            }
        }
        return result;
    },
});
    
if(process.env.NODE_ENV === "development") hi.test = lightWrap({
    summary: "Run all tests.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function test(){
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

// core/asSequence
import {asSequence} from "./core/asSequence"; hi.register(asSequence);
import {asImplicitSequence} from "./core/asSequence"; hi.register(asImplicitSequence);
import {addSequenceConverter} from "./core/asSequence"; hi.register(addSequenceConverter);
import {validAsSequence} from "./core/asSequence"; hi.register(validAsSequence);
import {validAsImplicitSequence} from "./core/asSequence"; hi.register(validAsImplicitSequence);
import {validAsBoundedSequence} from "./core/asSequence"; hi.register(validAsBoundedSequence);
import {validAsUnboundedSequence} from "./core/asSequence"; hi.register(validAsUnboundedSequence);
// core/assert
import {assert} from "./core/assert"; hi.register(assert);
import {assertNot} from "./core/assert"; hi.register(assertNot);
import {assertUndefined} from "./core/assert"; hi.register(assertUndefined);
import {assertNull} from "./core/assert"; hi.register(assertNull);
import {assertNil} from "./core/assert"; hi.register(assertNil);
import {assertNaN} from "./core/assert"; hi.register(assertNaN);
import {assertEqual} from "./core/assert"; hi.register(assertEqual);
import {assertNotEqual} from "./core/assert"; hi.register(assertNotEqual);
import {assertEmpty} from "./core/assert"; hi.register(assertEmpty);
import {assertFail} from "./core/assert"; hi.register(assertFail);
import {assertFailWith} from "./core/assert"; hi.register(assertFailWith);
// core/callAsync
import {callAsync} from "./core/callAsync"; hi.register(callAsync);
// core/constants
import {constants} from "./core/constants"; hi.constant = constants;
// core/error
import {errorTypes} from "./core/error"; hi.error = errorTypes;
import {defineError} from "./core/error"; hi.register(defineError);
// core/isEqual
import {isEqual} from "./core/isEqual"; hi.register(isEqual);
import {sequencesEqual} from "./core/isEqual"; hi.register(sequencesEqual);
import {stringsEqual} from "./core/isEqual"; hi.register(stringsEqual);
import {objectsEqual} from "./core/isEqual"; hi.register(objectsEqual);
import {valuesEqual} from "./core/isEqual"; hi.register(valuesEqual);
// core/lightWrap
/* imported above */ hi.register(lightWrap);
// core/sequence
import {sequenceTypes} from "./core/sequence"; hi.sequence = sequenceTypes;
import {Sequence} from "./core/sequence"; hi.Sequence = Sequence;
import {attachSequenceMethods} from "./core/sequence"; hi.register(attachSequenceMethods);
import {isSequence} from "./core/sequence"; hi.register(isSequence);
import {defineSequence} from "./core/sequence"; hi.register(defineSequence);
// core/types
import {isUndefined} from "./core/types"; hi.register(isUndefined);
import {isNull} from "./core/types"; hi.register(isNull);
import {isNil} from "./core/types"; hi.register(isNil);
import {isBoolean} from "./core/types"; hi.register(isBoolean);
import {isNumber} from "./core/types"; hi.register(isNumber);
import {isInteger} from "./core/types"; hi.register(isInteger);
import {isNaN} from "./core/types"; hi.register(isNaN);
import {isString} from "./core/types"; hi.register(isString);
import {isArray} from "./core/types"; hi.register(isArray);
import {isSymbol} from "./core/types"; hi.register(isSymbol);
import {isPrimitive} from "./core/types"; hi.register(isPrimitive);
import {isObject} from "./core/types"; hi.register(isObject);
import {isPlainObject} from "./core/types"; hi.register(isPlainObject);
import {isFunction} from "./core/types"; hi.register(isFunction);
import {isIterable} from "./core/types"; hi.register(isIterable);
// core/wrap
import {wrap} from "./core/wrap"; hi.register(wrap);
// docs/glossary
import {glossary} from "./docs/glossary"; hi.glossary = glossary;
// test/contracts
import {contractTypes} from "./test/contracts"; hi.contract = contractTypes;
import {defineContract} from "./test/contracts"; hi.register(defineContract);

// Core sequence types
import {arrayAsSequence} from "./functions/arrayAsSequence"; hi.register(arrayAsSequence);
import {stringAsSequence} from "./functions/stringAsSequence"; hi.register(stringAsSequence);
import {iterableAsSequence} from "./functions/iterableAsSequence"; hi.register(iterableAsSequence);
import {objectAsSequence} from "./functions/objectAsSequence"; hi.register(objectAsSequence);

// Function registry
import {any} from "./functions/any"; hi.register(any);
import {anyPass} from "./functions/anyPass"; hi.register(anyPass);
import {all} from "./functions/all"; hi.register(all);
import {allPass} from "./functions/allPass"; hi.register(allPass);
import {array} from "./functions/array"; hi.register(array);
import {arrayDeep} from "./functions/arrayDeep"; hi.register(arrayDeep);
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
import {countBy} from "./functions/countBy"; hi.register(countBy);
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
import {homogeneous} from "./functions/homogeneous"; hi.register(homogeneous);
import {identity} from "./functions/identity"; hi.register(identity);
import {isSorted} from "./functions/isSorted"; hi.register(isSorted);
import {join} from "./functions/join"; hi.register(join);
import {last} from "./functions/last"; hi.register(last);
import {lexOrder} from "./functions/lexOrder"; hi.register(lexOrder);
import {limit} from "./functions/limit"; hi.register(limit);
import {map} from "./functions/map"; hi.register(map);
import {mapIndex} from "./functions/mapIndex"; hi.register(mapIndex);
import {match} from "./functions/match"; hi.register(match);
import {max} from "./functions/max"; hi.register(max);
import {min} from "./functions/min"; hi.register(min);
import {negate} from "./functions/negate"; hi.register(negate);
import {newArray} from "./functions/newArray"; hi.register(newArray);
import {newArrayDeep} from "./functions/newArrayDeep"; hi.register(newArrayDeep);
import {newObject} from "./functions/newObject"; hi.register(newObject);
import {ngrams} from "./functions/ngrams"; hi.register(ngrams);
import {none} from "./functions/none"; hi.register(none);
import {nonePass} from "./functions/nonePass"; hi.register(nonePass);
import {object} from "./functions/object"; hi.register(object);
import {once} from "./functions/once"; hi.register(once);
import {one} from "./functions/one"; hi.register(one);
import {orderingToRelational} from "./functions/orderingToRelational"; hi.register(orderingToRelational);
import {padLeft} from "./functions/padLeft"; hi.register(padLeft);
import {padLeftCount} from "./functions/padLeftCount"; hi.register(padLeftCount);
import {padRight} from "./functions/padRight"; hi.register(padRight);
import {padRightCount} from "./functions/padRightCount"; hi.register(padRightCount);
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
