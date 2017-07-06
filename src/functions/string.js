import {validAsBoundedSequence} from "../core/asSequence";
import {expecting, wrap} from "../core/wrap";

export const string = wrap({
    name: "string",
    attachSequence: true,
    async: true,
    arguments: {
        one: expecting.iterable
    },
    implementation: (source) => {
        if(!validAsBoundedSequence(source)){
            throw "Failed to create string: Input sequence must be known to be bounded.";
        }
        let str = "";
        for(const element of source) str += element;
        return str;
    },
});

export default string;
