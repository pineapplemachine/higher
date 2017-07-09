import {joinSeries} from "./joinSeries";
import {isString} from "./types";

export const error = function(methods){
    const name = methods.constructor.name;
    const wrapped = (...args) => {
        const err = new Error();
        methods.constructor.apply(err, args);
        return err;
    };
    Object.defineProperty(wrapped, "name", {value: name, writable: false});
    error[name] = wrapped;
    return wrapped;
};

export default error;
