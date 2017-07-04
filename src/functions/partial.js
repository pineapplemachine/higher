import Sequence from "../core/sequence";

// Generate a partially-applied function.
const partial = function(target, leftArgs, rightArgs){
    return (...callArgs) => {
        const useArgs = callArgs;
        if(leftArgs) useArgs.unshift(...leftArgs);
        if(rightArgs) useArgs.push(...rightArgs);
        return target(...useArgs);
    };
};

// Generate a partially-applied function.
// The sequence the method is called for will be the left-most argument.
Sequence.prototype.partial = function(target, leftArgs, rightArgs){
    return (...callArgs) => {
        const useArgs = callArgs;
        if(leftArgs) useArgs.unshift(...leftArgs);
        if(rightArgs) useArgs.push(...rightArgs);
        return target(this, ...useArgs);
    };
};

export default partial;
