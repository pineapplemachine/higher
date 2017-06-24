const getPrototypeWrapperFunction = function(name, expected, implementation){
    if(expectSingularArgument(expected.sequences)){
        const numbers = expectArgumentCountType(expected.numbers);
        const functions = expectArgumentCountType(expected.functions);
        if(numbers === 0 && functions === 0){
            return function(){
                return implementation(this);
            };
        }else if(numbers === 0 || functions === 0){
            const validate = function(args){
                const found = countArgumentTypes(args);
                const error = compareExpectedArguments(
                    expected, found.numbers, found.functions,
                    1 + found.sequences, found.invalid
                );
                if(error) throw (
                    `Error validating arguments for function "${name}": ${error}`
                );
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
        return validateArguments(expected, arguments, implementation, function(error){
            throw `Error validating arguments for function "${name}": ${error}`;
        });
    };
};

const getFancyWrapperFunction = function(name, expected, implementation){
    const numbers = expectArgumentCountType(expected.numbers);
    const functions = expectArgumentCountType(expected.functions);
    const sequences = expectArgumentCountType(expected.sequences);
    const validate = function(args){
        const found = countArgumentTypes(args);
        const error = compareExpectedArguments(
            expected, found.numbers, found.functions,
            found.sequences, found.invalid
        );
        if(error) throw (
            `Error validating arguments for function "${name}": ${error}`
        );
    };
    if(numbers + functions + sequences === 1){
        if(sequences === 1 && !expected.allowIterables){
            return function(){
                validate(arguments);
                return implementation(asSequence(arguments[0]));
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
                for(let arg of arguments) sequences.push(asSequence(arg));
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
        return validateArguments(expected, arguments, implementation, function(error){
            throw `Error validating arguments for function "${name}": ${error}`;
        });
    };
};

const getAsyncWrapperFunction = function(callback){
    return function(){
        return new Promise((resolve, reject) => {
            let args = arguments;
            hi.callAsync(() => resolve(callback(this, args)));
        });
    };
};

const hi = {
    version: "0.1.0",
    
    isSequence: isSequence,
    asSequence: asSequence,
    seq: asSequence,
    
    registeredFunctions: [],
    register: function(name, expected, implementation){
        let register = {
            name: name,
            expected: expected,
            implementation: implementation,
            fancy: getFancyWrapperFunction(name, expected, implementation),
        };
        this[name] = register.fancy;
        if(!expectNoArgument(expected.sequences)){
            prototypeMethod = getPrototypeWrapperFunction(
                name, expected, implementation
            );
            Sequence.prototype[name] = prototypeMethod;
            register.prototypeMethod = prototypeMethod;
        }
        if(expected.async){
            const fancyAsync = getAsyncWrapperFunction(
                (caller, args) => fancy.apply(caller, args)
            );
            this[name + "Async"] = fancyAsync;
            register.fancyAsync = fancyAsync;
        }
        if(expected.async && register.prototypeMethod){
            const protoAsync = getAsyncWrapperFunction(
                (caller, args) => prototypeMethod.apply(caller, args)
            );
            Sequence.prototype[name + "Async"] = protoAsync;
            register.prototypeMethodAsync = protoAsync;
        }
        this.registeredFunctions.push(register);
        return register.fancy;
    },
    alias: function(name, alias){
        if(name in this){
            this[alias] = this[name];
        }
        if(name + "Async" in this){
            this[alias + "Async"] = this[name + "Async"];
        }
    },
};

if(typeof window === "undefined"){
    hi.callAsync = function(callback){
        process.nextTick(callback);
    };
    exports.hi = hi;
}else{
    hi.callAsync = function(callback){
        setTimeout(callback, 0);
    };
    window.hi = hi;
}
