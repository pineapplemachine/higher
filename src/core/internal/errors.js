function unboundedError(action, method, intermediate = false){
    return (
        `Failed to ${action} the sequence because to do so would require ` +
        "fully consuming an unbounded sequence" +
        (intermediate ? " in an intermediate step." : ". Try passing " +
        `a length limit to the "${method}" call to only store the ` +
        "first so many elements or, if you're sure the sequence will " +
        "eventually end, use the sequence's assumeBounded method " +
        "before collapsing it.")
    );
}

function collapseCopyError(prevType, breakingType){
    return (
        "Collapsing the sequence failed because one of the " +
        `intermediate sequences of type "${prevType}" does ` +
        "not support copying even though it appears before a " +
        `special collapse behavior sequence "${breakingType}".`
    );
}

export {unboundedError, collapseCopyError};
