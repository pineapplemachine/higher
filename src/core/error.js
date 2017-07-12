export const error = function(methods){
    const name = methods.constructor.name;
    const wrapped = (...args) => {
        const err = new Error();
        methods.constructor.apply(err, args);
        err.type = name;
        return err;
    };
    Object.defineProperty(wrapped, "name", {value: name, writable: false});
    wrapped.enforce = methods.enforce;
    error[name] = wrapped;
    return wrapped;
};

export default error;
