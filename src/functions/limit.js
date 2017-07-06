import {constants} from "../core/constants";
import {wrap} from "../core/wrap";

import {HeadSequence} from "./head";

export const limit = wrap({
    name: "limit",
    attachSequence: true,
    async: false,
    arguments: {
        unordered: {
            numbers: 1,
            sequences: 1
        }
    },
    implementation: (length, source) => {
        if(source.bounded()){
            return source;
        }else{
            return new HeadSequence(
                isNaN(length) ? constants.defaults.limitLength : length, source
            );
        }
    },
});

export default limit;
