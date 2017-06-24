// Important term definition: "Argument expectation token".
// An argument expectation token is a value that tells the arguments handler
// how many arguments of some type to expect. Tokens are associated with a
// type - either numbers, functions, or sequences - and they provide information
// like "there should be exactly one of these" or "there should be none of
// these" or even "there may be any number of these".
// The possible tokens are:
// Any falsey value - No arguments of this type are expected.
// Any number - The exact number of arguments of this type that are expected.
// "?" - One or zero arguments of this type are expected.
// "+" - One or more arguments of this type are expected.
// "*" - Any number of arguments of this type are allowed.

// True when an expected argument token indicates that a singular or null
// argument should be passed.
const expectSingularArgument = function(expected){
    return expected === 1 || expected === "?";
};
// True when an expected argument token indicates that no arguments of the
// given type should be passed.
const expectNoArgument = function(expected){
    return !expected;
};
// True when an expected argument token indicates that an array of arguments
// of the given type should be passed.
const expectPluralArgument = function(expected){
    return expected && !expectSingularArgument(expected);
};
// Returns 0 when no arguments of a type are expected,
// returns 1 when a singular or null argument is expected,
// returns 2 when an array of arguments of a type is expected.
const expectArgumentCountType = function(expected){
    if(expectNoArgument(expected)) return 0; // None
    else if(expectSingularArgument(expected)) return 1; // Singular
    else return 2; // Plural
};

// Get an English description of how many numeric arguments are expected.
const expectedNumbersDescriptionString = function(expected){
    return expectedDescriptionStringPart(expected.numbers, "number", "numbers");
};
// Get an English description of how many function arguments are expected.
const expectedFunctionsDescriptionString = function(expected){
    return expectedDescriptionStringPart(expected.functions, "function", "functions");
};
// Get an English description of how many sequence arguments are expected.
const expectedSequencesDescriptionString = function(expected){
    return expectedDescriptionStringPart(expected.sequences, "sequence", "sequences");
};
// Get an English description of how many arguments of a type are expected.
const expectedDescriptionStringPart = function(expected, singular, plural){
    if(!expected){
        return `no ${plural}`;
    }else if(expected && !isNaN(expected)){
        return `exactly ${expected} ${+expected === 1 ? singular : plural}`;
    }else if(hi.isArray(expected)){
        return `between ${expected[0]} and ${expected[1]} ${plural}`;
    }else if(expected === "*"){
        return `any number of ${plural}`;
    }else if(expected === "+"){
        return `at least one ${plural}`;
    }else if(expected === "?"){
        return `either one or zero ${plural}`;
    }
};
// Get an English description of what argument types are expected, and how many.
const expectedDescriptionString = function(expected){
    let parts = [];
    if(expected.numbers) parts.push(
        expectedNumbersDescriptionString(expected.numbers)
    );
    if(expected.functions) parts.push(
        expectedFunctionsDescriptionString(expected.functions)
    )
    if(expected.sequences) parts.push(
        expectedSequencesDescriptionString(expected.sequences)
    )
    if(parts.length === 0){
        return "";
    }else if(parts.length === 1){
        return parts[0];
    }else{
        return (
            parts.slice(0, parts.length - 1).join(", ") +
            ", and " + parts[parts.length - 1]
        );
    }
};
// Get an English name for an argument type, one of "number", "function",
// "sequence", or "invalid".
const getArgumentTypeName = function(argument){
    if(hi.isFunction(argument)) return "function";
    else if(hi.validAsSequence(argument)) return "sequence";
    else if(!isNaN(argument)) return "number";
    else return "invalid";
};

// True when the number of found arguments of a type satisfies a given
// argument expectation token.
const getExpectedArgumentsSatisfied = function(expected, found){
    if(!expected){
        return found === 0;
    }else if(!isNaN(expected)){
        return found === +expected;
    }else if(hi.isArray(expected)){
        return found >= expected[0] && found <= expected[1];
    }else if(expected === "+"){
        return found >= 1;
    }else if(expected === "?"){
        return found <= 1;
    }else if(expected === "*"){
        return true;
    }else{
        throw `Encountered invalid argument expectation token "${expected}".`;
    }
};

