import {lightWrap} from "./lightWrap";

export const errorTypes = {};

export const defineError = lightWrap({
    summary: "Define an error type.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineError(methods){
        const name = methods.constructor.name;
        const wrapped = (...args) => {
            const err = new Error();
            methods.constructor.apply(err, args);
            err.type = name;
            return err;
        };
        Object.defineProperty(wrapped, "name", {value: name, writable: false});
        wrapped.enforce = methods.enforce;
        errorTypes[name] = wrapped;
        return wrapped;
    },
});

// Convenience alias
export const error = defineError;

export default defineError;
