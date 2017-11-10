import {wrap} from "../core/wrap";

import {expectingConsumer} from "../consumer/expectingConsumer";

export const matches = wrap({
    name: "matches",
    summary: "Check if a consumer matches a given sequence.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
        expects: (`
            The function expects a sequence and a consumer as input.
        `),
        returns: (`
            The function returns a truthy value when the consumer matched the
            complete input sequence and a falsey value when it did not.
        `),
        warnings: (`
            This function will produce an infinite loop when the consumer
            matches an infinite number of elements in an unbounded input
            sequence.
        `),
        returnType: "boolean",
        examples: [
            "basicUsage",
        ],
        related: [
            "startsWith",
            "endsWidth",
        ],
    },
    attachSequence: true,
    async: true,
    arguments: {
        ordered: [wrap.expecting.sequence, expectingConsumer],
    },
    implementation: function matches(source, consumer){
        const currentConsumer = consumer.copy();
        for(const element of source){
            currentConsumer.push(element);
            if(currentConsumer.done()){
                return false;
            }
        }
        currentConsumer.pushEnd();
        if(currentConsumer.done()){
            return currentConsumer.match();
        }
    },
    tests: process.env.NODE_ENV !== "development" ? undefined : {
        "basicUsage": hi => {
            const isSpace = i => i === " ";
            const spacePattern = new hi.consumer.PredicateConsumer(isSpace);
            hi.assert(hi("    ").matches(spacePattern));
            hi.assertNot(hi("hello").matches(spacePattern));
        },
    },
});

export default matches;
