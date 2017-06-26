hi.wrap = function(expected, implementation){
    const fancy = hi.wrap.fancy(expected, implementation);
    const method = hi.wrap.method(expected, implementation);
    return {
        expected: expected,
        raw: implementation,
        fancy: fancy,
        method: method,
        fancyAsync: hi.wrap.fancyAsync(fancy),
        methodAsync: method ? hi.wrap.methodAsync(method) : null,
    };
};

Object.assign(hi.wrap, {
    fancy: function(expected, implementation){
        const numbers = hi.args.expectCount(expected.numbers);
        const functions = hi.args.expectCount(expected.functions);
        const sequences = hi.args.expectCount(expected.sequences);
        const validate = function(args){
            const found = hi.args.countTypes(args);
            const counts = hi.args.countSeparated(found);
            if(!hi.args.satisfied(expected, counts)){
                const error = hi.args.describe.discrepancy(expected, counts);
                throw `Error calling function: ${error}`;
            }
        };
        // Function accepts exactly one argument?
        const oneArgument = numbers + functions + sequences === 1;
        // Function accepts arguments of only one type?
        const oneType = (
            (numbers + functions === 0) ||
            (functions + sequences === 0) ||
            (sequences + numbers === 0)
        );
        let fancy = null;
        if(oneArgument){
            if(sequences === 1 && !expected.allowIterables){
                fancy = function(){
                    validate(arguments);
                    return implementation(hi.asSequence(arguments[0]));
                };
            }else{
                fancy = function(){
                    validate(arguments);
                    return implementation(arguments[0]);
                };
            }
        }else if(oneType){
            if(sequences > 0 && !expected.allowIterables){
                fancy = function(){
                    validate(arguments);
                    const sequences = [];
                    for(const arg of arguments) sequences.push(hi.asSequence(arg));
                    return implementation(sequences);
                };
            }else{
                fancy = function(){
                    validate(arguments);
                    return implementation(arguments);
                };
            }
        }
        fancy = fancy || function(){
            return hi.args.validate(
                expected, arguments, implementation, function(error){
                    throw `Error calling function: ${error}`;
                }
            );
        };
        fancy.expected = expected;
        fancy.raw = implementation;
        return fancy;
    },
    method: function(expected, implementation){
        if(hi.args.expectNone(expected.sequences)){
            return null; // Not applicable
        }
        let method = null;
        if(hi.args.expectSingular(expected.sequences)){
            const numbers = hi.args.expectCount(expected.numbers);
            const functions = hi.args.expectCount(expected.functions);
            if(numbers === 0 && functions === 0){
                method = function(){
                    return implementation(this);
                };
            }else if(numbers === 0 || functions === 0){
                const validate = function(args){
                    const found = hi.args.countTypes(args);
                    const counts = hi.args.countSeparated(found);
                    counts.sequences++;
                    if(!hi.args.satisfied(expected, counts)){
                        const error = hi.args.describe.discrepancy(expected, counts);
                        throw `Error calling function: ${error}`;
                    }
                };
                if(numbers === 1 || functions === 1){
                    method = function(){
                        validate(arguments);
                        return implementation(arguments[0], this);
                    };
                }else{
                    method = function(){
                        validate(arguments);
                        return implementation(arguments, this);
                    };
                }
            }
        }
        method = method || function(){
            Array.prototype.splice.call(arguments, 0, 0, this);
            return hi.args.validate(
                expected, arguments, implementation, function(error){
                    throw `Error calling ${name}: ${error}`;
                }
            );
        };
        method.expected = expected;
        method.raw = implementation;
        return method;
    },
    fancyAsync: function(fancy){
        return hi.wrap.async((caller, args) => fancy.apply(caller, args));
    },
    methodAsync: function(method){
        return hi.wrap.async((caller, args) => method.apply(caller, args));
    },
    async: function(callback){
        return function(){
            return new Promise((resolve, reject) => {
                const args = arguments;
                hi.callAsync(() => resolve(callback(this, args)));
            });
        };
    },
});
