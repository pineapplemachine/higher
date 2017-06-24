// Simple abstraction of plural map function.
hi.zip = function(){
    let sequences = [];
    for(let argument of arguments){
        sequences.push(hi.asSequence(argument));
    }
    let transform = function(){
        return Array.prototype.slice.call(arguments);
    };
    return hi.map.raw(transform, sequences);
}
