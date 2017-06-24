hi.internal.wrap = {
    fancy: function(name, expected, implementation){
        const numbers = hi.args.expectCount(expected.numbers);
        const functions = hi.args.expectCount(expected.functions);
        const sequences = hi.args.expectCount(expected.sequences);
        const validate = function(args){
            const found = hi.args.countTypes(args);
            const counts = hi.args.countSeparated(found);
            if(!hi.args.satisfied(expected, counts)){
                let error = hi.args.describe.discrepancy(expected, counts);
                throw `Error calling ${name}: ${error}`;
            }
        };
        if(numbers + functions + sequences === 1){
            if(sequences === 1 && !expected.allowIterables){
                return function(){
                    validate(arguments);
                    return implementation(hi.asSequence(arguments[0]));
                };
            }else{
                return function(){
                    validate(arguments);
                    return implementation(arguments[0]);
                };
            }
        }else if(
            (numbers + functions === 0) ||
            (functions + sequences === 0) ||
            (sequences + numbers === 0)
        ){
            if(sequences > 0 && !expected.allowIterables){
                return function(){
                    validate(arguments);
                    let sequences = [];
                    for(let arg of arguments) sequences.push(hi.asSequence(arg));
                    return implementation(sequences);
                };
            }else{
                return function(){
                    validate(arguments);
                    return implementation(arguments);
                };
            }
        }
        return function(){
            return hi.args.validate(
                expected, arguments, implementation, function(error){
                    throw `Error calling ${name}: ${error}`;
                }
            );
        };
    },
    sequenceMethod: function(name, expected, implementation){
        if(hi.args.expectSingular(expected.sequences)){
            const numbers = hi.args.expectCount(expected.numbers);
            const functions = hi.args.expectCount(expected.functions);
            if(numbers === 0 && functions === 0){
                return function(){
                    return implementation(this);
                };
            }else if(numbers === 0 || functions === 0){
                const validate = function(args){
                    const found = hi.args.countTypes(args);
                    const counts = hi.args.countSeparated(found);
                    counts.sequences++;
                    if(!hi.args.satisfied(expected, counts)){
                        let error = hi.args.describe.discrepancy(expected, counts);
                        throw `Error calling ${name}: ${error}`;
                    }
                };
                if(numbers === 1 || functions === 1){
                    return function(){
                        validate(arguments);
                        return implementation(arguments[0], this);
                    };
                }else{
                    return function(){
                        validate(arguments);
                        return implementation(arguments, this);
                    };
                }
            }
        }
        return function(){
            Array.prototype.splice.call(arguments, 0, 0, this)
            return hi.args.validate(
                expected, arguments, implementation, function(error){
                    throw `Error calling ${name}: ${error}`;
                }
            );
        };
    },
    async: function(callback){
        return function(){
            return new Promise((resolve, reject) => {
                let args = arguments;
                hi.callAsync(() => resolve(callback(this, args)));
            });
        };
    },
};
