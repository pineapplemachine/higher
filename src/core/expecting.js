import {addSequenceConverter, asSequence, validAsSequence} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {joinSeries} from "./joinSeries";
import {isArray, isFunction, isIterable, isNumber, isObject} from "./types";

import {ArgumentsError} from "../errors/ArgumentsError";

const singularNames = function(expecting){
    const names = [];
    for(const e of expecting) names.push(e.singular);
    return names;
};

const pluralNames = function(expecting){
    const names = [];
    for(const e of expecting) names.push(e.plural);
    return names;
};

export const Expecting = function(options){
    const func = options.validate;
    func.article = options.article || "a";
    func.singular = options.singular;
    func.plural = options.plural || options.singular + "s";
    func.adjective = options.adjective;
    func.shortArticle = options.shortArticle;
    func.short = options.short;
    func.suggestion = options.suggestion;
    return func;
};

export const expecting = {
    anything: Expecting({
        article: "a",
        singular: "value of any type",
        plural: "values of any type",
        anything: true,
        validate: value => value,
    }),
    number: Expecting({
        article: "a",
        singular: "number",
        plural: "numbers",
        validate: value => {
            if(!isNumber(value)) throw new Error();
            return +value;
        },
    }),
    integer: Expecting({
        article: "an",
        singular: "integer",
        plural: "integers",
        adjective: "integral",
        validate: value => {
            if(!isNumber(value)) throw new Error();
            return Math.floor(+value);
        },
    }),
    index: Expecting({
        article: "a",
        singular: "non-negative integer",
        plural: "non-negative integers",
        adjective: "non-negative integral",
        shortArticle: "an",
        short: "index",
        validate: value => {
            if(!isNumber(value) || value < 0) throw new Error();
            return Math.floor(+value);
        },
    }),
    string: Expecting({
        article: "a",
        singular: "string",
        plural: "strings",
        validate: value => {
            return String(value);
        },
    }),
    object: Expecting({
        article: "an",
        singular: "object",
        plural: "objects",
        validate: value => {
            if(!isObject(value)) throw new Error();
            return value;
        },
    }),
    function: Expecting({
        article: "a",
        singular: "function",
        plural: "functions",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    callback: Expecting({
        article: "a",
        singular: "callback function",
        plural: "callback functions",
        short: "callback",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    predicate: Expecting({
        article: "a",
        singular: "predicate function",
        plural: "predicate functions",
        short: "predicate",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    transformation: Expecting({
        article: "a",
        singular: "transformation function",
        plural: "transformation functions",
        short: "transformation",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    comparison: Expecting({
        article: "a",
        singular: "comparison function",
        plural: "comparison functions",
        short: "comparison",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    relation: Expecting({
        article: "a",
        singular: "relational function",
        plural: "relational functions",
        short: "relation",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    ordering: Expecting({
        article: "an",
        singular: "ordering function",
        plural: "ordering functions",
        short: "ordering",
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    array: Expecting({
        article: "an",
        singular: "array",
        plural: "arrays",
        validate: value => {
            if(!isArray(value)) throw new Error();
            return value;
        },
    }),
    arrayOf: each => Expecting({
        article: "an",
        singular: `array of ${each.plural}`,
        plural: `arrays of ${each.plural}`,
        short: "array",
        validate: value => {
            if(!isArray(value)) throw new Error();
            const result = [];
            for(const element of value) result.push(each.validate(element));
            return result;
        },
    }),
    iterable: Expecting({
        article: "an",
        singular: "iterable",
        plural: "iterables",
        validate: value => {
            if(!isIterable(value)) throw new Error();
            return value;
        },
    }),
    sequence: Expecting({
        article: "a",
        singular: "sequence",
        plural: "sequences",
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence) throw new Error();
            return sequence;
        },
    }),
    implicitSequence: Expecting({
        article: "a",
        singular: "implicit sequence",
        plural: "implicit sequences",
        adjective: "implicit",
        short: "sequence",
        validate: value => {
            const sequence = asImplicitSequence(value);
            if(!sequence) throw new Error();
            return sequence;
        },
    }),
    boundedSequence: Expecting({
        article: "a",
        singular: "known-bounded sequence",
        plural: "known-bounded sequences",
        adjective: "known-bounded",
        short: "sequence",
        suggestion: (
            "Try using a method such as 'limit', 'head', or 'assumeBounded' " +
            "to get a known-bounded sequence from one not already known to be " +
            "bounded."
        ),
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || !sequence.bounded()) throw new Error();
            return sequence;
        },
    }),
    unboundedSequence: Expecting({
        article: "a",
        singular: "known-unbounded sequence",
        plural: "known-unbounded sequences",
        adjective: "known-unbounded",
        short: "sequence",
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || !sequence.unbounded()) throw new Error();
            return sequence;
        },
    }),
    knownBoundsSequence: Expecting({
        article: "a",
        singular: "known-bounded or known-unbounded sequence",
        plural: "known-bounded or known-unbounded sequences",
        adjective: "known-bounded or known-unbounded",
        short: "sequence",
        suggestion: (
            "Try using a method such as 'limit', 'head', 'assumeBounded', " +
            "or 'assumeUnbounded' to get a known-bounded or known-unbounded " +
            "sequence from one not already known to be either."
        ),
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || (!sequence.bounded() && !sequence.unbounded())) throw new Error();
            return sequence;
        },
    }),
    exactly: option => Expecting({
        article: "exactly",
        singular: String(option),
        plural: String(option),
        validate: value => {
            if(value !== option) throw new Error();
            return value;
        },
    }),
    any: options => Expecting({
        article: options[0].article,
        singular: `${joinSeries(singularNames(options), "or")}`,
        plural: `${joinSeries(pluralNames(options), "or")}`,
        validate: value => {
            for(const option of options){
                try{
                    return option(value);
                }catch(error){
                    // Do nothing
                }
            }
            throw new Error();
        },
    }),
    optional: expect => Expecting({
        article: "an",
        singular: `optional ${expect.singular}`,
        plural: `optional ${expect.plural}`,
        adjective: expect.adjective ? `optional ${expect.adjective}` : "optional",
        shortArticle: expect.shortArticle,
        short: expect.short,
        validate: value => {
            if(value === null || value === undefined) return value;
            return expect(value);
        },
    }),
};

export const unorderedTypes = [
    {singular: "number", plural: "numbers"},
    {singular: "function", plural: "functions"},
    {singular: "sequence", plural: "sequences"},
];

export const describeUnordered = function(expect, validator){
    const amount = expect.amount;
    const singular = validator.singular;
    const plural = validator.plural;
    if(!amount){
        return `no ${plural}`;
    }else if(isNumber(amount)){
        return `${numberName(amount)} ${+amount === 1 ? singular : plural}`;
    }else if(isArray(amount)){
        if(amount[1] === "+"){
            return `at least ${numberName(amount[0])} ${+amount[0] === 1 ? singular : plural}`;
        }else{
            return `between ${numberName(amount[0])} and ${numberName(amount[1])} ${plural}`;
        }
    }else if(amount === "*"){
        return `any number of ${plural}`;
    }else if(amount === "+"){
        return `at least one ${plural}`;
    }else if(amount === "?"){
        return `either one or zero ${plural}`;
    }else{
        return "";
    }
};

// TODO: Put this elsewhere
export const numberName = function(n){
    const strings = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
        "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
        "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
    ];
    if(Math.abs(n) <= strings.length){
        return n >= 0 ? strings[n] : "negative " + strings[n];
    }else{
        return "" + n;
    }
};

// TODO: Put this elsewhere
export const placeName = function(n){
    const strings = [
        "zeroth", "first", "second", "third", "fourth",
        "fifth", "sixth", "seventh", "eighth", "ninth",
    ];
    if(Math.abs(n) <= strings.length){
        return n >= 0 ? strings[n] : "negative " + strings[n];
    }else{
        const lastDigit = Math.abs(n) % 10;
        if(lastDigit === 1) return n + "st";
        else if(lastDigit === 2) return n + "nd";
        else if(lastDigit === 3) return n + "rd";
        else return n + "th";
    }
};

const describeExpectingError = function(expecting){
    return describeExpecting(expecting, true);
};

// Get an English explanation of the arguments that a function expects.
// When "error" is truthy, the function may helpfully suggest your options for
// addressing an error.
export const describeExpecting = function(expecting, error = undefined){
    if(expecting.none){
        return "The function accepts no arguments.";
    }else if(expecting.anything){
        return "The function accepts any number of arguments of any type.";
    }else if(expecting.one){
        return `The function expects one ${expecting.one.singular} as input.`;
    }else if(expecting.ordered){
        if(expecting.ordered.length === 1 && expecting.plusVariadic){
            return (
                `The function expects one ${expecting.ordered[0].singular} plus ` +
                "any number of additional arguments of any type as input."
            );
        }else{
            const parts = [];
            for(const expect of expecting.ordered){
                parts.push(`${expect.article} ${expect.singular}`);
            }
            const base = `The function expects, in this order, ${joinSeries(parts)} `;
            return base + (!expecting.plusVariadic ? "" :
                "plus any number of additional arguments of any type "
            ) + "as input.";
        }
    }else if(expecting.unordered){
        const parts = [];
        const post = [];
        const suggestions = {};
        for(const type of unorderedTypes){
            if(expecting.unordered[type.plural]){
                const expectingType = expecting.unordered[type.plural];
                if(expectingType.each){
                    parts.push(describeUnordered(expectingType, expectingType.each));
                    if(expectingType.each.suggestion){
                        const failedType = expectingType.each.singular;
                        suggestions[failedType] = expectingType.each;
                    };
                }else if(expectingType.amount){
                    if(expectingType.order && expectingType.order.length === 1){
                        parts.push(describeUnordered(expectingType, expectingType.order[0]));
                    }else{
                        parts.push(describeUnordered(expectingType, type));
                    }
                }
                if(expectingType.order){
                    for(let i = 0; i < expectingType.order.length; i++){
                        if(!expectingType.order[i]) continue;
                        const mustBe = (expectingType.order[i].adjective ?
                            expectingType.order[i].adjective :
                            expectingType.order[i].article + " " +
                            expectingType.order[i].singular
                        );
                        if(expectingType.amount === 1){
                            // Do nothing (handled above)
                        }else if(expectingType.amount === "?"){
                            post.push(
                                `The ${type.singular}, if specified, must be ${mustBe}.`
                            );
                        }else if(unorderedAmountOptional(expectingType.amount)){
                            post.push(
                                `The ${placeName(i + 1)} ${type.singular}, ` +
                                `if specified, must be ${mustBe}.`
                            );
                        }else{
                            post.push(
                                `The ${placeName(i + 1)} ${type.singular} ` +
                                `must be ${mustBe}.`
                            );
                        }
                        if(expectingType.order[i].suggestion){
                            const failedType = expectingType.order[i].singular;
                            suggestions[failedType] = expectingType.order[i];
                        };
                    }
                }
            }
        }
        let result = (parts.length === 1 ?
            `The function expects ${joinSeries(parts)} as input.` :
            `The function expects, in any order, ${joinSeries(parts)} as input.`
        );
        if(post.length) result += ` ${post.join(" ")}`;
        for(const failedType in suggestions){
            result += ` ${suggestions[failedType].suggestion}`;
        }
        return result;
    }
};

export const validateOne = function(arg, expecting){
    try{
        return expecting.one(arg);
    }catch(error){
        throw ArgumentsError({expects: describeExpectingError(expecting)});
    }
}

export const validateOrdered = function(args, expecting){
    try{
        for(let i = 0; i < expecting.ordered.length; i++){
            args[i] = expecting.ordered[i](args[i]);
        }
    }catch(error){
        throw ArgumentsError({expects: describeExpectingError(expecting)});
    }
    return args;
};

export const categorizeUnordered = function(args, expecting){
    const found = {
        numbers: [],
        functions: [],
        sequences: [],
    };
    for(const arg of args){
        if(isNumber(arg)){
            found.numbers.push(arg);
        }else{
            const sequence = asSequence(arg);
            if(sequence) found.sequences.push(sequence);
            else if(isFunction(arg)) found.functions.push(arg);
            else throw ArgumentsError({expects: describeExpectingError(expecting)});
        }
    }
    return found;
};

export const satisfiesUnordered = function(found, amount){
    if(!amount){
        return found === 0;
    }else if(isNumber(amount)){
        return found === amount;
    }else if(isArray(amount)){
        if(amount[1] === "+") return found >= amount[0];
        else return found >= amount[0] && found >= amount[0];
    }else if(amount === "*"){
        return true;
    }else if(amount === "+"){
        return found > 0;
    }else if(amount === "?"){
        return found <= 1;
    }else{
        throw new Error(`Invalid unordered argument amount "${amount}".`);
    }
};

export const unorderedAmountNone = function(amount){
    return !amount;
};
export const unorderedAmountSingular = function(amount){
    return amount === 1 || amount === "?";
};
export const unorderedAmountPlural = function(amount){
    return amount && amount !== 1 && amount !== "?";
};
export const unorderedAmountOptional = function(amount){
    return amount === "?" || amount === "+" || amount === "*" || (
        isArray(amount) && amount[0] === 0
    );
};

export const validateUnordered = function(args, expecting, extraSequence = undefined){
    const found = categorizeUnordered(args, expecting);
    const expect = {
        numbers: expecting.unordered.numbers,
        functions: expecting.unordered.functions,
        sequences: expecting.unordered.sequences,
    };
    // Prepend a sequence passed by a method wrapper
    if(extraSequence){
        found.sequences.splice(0, 0, extraSequence);
    }
    // Check argument counts and apply "each" and "ordered" validators.
    for(const type of unorderedTypes){
        const pl = type.plural;
        if(!expect[pl] ? found[pl].length :
            !satisfiesUnordered(found[pl].length, expect[pl].amount)
        ){
            throw ArgumentsError({expects: describeExpectingError(expecting)});
        }
        try{
            if(expect[pl] && (expect[pl].each || expect[pl].order)){
                if(expect[pl].each) for(let i = 0; i < found[pl].length; i++){
                    expect[pl].each(found[pl][i]);
                }
                if(expect[pl].order) for(let i = 0; i < found[pl].length; i++){
                    if(expect[pl].order[i]){
                        expect[pl].order[i](found[pl][i]);
                    }
                }
            }
        }catch(error){
            throw ArgumentsError({expects: describeExpectingError(expecting)});
        }
    }
    return found;
};

export const toUnorderedArguments = function(found, expecting){
    const args = [];
    if(expecting.unordered.numbers && expecting.unordered.numbers.amount){
        args.push(unorderedAmountPlural(expecting.unordered.numbers.amount) ?
            found.numbers : found.numbers[0]
        );
    }
    if(expecting.unordered.functions && expecting.unordered.functions.amount){
        args.push(unorderedAmountPlural(expecting.unordered.functions.amount) ?
            found.functions : found.functions[0]
        );
    }
    if(expecting.unordered.sequences && expecting.unordered.sequences.amount){
        args.push(unorderedAmountPlural(expecting.unordered.sequences.amount) ?
            found.sequences : found.sequences[0]
        );
    }
    return args;
};
