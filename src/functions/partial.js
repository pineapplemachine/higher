import {wrap} from "../core/wrap";

export const partial = wrap({
    name: "partial",
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.function,
            wrap.expecting.optional(wrap.expecting.array),
            wrap.expecting.optional(wrap.expecting.array),
        ],
    },
    implementation: (target, leftArgs, rightArgs) => {
        return (...callArgs) => {
            const useArgs = callArgs;
            if(leftArgs) useArgs.unshift(...leftArgs);
            if(rightArgs) useArgs.push(...rightArgs);
            return target(...useArgs);
        };
    },
    methodImplementation: (sequence, target, leftArgs, rightArgs) => {
        return (...callArgs) => {
            const useArgs = callArgs;
            if(leftArgs) useArgs.unshift(...leftArgs);
            if(rightArgs) useArgs.push(...rightArgs);
            return target(sequence, ...useArgs);
        };
    },
});

export default partial;
