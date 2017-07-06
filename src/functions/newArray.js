import {isArray} from "../core/types";
import {wrap} from "../core/wrap";

import {asArray} from "./array";

export const newArray = wrap({
    name: "newArray",
    attachSequence: true,
    async: true,
    arguments: {
        unordered: {
            allowIterables: true
            numbers: "?",
            sequences: 1,
        }
    },
    implementation: (limit, source) => {
        if(limit <= 0){
            return [];
        }else if(isArray(source)){
            return (!limit || limit >= source.length ?
                source.slice() : source.slice(limit)
            );
        }else{
            return asArray(limit, source);
        }
    },
});

export default newArray;
