export const hi = (source) => {
    return hi.asSequence(source);
}

export default hi;

Object.assign(hi, {
    version: "0.1.0",
    
    // Error types will be placed here.
    error: {},
    // Sequence types will be placed here.
    sequence: {},
    
    // Receives an object or objects returned by the wrap function.
    register: function(...fancyFunctions){
        for(const fancy of fancyFunctions){
            for(const name of fancy.names){
                this[name] = fancy;
                if(fancy.async){
                    this[name + "Async"] = fancy.async;
                }
            }
            if(fancy.sequences) for(const sequence of fancy.sequences){
                this.sequence[sequence.name] = sequence;
            }
            if(fancy.errors) for(const error of fancy.errors){
                this.error[error.name] = error;
            }
        }
        return fancyFunctions[0];
    },
});

// Core modules
import {args} from "./core/arguments";
import {callAsync} from "./core/callAsync";
import {constants} from "./core/constants";
// import {canGetLength, getLength} from "../core/length"; // Not exposed
import {isSequence, Sequence} from "./core/sequence";
import {wrap} from "./core/wrap";
import {
    isUndefined, isNumber, isString, isArray, isObject, isFunction, isIterable
} from "./core/types";
import {
    asSequence, validAsSequence, validAsBoundedSequence,
    ArraySequence, StringSequence, ObjectSequence, IterableSequence
} from "./core/asSequence";

hi.args = args;
hi.callAsync = callAsync;
hi.constants = constants;
hi.isSequence = isSequence;
hi.Sequence = Sequence;
hi.wrap = wrap;
hi.isUndefined = isUndefined;
hi.isNumber = isNumber;
hi.isString = isString;
hi.isArray = isArray;
hi.isObject = isObject;
hi.isFunction = isFunction;
hi.isIterable = isIterable;
hi.asSequence = asSequence;
hi.validAsSequence = validAsSequence;
hi.validAsBoundedSequence = validAsBoundedSequence;

hi.sequence.ArraySequence = ArraySequence;
hi.sequence.StringSequence = StringSequence;
hi.sequence.ObjectSequence = ObjectSequence;
hi.sequence.IterableSequence = IterableSequence;

// Assertions
import {
    AssertError, assert, assertNot, assertUndefined, assertEqual, assertSeqEqual
} from "./core/assert";
hi.error.AssertError = AssertError;
hi.assert = assert;
hi.assertNot = assertNot;
hi.assertUndefined = assertUndefined;
hi.assertEqual = assertEqual;
hi.assertSeqEqual = assertSeqEqual;

// Function registry
import {any} from "./functions/any"; hi.register(any);
import {all} from "./functions/all"; hi.register(all);
import {array} from "./functions/array"; hi.register(array);
import {assumeBounded} from "./functions/assumeBounded"; hi.register(assumeBounded);
import {benchmark} from "./functions/benchmark"; hi.register(benchmark);
import {bigrams} from "./functions/bigrams"; hi.register(bigrams);
import {chunk} from "./functions/chunk"; hi.register(chunk);
import {concat} from "./functions/concat"; hi.register(concat);
import {consume} from "./functions/consume"; hi.register(consume);
import {containsElement} from "./functions/containsElement"; hi.register(containsElement);
import {count} from "./functions/count"; hi.register(count);
import {distinct} from "./functions/distinct"; hi.register(distinct);
import {dropHead} from "./functions/dropHead"; hi.register(dropHead);
import {dropTail} from "./functions/dropTail"; hi.register(dropTail);
import {each} from "./functions/each"; hi.register(each);
import {empty} from "./functions/empty"; hi.register(empty);
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
import {head} from "./functions/head"; hi.register(head);
import {homogenous} from "./functions/homogenous"; hi.register(homogenous);
import {join} from "./functions/join"; hi.register(join);
import {last} from "./functions/last"; hi.register(last);
import {lexOrder} from "./functions/lexOrder"; hi.register(lexOrder);
import {limit} from "./functions/limit"; hi.register(limit);
import {map} from "./functions/map"; hi.register(map);
import {max} from "./functions/max"; hi.register(max);
import {min} from "./functions/min"; hi.register(min);
import {newArray} from "./functions/newArray"; hi.register(newArray);
import {ngrams} from "./functions/ngrams"; hi.register(ngrams);
import {none} from "./functions/none"; hi.register(none);
import {object} from "./functions/object"; hi.register(object);
import {once} from "./functions/once"; hi.register(once);
import {one} from "./functions/one"; hi.register(one);
import {pad} from "./functions/pad"; hi.register(pad);
import {partial} from "./functions/partial"; hi.register(partial);
import {partition} from "./functions/partition"; hi.register(partition);
import {pipe} from "./functions/pipe"; hi.register(pipe);
import {product} from "./functions/product"; hi.register(product);
import {range} from "./functions/range"; hi.register(range);
import {recur} from "./functions/recur"; hi.register(recur);
import {repeat} from "./functions/repeat"; hi.register(repeat);
import {repeatElement} from "./functions/repeatElement"; hi.register(repeatElement);
import {reverse} from "./functions/reverse"; hi.register(reverse);
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
import {time} from "./functions/time"; hi.register(time);
import {trigrams} from "./functions/trigrams"; hi.register(trigrams);
import {until} from "./functions/until"; hi.register(until);
import {write} from "./functions/write"; hi.register(write);
import {zip} from "./functions/zip"; hi.register(zip);
