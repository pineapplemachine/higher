// Get a head sequence if the input is not known to be bounded, otherwise
// return that sequence.
hi.register("limit", {
    numbers: "?",
    sequences: 1,
}, function(length, source){
    if(source.bounded()){
        return source;
    }else{
        return source.head(isNaN(length) ? hi.defaultLimitLength : length);
    }
});
