import {lightWrap} from "../core/lightWrap";

export const isConsumer = lightWrap({
    summary: "Determine whether a value is some @Consumer.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function accepts one argument of any kind.
        `),
        returns: (`
            The function returns true when the input was a @Consumer and false
            otherwise.
        `),
        examples: [
            "basicUsage",
        ],
        related: [
            "asSequence", "validAsSequence",
        ],
    },
    implementation: function isConsumer(value){
        return value && value instanceof Consumer;
    },
    tests: {
        "basicUsage": hi => {
            const consumer = new hi.consumer.PredicateConsumer(i => true);
            hi.assert(hi.isConsumer(consumer));
            const predicate = i => false;
            hi.assertNot(hi.isConsumer(predicate));
        },
        "nilInput": hi => {
            hi.assertNot(hi.isConsumer(null));
            hi.assertNot(hi.isConsumer(undefined));
            hi.assertNot(hi.isConsumer(NaN));
        },
    },
});

export const Consumer = function(){};

export default Consumer;
