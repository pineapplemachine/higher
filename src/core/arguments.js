// Important term definition: "Argument expectation token".
// An argument expectation token is a value that tells the arguments handler
// how many arguments of some type to expect. Tokens are associated with a
// type - either numbers, functions, or sequences - and they provide information
// like "there should be exactly one of these" or "there should be none of
// these" or even "there may be any number of these".
// The possible tokens are:
// Any falsey value - No arguments of this type are expected.
// Any number - The exact number of arguments of this type that are expected.
// An array - The first element is a minimum number of arguments of this
// type and the second element is a maximum number of arguments.
// "?" - One or zero arguments of this type are expected.
// "+" - One or more arguments of this type are expected.
// "*" - Any number of arguments of this type are allowed.

hi.args = {
    expectSingular: function(expected){
        return expected === 1 || expected === "?";
    },
    expectNone: function(expected){
        return !expected;
    },
    expectPlural: function(expected){
        return expected && !hi.args.expectSingularArgument(expected);
    },
    // Returns 0 when no arguments of a type are expected.
    // Returns 1 when a singular or null argument is expected.
    // Returns 2 when an array of arguments of a type is expected.
    expectCount: function(expected){
        if(hi.args.expectNone(expected)) return 0; // None
        else if(hi.args.expectSingular(expected)) return 1; // Singular
        else return 2; // Plural
    },
    
    asExpected: function(expected, values){
        return hi.args.expectSingular(expected) ? values[0] : values;
    },
    allAsExpected: function(expected, found){
        return {
            numbers: hi.args.asExpected(expected.numbers, found.numbers),
            functions: hi.args.asExpected(expected.functions, found.functions),
            sequences: hi.args.asExpected(expected.sequences, found.sequences),
        };
    },
    withExpected: function(callback, expected, found){
        const args = [];
        if(expected.numbers) args.push(
            hi.args.asExpected(expected.numbers, found.numbers)
        );
        if(expected.functions) args.push(
            hi.args.asExpected(expected.functions, found.functions)
        );
        if(expected.sequences) args.push(
            hi.args.asExpected(expected.sequences, found.sequences)
        );
        return callback.apply(this, args);
    },
    validate: function(expected, args, callback, error){
        const found = hi.args.separateTypes(args, expected.allowIterables);
        const counts = hi.args.countSeparated(found);
        if(!hi.args.satisfied(expected, counts)){
            return error(hi.args.describe.discrepancy(expected, counts));
        }else{
            return hi.args.withExpected(callback, expected, found);
        }
    },
    
    // Count the occurrences of different argument types.
    countTypes: function(args){
        const found = {
            numbers: 0,
            functions: 0,
            sequences: 0,
            invalid: 0,
        };
        for(const argument of args){
            if(hi.isFunction(argument)) found.functions++;
            else if(hi.validAsSequence(argument)) found.sequences++;
            else if(!isNaN(argument)) found.numbers++;
            else found.invalid++;
        }
        return found;
    },
    // Separate arguments into lists by type.
    // The allowIterables argument determines whether incoming iterables are
    // allowed to enter the returned list as-is, or if they must first be
    // coerced to sequence types.
    separateTypes: function(args, allowIterables = false){
        const found = {
            numbers: [],
            functions: [],
            sequences: [],
            invalid: [],
        };
        for(const argument of args){
            if(hi.isFunction(argument)){
                found.functions.push(argument);
            }else if(hi.validAsSequence(argument)){
                found.sequences.push(
                    allowIterables ? argument : hi.asSequence(argument)
                );
            }else if(!isNaN(argument)){
                found.numbers.push(argument);
            }else{
                found.invalid.push(argument);
            }
        }
        return found;
    },
    countSeparated: function(found){
        return {
            numbers: found.numbers.length,
            functions: found.functions.length,
            sequences: found.sequences.length,
            invalid: found.invalid.length,
        };
    },
    
    // Determine whether a number of found arguments satisfies the expectation.
    // The expected argument should be an expectation token and found should be
    // a number of found arguments of a given type.
    typeSatisfied: function(expected, found){
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
            return false; // Unrecognized token
        }
    },
    satisfied: function(expected, found){
        const satisfied = {
            numbers: hi.args.typeSatisfied(expected.numbers, found.numbers),
            functions: hi.args.typeSatisfied(expected.functions, found.functions),
            sequences: hi.args.typeSatisfied(expected.sequences, found.sequences),
        };
        satisfied.all = (
            satisfied.numbers && satisfied.functions && satisfied.sequences
        );
        return satisfied;
    },
    
    describe: {
        // Join a series of strings with "and"s and commas.
        joinSeries: function(series){
            if(series.length === 0){
                return "";
            }else if(series.length === 1){
                return series[0];
            }else if(series.length === 2){
                return `${series[0]} and ${series[1]}`;
            }else{
                const left = series.slice(0, series.length - 1).join(", ");
                return `${left}, and ${series[series.length - 1]}`;
            }
        },
        expected: function(expected){
            const parts = [];
            if(expected.numbers) parts.push(
                hi.args.describe.expectedNumbers(expected.numbers)
            );
            if(expected.functions) parts.push(
                hi.args.describe.expectedFunctions(expected.functions)
            );
            if(expected.sequences) parts.push(
                hi.args.describe.expectedSequences(expected.sequences)
            );
            return hi.args.describe.joinSeries(parts);
        },
        expectedNumbers: function(expected){
            return hi.args.describe.expectedType(expected, "number", "numbers");
        },
        expectedFunctions: function(expected){
            return hi.args.describe.expectedType(expected, "function", "functions");
        },
        expectedSequences: function(expected){
            return hi.args.describe.expectedType(expected, "sequence", "sequences");
        },
        expectedType: function(expected, singular, plural){
            if(!expected){
                return `no ${plural}`;
            }else if(expected && !isNaN(expected)){
                return `exactly ${expected} ${+expected === 1 ? singular : plural}`;
            }else if(hi.isArray(expected)){
                if(expected[1] === "+"){
                    return `at least ${expected[0]} ${+expected[0] === 1 ? singular : plural}`;
                }else{
                    return `between ${expected[0]} and ${expected[1]} ${plural}`;
                }
            }else if(expected === "*"){
                return `any number of ${plural}`;
            }else if(expected === "+"){
                return `at least one ${plural}`;
            }else if(expected === "?"){
                return `either one or zero ${plural}`;
            }else{
                return "";
            }
        },
        discrepancy: function(expected, found){
            const parts = [];
            if(!hi.args.typeSatisfied(expected.numbers, found.numbers)) parts.push(
                `Expected ${hi.args.describe.expectedNumbers(expected.numbers)} ` +
                `but found ${hi.args.foundCount(found.numbers)}.`
            );
            if(!hi.args.typeSatisfied(expected.functions, found.functions)) parts.push(
                `Expected ${hi.args.describe.expectedFunctions(expected.functions)} ` +
                `but found ${hi.args.foundCount(found.functions)}.`
            );
            if(!hi.args.typeSatisfied(expected.sequences, found.sequences)) parts.push(
                `Expected ${hi.args.describe.expectedSequences(expected.sequences)} ` +
                `but found ${hi.args.foundCount(found.sequences)}.`
            );
            if(found.invalid) parts.push(
                `Found ${found.invalid} ${found.invalid === 1 ? "argument" : "arguments"} ` +
                "that are invalid because they are neither numbers, functions, or sequences." 
            );
            return hi.args.describe.joinSeries(parts);
        },
        foundCount: function(found){
            return `${found ? found : "none"}`;
        },
    },
};