const compareExpectedNumbers = function(expected, found){
    return compareExpectedArgumentsType(expected, found, "number", "numbers");
};
const compareExpectedFunctions = function(expected, found){
    return compareExpectedArgumentsType(expected, found, "function", "functions");
};
const compareExpectedSequences = function(expected, found){
    return compareExpectedArgumentsType(expected, found, "sequence", "sequences");
};
const compareExpectedInvalid = function(found){
    return found === 0 ? null : (
        `Found ${invalid} ${invalid === 1 ? "argument" : "arguments"} that ` +
        `are neither numbers, functions, or sequences.`
    );
}
const compareExpectedArgumentsType = function(expected, found, singular, plural){
    if(!getExpectedArgumentsSatisfied(expected, found)) return (
        `Expected ${expectedDescriptionStringPart(expected, singular, plural)} ` +
        `but found ${found === 0 ? "none" : found}.`
    );
};
// Get whether the numbers of arguments of the given types match what's
// expected. Returns null if so and a truthy error message string if not.
const compareExpectedArguments = function(
    expected, numbers, functions, sequences, invalid = 0
){
    let numbersPart = compareExpectedNumbers(expected.numbers, numbers);
    let functionsPart = compareExpectedFunctions(expected.functions, functions);
    let sequencesPart = compareExpectedSequences(expected.sequences, sequences);
    let invalidPart = compareExpectedInvalid(invalid);
    if(numbersPart || functionsPart || sequencesPart || invalidPart){
        let parts = [];
        if(numbersPart) parts.push(numbersPart);
        if(functionsPart) parts.push(functionsPart);
        if(sequencesPart) parts.push(sequencesPart);
        if(invalidPart) parts.push(invalidPart);
        return parts.join(" ");
    }else{
        return null;
    }
};

// Get a count of each valid argument type, and also a count of how many
// invalid arguments there were.
const countArgumentTypes = function(args){
    let numbers = 0;
    let functions = 0;
    let sequences = 0;
    let invalid = 0;
    for(let argument of args){
        if(hi.isFunction(argument)) functions++;
        else if(hi.validAsSequence(argument)) sequences++;
        else if(!isNaN(argument)) numbers++;
        else invalid++;
    }
    return {
        numbers: numbers,
        functions: functions,
        sequences: sequences,
        invalid: invalid,
    };
};
// Separate arguments into number, function, sequence, and invalid lists.
// The allowIterables flag determines whether arbitrary iterables are
// coerced to sequences when adding them to the sequences list or if they
// are added as-is.
const separateArgumentTypes = function(args, allowIterables){
    let numbers = [];
    let functions = [];
    let sequences = [];
    let invalid = [];
    for(let argument of args){
        if(hi.isFunction(argument)){
            functions.push(argument);
        }else if(hi.validAsSequence(argument)){
            sequences.push(allowIterables ? argument : hi.asSequence(argument));
        }else if(!isNaN(argument)){
            numbers.push(+argument);
        }else{
            invalid.push(argument);
        }
    }
    return {
        numbers: numbers,
        functions: functions,
        sequences: sequences,
        invalid: invalid,
    };
};

const getExpectedArgument = function(expected, values){
    return expectSingularArgument(expected) ? values[0] : values;
};
const withExpectedArguments = function(
    callback, expected, numbers, functions, sequences
){
    // TODO: Is all this really worth it just to avoid building an array?
    if(expected.numbers){
        if(expected.functions){
            if(expected.sequences) return callback(
                getExpectedArgument(expected.numbers, numbers),
                getExpectedArgument(expected.functions, functions),
                getExpectedArgument(expected.sequences, sequences)
            );
            else return callback(
                getExpectedArgument(expected.numbers, numbers),
                getExpectedArgument(expected.functions, functions)
            );
        }else if(expected.sequences){
            return callback(
                getExpectedArgument(expected.numbers, numbers),
                getExpectedArgument(expected.sequences, sequences)
            );
        }else{
            return callback(
                getExpectedArgument(expected.numbers, numbers)
            );
        }
    }else if(expected.functions){
        if(expected.sequences) return callback(
            getExpectedArgument(expected.functions, functions),
            getExpectedArgument(expected.sequences, sequences)
        );
        else return callback(
            getExpectedArgument(expected.functions, functions)
        );
    }else if(expected.sequences){
        return callback(
            getExpectedArgument(expected.sequences, sequences)
        );
    }else{
        return callback();
    }
    // let args = [];
    // if(expected.numbers) args.push(
    //     getExpectedArgument(expected.numbers, numbers)
    // );
    // if(expected.functions) args.push(
    //     getExpectedArgument(expected.functions, functions)
    // );
    // if(expected.sequences) args.push(
    //     getExpectedArgument(expected.sequences, sequences)
    // );
    // return callback.apply(this, args);
};

// Given an arguments object, an object describing the expected arguments,
// call the callback when those requirements are met and throw an error
// otherwise.
// TODO: Document success callback arguments
const validateArguments = function(expected, args, success, error){
    let expectedNumbers = expected.numbers || 0;
    let expectedFunctions = expected.functions || 0;
    let expectedSequences = expected.sequences || 0;
    let inputs = separateArgumentTypes(args, expected.allowIterables);
    let errorMessage = compareExpectedArguments(
        expected, inputs.numbers.length, inputs.functions.length,
        inputs.sequences.length, inputs.invalid.length
    );
    if(errorMessage){
        return error(errorMessage);
    }else{
        return withExpectedArguments(
            success, expected, inputs.numbers,
            inputs.functions, inputs.sequences
        );
    }
}
