// Get a sequence for enumerating the last so many elements of the input.
// The resulting sequence may be shorter than the length specified, but
// will never be longer.
hi.register("tail", {
    numbers: 1,
    sequences: 1,
}, function(elements, source){
    if(elements < 1){
        return new hi.EmptySequence();
    }else if(source.length && source.slice){
        let length = source.length();
        let slice = length < elements ? length : elements;
        return source.slice(length - slice, length);
    }else if(source.bounded()){
        let array = source.array();
        return array.slice(array.length - elements);
    }else{
        throw "Failed to get sequence tail: Input is unbounded.";
    }
});
