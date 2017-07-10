import {NotBoundedError} from "../core/sequence";
import {wrap} from "../core/wrap";

export const string = wrap({
    name: "string",
    attachSequence: true,
    async: true,
    arguments: {
        one: wrap.expecting.iterable
    },
    implementation: (source) => {
        NotBoundedError.enforce(source, {
            message: "Failed to create string",
        });
        let result = "";
        for(const element of source) result += element;
        return result;
    },
});

export default string;
