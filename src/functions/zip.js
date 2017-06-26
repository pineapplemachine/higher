// Simple abstraction of plural map function.
hi.zip = function(){
    const sequences = [];
    for(const argument of arguments){
        sequences.push(hi.asSequence(argument));
    }
    const transform = function(){
        return Array.prototype.slice.call(arguments);
    };
    return hi.map.raw(transform, sequences);
};
