import {addConverter} from "../core/addConverter";
import {lightWrap} from "../core/lightWrap";

import {isConsumer} from "./consumer";

export const consumerConverters = [];

export const asConsumer = lightWrap({
    summary: "Get a @Converter corresponding to some input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects one argument of any type.
        `),
        returns: (`
            The function returns a @Consumer object when there was any applicable
            converter.
            If no consumer could be acquired for the input, then the function
            returns #undefined.
        `),
        developers: (`
            Note that every converter that is registered slightly increases the
            performance impact of calling the function. For low numbers of
            converters the impact is negligible, but registering a great number
            of converters may have a noticable impact.
        `),
        examples: [
            "basicUsageArray", "basicUsageString",
            "basicUsageObject", "basicUsageIterator",
        ],
        related: [
            "validAsConsumer", "isConverter",
        ],
    },
    implementation: function asConsumer(value){
        if(isConsumer(value)) return value;
        for(const consumerType of consumerConverters){
            if(consumerType.converter.predicate(value)){
                return new consumerType(value);
            }
        }
        return undefined;
    },
});

export const addConsumerConverter = lightWrap({
    summary: "Register a new consumer converter.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function addConsumerConverter(converter){
        addConverter(converter, consumerConverters);
    },
});

export const validAsConsumer = lightWrap({
    summary: "Get whether a @Converter may be constructed from an input.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        examples: [
            "basicUsage",
        ],
    },
    implementation: function validAsConsumer(value){
        if(isConsumer(value)) return true;
        for(const consumerType of consumerConverters){
            if(consumerType.converter.predicate(value)){
                return true;
            }
        }
        return false;
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            hi.assert(hi.validAsConsumer([1, 2, 3]));
            hi.assertNot(hi.validAsConsumer(undefined));
        },
    },
});
