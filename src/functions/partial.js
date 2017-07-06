import {Sequence} from "../core/sequence";
import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

const expectingArrayOrFalsey = (value) => {
    if(value && !isArray(value)){
        // TODO: Better error message
        throw "Expecting an array or a falsey value.";
    }else{
        return value;
    }
};

export const partial = wrap({
    name: "partial",
    attachSequence: true,
    async: false,
    arguments: {
        ordered: [
            wrap.expecting.function, expectingArrayOrFalsey, expectingArrayOrFalsey
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
