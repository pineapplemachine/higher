import {addSequenceConverter, asSequence, validAsSequence} from "./asSequence";
import {callAsync} from "./callAsync";
import {constants} from "./constants";
import {joinSeries} from "./english";
import {isArray, isFunction, isIterable, isNumber, isObject} from "./types";

// True when an unordered amount descriptor indicates that no arguments
// of a type are accepted.
export const unorderedAmountNone = function(amount){
    return !amount;
};

// True when an unordered amount descriptor indicates that either one or
// zero arguments of a type are accepted.
export const unorderedAmountSingular = function(amount){
    return amount === 1 || amount === "?";
};

// True when an unordered amount descriptor indicates that two or more arguments
// would be accepted.
export const unorderedAmountPlural = function(amount){
    return amount && amount !== 1 && amount !== "?";
};

// True when an unordered amount descriptor indicates that zero arguments of
// a type would be accepted or, if an index was provided, when the argument
// at that particular index is considered to be optional by the amount given.
export const unorderedAmountOptional = function(amount, index = undefined){
    return amount === "?" || amount === "+" || amount === "*" || (
        isArray(amount) && (amount[0] === 0 || index >= amount[0])
    ) ;
};

export const normalizeExpecting = (args) => {
    const places = [
        "first", "second", "third", "fourth",
    ];
    if(args && args.unordered){
        const unordered = args.unordered;
        for(const type of ["numbers", "functions", "sequences"]){
            if(unordered[type]){
                if(!unordered[type].amount){
                    if(unordered[type].one){
                        unordered[type].amount = 1;
                        unordered[type].order = [unordered[type].one];
                    }else if(unordered[type].optional){
                        unordered[type].amount = "?";
                        unordered[type].order = [unordered[type].optional];
                    }else if(unordered[type].anyNumberOf){
                        unordered[type].amount = "*";
                        unordered[type].all = unordered[type].anyNumberOf;
                    }else if(unordered[type].atLeastOne){
                        unordered[type].amount = "+";
                        unordered[type].all = unordered[type].atLeastOne;
                    }else if(unordered[type].order){
                        unordered[type].amount = unordered[type].order.length;
                    }else{
                        unordered[type] = {amount: unordered[type]};
                    }
                }else if(isArray(unordered[type].amount)){
                    // [0, 1] is the same as "?"
                    if(unordered[type].amount[0] === 0 && unordered[type].amount[1] === 1){
                        unordered[type].amount = "?";
                    // [0, "+"] is the same as "+"
                    }else if(unordered[type].amount[0] === 0 && unordered[type].amount[1] === "+"){
                        unordered[type].amount = "+";
                    // [n, n] is the same as n
                    }else if(unordered[type].amount[0] === unordered[type].amount[1]){
                        unordered[type].amount = unordered[type].amount[0];
                    }
                }
                for(let i = 0; i < places.length; i++){
                    if(places[i] in unordered[type]){
                        if(!unordered[type].order) unordered[type].order = [];
                        unordered[type].order[i] = unordered[type][places[i]];
                        unordered[type].order.length = Math.max(
                            i + 1, unordered[type].order.length
                        );
                    }
                }
            }
        }
    }
    if(args && args.optional){
        args.one = expecting.optional(args.optional);
    }
    if(args && args.ordered){
        if(isArray(args.ordered)){
            args.ordered = {
                order: args.ordered,
            };
        }else{
            for(let i = 0; i < places.length; i++){
                if(places[i] in args.ordered){
                    if(!args.ordered.order) args.ordered.order = [];
                    args.ordered.order[i] = args.ordered[places[i]];
                    args.ordered.order.length = Math.max(
                        i + 1, args.ordered.order.length
                    );
                }
            }
        }
    }
    return args;
};

// Used by expecting.either
const eitherString = function(options, plural = undefined){
    let type = options.length ? options[0].type : undefined;
    for(const option of options){
        if(option.type !== type || !option.adjective){
            type = undefined;
            break;
        }
    }
    if(type){
        const adjectives = [];
        for(const option of options) adjectives.push(option.adjective);
        return joinSeries(adjectives, "or") + " " + type + (plural ? "s" : "");
    }else{
        const names = [];
        for(const option of options) names.push(
            plural ? option.plural : option.singular
        );
        return names;
    }
};
const eitherTransforms = function(options){
    for(const option in options){
        if(option.transforms) return true;
    }
    return false;
};

