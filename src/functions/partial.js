// Generate a partially-applied function.
hi.partial = function(target, leftArgs, rightArgs){
    return (...callArgs) => {
        const useArgs = callArgs;
        if(leftArgs) useArgs.unshift(...leftArgs);
        if(rightArgs) useArgs.push(...rightArgs);
        return target(...useArgs);
    };
};

// Generate a partially-applied function.
// The sequence the method is called for will be the left-most argument.
hi.Sequence.prototype.partial = function(target, leftArgs, rightArgs){
    return (...callArgs) => {
        const useArgs = callArgs;
        if(leftArgs) useArgs.unshift(...leftArgs);
        if(rightArgs) useArgs.push(...rightArgs);
        return target(this, ...useArgs);
    };
};
