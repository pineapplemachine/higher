const assertMessage = (message, condition) => (hi.isFunction(message) ?
    message(condition) : (message || "Assertion error")
);

hi.AssertError = function(message, value = undefined){
    this.message = message;
    this.value = value;
};

hi.AssertError.prototype = Object.create(Error.prototype);
hi.AssertError.prototype.constructor = hi.AssertError;

hi.assert = function(condition, message = undefined){
    if(!condition) throw new hi.AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

hi.assertNot = function(condition, message = undefined){
    if(condition) throw new hi.AssertError(
        assertMessage(message, condition), condition
    );
    return condition;
};

hi.assertEqual = function(...values){
    for(let i = 1; i < values.length; i++){
        if(values[i] !== values[0]) throw new hi.AssertError(
            "Values must be equal.", values
        );
    }
    return values[0];
};
