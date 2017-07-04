import {EmptySequence} from "./empty";

/**
 * Get a sequence for enumerating the last so many elements of the input.
 * The resulting sequence may be shorter than the length specified, but
 * will never be longer.
 * @param {*} elements
 * @param {*} source
 */
const tail = (elements, source) => {
    if(elements < 1){
        return new EmptySequence();
    }else if(source.length && source.slice){
        const length = source.length();
        const slice = length < elements ? length : elements;
        return source.slice(length - slice, length);
    }else if(source.bounded()){
        const array = source.array();
        return array.slice(array.length - elements);
    }else{
        throw "Failed to get sequence tail: Input is unbounded.";
    }
};

export const registration = {
    name: "tail",
    expected: {
        numbers: 1,
        sequences: 1,
    },
    implementation: tail,
};

export default tail;