export const Expecting = function(options){
    const func = options.validate;
    func.type = options.type;
    func.article = options.article || "a";
    func.singular = options.singular;
    func.plural = options.plural || options.singular + "s";
    func.adjective = options.adjective;
    func.shortArticle = options.shortArticle;
    func.short = options.short;
    func.sequence = options.sequence;
    func.suggestion = options.suggestion;
    func.transforms = options.transforms;
    return func;
};

export const expecting = {
    anything: Expecting({
        type: "anything",
        article: "a",
        singular: "value of any type",
        plural: "values of any type",
        adjective: "anything",
        transforms: false,
        validate: value => value,
    }),
    number: Expecting({
        type: "number",
        article: "a",
        singular: "number",
        plural: "numbers",
        adjective: "numeric",
        transforms: false,
        validate: value => {
            if(!isNumber(value)) throw new Error();
            return value;
        },
    }),
    positiveNumber: Expecting({
        type: "number",
        article: "a",
        singular: "positive number",
        plural: "positive numbers",
        short: "number",
        adjective: "positive",
        transforms: false,
        validate: value => {
            if(!isNumber(value) || value <= 0) throw new Error();
            return value;
        },
    }),
    negativeNumber: Expecting({
        type: "number",
        article: "a",
        singular: "negative number",
        plural: "negative numbers",
        short: "number",
        adjective: "negative",
        transforms: false,
        validate: value => {
            if(!isNumber(value) || value >= 0) throw new Error();
            return value;
        },
    }),
    nonNegativeNumber: Expecting({
        type: "number",
        article: "a",
        singular: "non-negative number",
        plural: "non-negative numbers",
        short: "number",
        adjective: "non-negative",
        transforms: false,
        validate: value => {
            if(!isNumber(value) || value < 0) throw new Error();
            return value;
        },
    }),
    integer: Expecting({
        type: "number",
        article: "an",
        singular: "integer",
        plural: "integers",
        adjective: "integral",
        transforms: false,
        validate: value => {
            if(!Number.isInteger(value)) throw new Error();
            return value;
        },
    }),
    index: Expecting({
        type: "number",
        article: "a",
        singular: "index",
        plural: "indexes",
        adjective: "non-negative and integral",
        transforms: false,
        validate: value => {
            if(!Number.isInteger(value) || value < 0) throw new Error();
            return value;
        },
    }),
    nonNegativeInteger: Expecting({
        type: "number",
        article: "a",
        singular: "non-negative integer",
        plural: "non-negative integers",
        adjective: "non-negative integral",
        shortArticle: "an",
        short: "integer",
        transforms: false,
        validate: value => {
            if(!Number.isInteger(value) || value < 0) throw new Error();
            return value;
        },
    }),
    infinity: Expecting({
        type: "number",
        article: "an",
        singular: "infinity",
        plural: "infinities",
        adjective: "infinite",
        transforms: false,
        validate: value => {
            if(value !== Infinity) throw new Error();
            return value;
        },
    }),
    string: Expecting({
        type: "string",
        article: "a",
        singular: "string",
        plural: "strings",
        transforms: true,
        validate: value => {
            return String(value);
        },
    }),
    object: Expecting({
        type: "object",
        article: "an",
        singular: "object",
        plural: "objects",
        validate: value => {
            if(!isObject(value)) throw new Error();
            return value;
        },
    }),
    function: Expecting({
        type: "function",
        article: "a",
        singular: "function",
        plural: "functions",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    callback: Expecting({
        type: "function",
        article: "a",
        singular: "callback function",
        plural: "callback functions",
        short: "callback",
        adjective: "callback",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    predicate: Expecting({
        type: "function",
        article: "a",
        singular: "predicate function",
        plural: "predicate functions",
        short: "predicate",
        adjective: "predicate",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    transformation: Expecting({
        type: "function",
        article: "a",
        singular: "transformation function",
        plural: "transformation functions",
        short: "transformation",
        adjective: "transformation",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    comparison: Expecting({
        type: "function",
        article: "a",
        singular: "comparison function",
        plural: "comparison functions",
        short: "comparison",
        adjective: "comparison",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    relation: Expecting({
        type: "function",
        article: "a",
        singular: "relational function",
        plural: "relational functions",
        short: "relation",
        adjective: "relational",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    ordering: Expecting({
        type: "function",
        article: "an",
        singular: "ordering function",
        plural: "ordering functions",
        short: "ordering",
        adjective: "ordering",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    combination: Expecting({
        type: "function",
        article: "a",
        singular: "combination function",
        plural: "combination functions",
        short: "combination",
        adjective: "combination",
        transforms: false,
        validate: value => {
            if(!isFunction(value)) throw new Error();
            return value;
        },
    }),
    array: Expecting({
        type: "array",
        article: "an",
        singular: "array",
        plural: "arrays",
        transforms: false,
        validate: value => {
            if(!isArray(value)) throw new Error();
            return value;
        },
    }),
    arrayOf: element => Expecting({
        type: "array",
        article: "an",
        singular: `array of ${element.plural}`,
        plural: `arrays of ${element.plural}`,
        short: "array",
        transforms: element.transforms,
        validate: value => {
            if(!isArray(value)) throw new Error();
            const result = [];
            for(const element of value) result.push(element.validate(element));
            return result;
        },
    }),
    iterable: Expecting({
        type: "iterable",
        article: "an",
        singular: "iterable",
        plural: "iterables",
        adjective: "iterable",
        transforms: false,
        validate: value => {
            if(!isIterable(value)) throw new Error();
            return value;
        },
    }),
    sequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "sequence",
        plural: "sequences",
        sequence: true,
        transforms: true,
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence) throw new Error();
            return sequence;
        },
    }),
    implicitSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "implicit sequence",
        plural: "implicit sequences",
        adjective: "implicit",
        short: "sequence",
        sequence: true,
        transforms: true,
        validate: value => {
            const sequence = asImplicitSequence(value);
            if(!sequence) throw new Error();
            return sequence;
        },
    }),
    boundedSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "known-bounded sequence",
        plural: "known-bounded sequences",
        adjective: "known-bounded",
        short: "sequence",
        sequence: true,
        transforms: true,
        suggestion: (
            `A function such as "limit", "head", or "assumeBounded" may be used ` +
            "to acquire a known-bounded sequence from one whose boundedness " +
            "is unknown."
        ),
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || !sequence.bounded()) throw new Error();
            return sequence;
        },
    }),
    unboundedSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "known-unbounded sequence",
        plural: "known-unbounded sequences",
        adjective: "known-unbounded",
        short: "sequence",
        sequence: true,
        transforms: true,
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || !sequence.unbounded()) throw new Error();
            return sequence;
        },
    }),
    knownBoundsSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "known-bounded or known-unbounded sequence",
        plural: "known-bounded or known-unbounded sequences",
        adjective: "known-bounded or known-unbounded",
        short: "sequence",
        sequence: true,
        transforms: true,
        suggestion: (
            `A function such as "limit", "head", "assumeBounded", or "assumeUnbounded"` +
            "may be used to acquire a known-bounded or known-bounded sequence " +
            "from one whose boundedness is unknown."
        ),
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || (!sequence.bounded() && !sequence.unbounded())) throw new Error();
            return sequence;
        },
    }),
    knownLengthSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "sequence with known length",
        plural: "sequences with known length",
        adjective: "known-length",
        short: "sequence",
        sequence: true,
        transforms: true,
        suggestion: (
            `The "assumeLength" function may be used to acquire a known-length ` +
            "sequence from one whose length is definite yet not otherwise known."
        ),
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || !sequence.length) throw new Error();
            return sequence;
        },
    }),
    bidirectionalSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "bidirectional sequence",
        plural: "bidirectional sequences",
        adjective: "bidirectional",
        short: "sequence",
        sequence: true,
        transforms: true,
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence || !sequence.back) throw new Error();
            return sequence;
        },
    }),
    reversibleSequence: Expecting({
        type: "sequence",
        article: "a",
        singular: "reversible sequence",
        plural: "reversible sequences",
        adjective: "reversible",
        short: "sequence",
        sequence: true,
        transforms: true,
        validate: value => {
            const sequence = asSequence(value);
            if(!sequence) throw new Error();
            if(!sequence.back && !sequence.overrides.reverse) throw new Error();
            return sequence;
        },
    }),
    exactly: option => Expecting({
        article: "exactly",
        singular: String(option),
        plural: String(option),
        adjective: `exactly ${String(option)}`,
        transforms: false,
        validate: value => {
            if(value !== option) throw new Error();
            return value;
        },
    }),
    either: (...options) => Expecting({
        article: options[0].article,
        singular: eitherString(options, false),
        plural: eitherString(options, true),
        transforms: eitherTransforms(options),
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
        shortArticle: expect.shortArticle,
        short: expect.short,
        transforms: expect.transforms,
        validate: value => {
            if(value === null || value === undefined) return value;
            return expect(value);
        },
    }),
};
