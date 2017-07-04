import {asSequence} from "../core/asSequence";
import map from "./map";

/**
 * Simple abstraction of plural map function.
 */
const zip = () => {
    const sequences = [];
    for(const argument of arguments){
        sequences.push(asSequence(argument));
    }
    const transform = function(){
        return Array.prototype.slice.call(arguments);
    };
    return map(transform, sequences);
};

export default zip;
