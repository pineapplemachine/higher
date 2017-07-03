import Sequence from "../core/sequence";

/**
 * Check if a sequence contains an element. Uses the comparison function
 * (a, b) => (a == b). When a different comparison function is needed,
 * use hi.any instead. To search for a substring, use hi.find instead.
 * @param {*} source
 * @param {*} element
 */
const containsElement = function(source, element){
    for(const sourceElement of source){
        if(element == sourceElement) return true;
    }
    return false;
};

const containsElementAsync = function(source, element){
    return new hi.Promise((resolve, reject) => {
        resolve(hi.contains(source, element));
    });
};

Sequence.prototype.containsElement = function(element){
    return hi.contains(this, element);
};

Sequence.prototype.containsElementAsync = function(element){
    return hi.containsAsync(this, element);
};

export default {containsElement, containsElementAsync};
