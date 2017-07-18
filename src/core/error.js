import {lightWrap} from "./lightWrap";

export const errorTypes = {};

export const defineError = lightWrap({
    summary: "Define an error type.",
    docs: process.env.NODE_ENV !== "development" ? undefined : {
        introduced: "higher@1.0.0",
    },
    implementation: function defineError(methods){
        const name = methods.constructor.name;
        const baseType = methods.baseType || Error;
        const wrapped = (...args) => {
            const err = new baseType();
            methods.constructor.apply(err, args);
            err.type = name;
            return err;
        };
        Object.defineProperty(
            wrapped, "name", {value: name, writable: false}
        );
        wrapped.enforce = methods.enforce;
        wrapped.type = name;
        errorTypes[name] = wrapped;
        return wrapped;
    },
});

// Convenience alias
export const error = defineError;

export default defineError;
