import {isString} from "../core/types";
import {wrap} from "../core/wrap";

import {NotBoundedError} from "../errors/NotBoundedError";

export const string = wrap({
    name: "string",
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        if(isString(source)) return source;
        NotBoundedError.enforce(source, {
            message: "Failed to create string",
        });
        let result = "";
        for(const element of source) result += element;
        return result;
    },
});

export default string;
