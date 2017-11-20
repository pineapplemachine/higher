import {Expecting} from "../core/expecting";

import {asConsumer} from "./asConsumer";

export const expectingConsumer = Expecting({
    type: "consumer",
    article: "a",
    singular: "consumer",
    plural: "consumers",
    transforms: true,
    validate: value => {
        const converter = asConsumer(value);
        if(!converter) throw new Error();
        return converter;
    },
});

export default expectingConsumer;
