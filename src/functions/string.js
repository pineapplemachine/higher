import {validAsBoundedSequence} from "../core/asSequence";

/**
 *
 * @param {*} source
 */
const string = (source) => {
    if(!validAsBoundedSequence(source)){
        throw "Failed to create string: Input sequence is not known to be bounded.";
    }
    let str = "";
    for(const element of source) str += element;
    return str;
};

export const registration = {
    name: "string",
    expected: {

    },
    implementation: string,
};

export default string;
