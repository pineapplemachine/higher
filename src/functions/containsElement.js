import {expecting, wrap} from "../core/wrap";

// Check if a sequence contains an element. Uses the comparison function
// (a, b) => (a === b). When a different comparison function is needed,
// use hi.any instead. To search for a substring, use hi.find instead.
export const containsElement = wrap({
    name: "containsElement",
    attachSequence: true,
    async: true,
    arguments: {
        ordered: [expecting.iterable, expecting.anything]
    },
    implementation: (source, element) => {
        for(const sourceElement of source){
            if(element === sourceElement) return true;
        }
        return false;
    },
});

export default containsElement;
