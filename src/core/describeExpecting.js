import {joinSeries, placeName, numberName, quantityName} from "./english";
import {unorderedAmountSingular} from "./expecting";
import {isArray, isNumber} from "./types";

export const unorderedTypes = [
    {singular: "number", plural: "numbers"},
    {singular: "function", plural: "functions"},
    {singular: "sequence", plural: "sequences"},
];

// Provide amount descriptors with a maximually human-readable ordering.
export const amountAppearanceOrder = function(expectsA, expectsB){
    const amountA = expectsA ? expectsA.amount : 0;
    const amountB = expectsB ? expectsB.amount : 0;
    if(!amountA) return -1;
    if(!amountB) return +1;
    if(isNumber(amountA)) return -1;
    if(isNumber(amountB)) return +1;
    if(isArray(amountA) && amountA[1] !== "+") return -1;
    if(isArray(amountB) && amountB[1] !== "+") return +1;
    if(isArray(amountA)) return -1;
    if(isArray(amountB)) return +1;
    if(amountA === "+") return -1;
    if(amountB === "+") return +1;
    if(amountA === "?") return -1;
    if(amountB === "?") return +1;
    return 0;
};

export const getUnorderedType = function(typeName){
    for(const type of unorderedTypes){
        if(typeName === type.singular || typeName === type.plural) return type;
    }
    return undefined;
};

export const describeAmount = function(expectsType, type){
    if(process.env.NODE_ENV !== "development") return "";
    const amount = expectsType ? expectsType.amount : 0;
    const singular = type.singular;
    const plural = type.plural;
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
        return `an optional ${singular}`;
    }else{
        return "";
    }
};

// Get an English explanation of the arguments that a function expects.
// When "error" is truthy, the function may helpfully suggest your options for
// addressing an error.
export const describeExpecting = function(expects){
    if(process.env.NODE_ENV !== "development") return "";
    if(expects.none){
        return "The function accepts no arguments.";
    }else if(expects.anything){
        return "The function accepts any number of arguments of any type.";
    }else if(expects.one){
        return `The function expects one ${expects.one.singular} as input.`;
    }else if(expects.ordered){
        let base = "";
        if(expects.ordered.order.length === 1){
            base = `The function expects one ${expects.ordered.order[0].singular}`;
        }else{
            const parts = [];
            for(const expect of expects.ordered.order){
                parts.push(`${expect.article} ${expect.singular}`);
            }
            base = `The function expects, in this order, ${joinSeries(parts)}`;
        }
        if(expects.ordered.plusVariadic){
            const variadic = expects.ordered.plusVariadic;
            return (
                `plus ${describeAmount(variadic.amount, variadic.type)} ` +
                "as input."
            );
        }else{
            return `${base} as input.`;
        }
    }else if(expects.unordered){
        const unordered = expects.unordered;
        const types = ["numbers", "functions", "sequences"];
        if(amountAppearanceOrder(unordered[types[0]], unordered[types[1]]) > 0){
            const t = types[0];
            types[0] = types[1];
            types[1] = t;
        }
        if(amountAppearanceOrder(unordered[types[0]], unordered[types[2]]) > 0){
            const t = types[0];
            types[0] = types[2];
            types[2] = t;
        }
        if(amountAppearanceOrder(unordered[types[1]], unordered[types[2]]) > 0){
            const t = types[1];
            types[1] = types[2];
            types[2] = t;
        }
        const amounts = [];
        const post = {numbers: [], functions: [], sequences: []};
        for(const type of types){
            const fullType = getUnorderedType(type);
            if(unordered[type]){
                if(unordered[type].all){
                    amounts.push(describeAmount(unordered[type], unordered[type].all));
                }else if(unordered[type].amount){
                    if(unordered[type].order && unordered[type].order.length === 1){
                        amounts.push(describeAmount(unordered[type], unordered[type].order[0]));
                    }else{
                        amounts.push(describeAmount(unordered[type], fullType));
                    }
                }
                if(unordered[type].any){
                    if(unordered[type].amount === "*" || (
                        isArray(unordered[type].amount) &&
                        unordered[type].amount[0] === 0
                    )){
                        post[type].push(
                            `At least one of the ${fullType.plural}, if any ` +
                            `are given, must be ${unordered[type].any.adjective}.`
                        );
                    }else{
                        post[type].push(
                            `At least one of the ${fullType.plural} must be ` +
                            `${unordered[type].any.adjective}.`
                        );
                    }
                }
                if(unordered[type].order){
                    const order = unordered[type].order;
                    for(let i = 0; i < order.length; i++){
                        if(!order[i]) continue;
                        const mustBe = (
                            type !== "functions" && order[i].adjective ?
                            order[i].adjective : (
                                order[i].article + " " + order[i].singular
                            )
                        );
                        if(unordered[type].amount === 1 || unordered[type].amount === "?"){
                            // Do nothing (handled above)
                        }else if(unorderedAmountOptional(unordered[type].amount, i)){
                            post[type].push(
                                `The ${placeName(i + 1)} ${fullType.singular}, ` +
                                `if specified, must be ${mustBe}.`
                            );
                        }else{
                            post[type].push(
                                `The ${placeName(i + 1)} ${fullType.singular} ` +
                                `must be ${mustBe}.`
                            );
                        }
                    }
                }
            }
        }
        let result = (amounts.length === 1 ?
            `The function expects ${joinSeries(amounts)} as input.` :
            `The function expects, in any order, ${joinSeries(amounts)} as input.`
        );
        for(const postType of types){
            if(post[postType].length) result += ` ${post[postType].join(" ")}`;
        }
        return result;
    }
};

export const describeExpectingViolation = function(expects, violation){
    if(process.env.NODE_ENV !== "development") return undefined;
    let message = undefined;
    if(violation.type){
        const type = getUnorderedType(violation.type);
        if(violation.wrongAmount !== undefined){
            const expectedType = expects.unordered[type.plural];
            message = (
                `Expected ${describeAmount(expectedType, type)} ` +
                `but found ${quantityName(violation.wrongAmount)}.`
            );
        }else if(violation.index !== undefined){
            if(violation.order && violation.order.length > 1) message = (
                `Expected the ${placeName(violation.index + 1)} ${type.singular} ` +
                `to be ${violation.wasNot.article} ${violation.wasNot.singular} ` +
                "but it was not."
            );
            else if(violation.order) message = (
                `Expected the ${type.singular} to be ${violation.wasNot.article} ` +
                `${violation.wasNot.singular} but it was not.`
            );
            else if(violation.all) message = (
                `Expected the all the ${type.plural} to be ${violation.wasNot.plural} ` +
                `but the ${placeName(violation.index + 1)} ${type.singular} was not.`
            );
        }else if(violation.any){
            message = (
                `Expected the at least one of the ${type.plural} to be ` +
                `${violation.wasNot.article} ${violation.wasNot.singular} but ` +
                `none of them were.`
            );
        }
    }else if(violation.invalid){
        message = (
            "But found a value that was neither a number, function, or sequence " +
            `at position ${violation.index}.`
        );
    }else if(violation.index !== undefined){
        message = (
            `Expected ${violation.wasNot.article} ${violation.wasNot.singular} ` +
            `at position ${violation.index} but found something else.`
        );
    }else if(violation.one){
        message = (
            `Expected ${violation.wasNot.article} ${violation.wasNot.singular} ` +
            `as the single argument but found something else.`
        );
    }
    let suggestion = "";
    if(message && violation.wasNot && violation.wasNot.suggestion){
        suggestion = violation.wasNot.suggestion;
    }
    return {
        message: message,
        suggestion: suggestion,
    };
};

export default describeExpecting;
